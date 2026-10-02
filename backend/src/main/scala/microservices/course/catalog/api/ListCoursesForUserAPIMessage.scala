// 文件说明：后端课程目录接口实现，用于处理列表查询CoursesFor用户请求并返回类型安全响应。
package microservices.course.catalog.api

import cats.effect.IO
import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}
import microservices.admin.tables.CourseAuditTable
import microservices.auth.objects.{UserProfile, UserRole}
import microservices.course.catalog.objects.*
import microservices.course.catalog.tables.{CourseCatalogQueryTable, CourseStructureProjectionTable, CourseTable}
import microservices.course.learning.api.{ResolveLessonProgressAPIMessage, ResolveLessonStudyRecordsAPIMessage}
import microservices.course.learning.objects.LessonStudyRecord
import system.api.{ConnectionAPIMessage, ConnectionApiMessageSchema}

import java.sql.Connection

final case class ListCoursesForUserAPIMessage(
  currentUser: UserProfile
) extends ConnectionAPIMessage[List[Course]]:
  override def plan(connection: Connection): IO[List[Course]] =
    for
      progressByLesson <- ResolveLessonProgressAPIMessage(currentUser).plan(connection)
      studyRecordsByLesson <- ResolveLessonStudyRecordsAPIMessage(currentUser).plan(connection)
      courses <- ListCoursesForUserAPIMessage.listCoursesForUser(connection, currentUser, progressByLesson, studyRecordsByLesson)
    yield courses

object ListCoursesForUserAPIMessage:
  val inputDecoder: Decoder[ListCoursesForUserAPIMessage] = deriveDecoder[ListCoursesForUserAPIMessage]
  val outputEncoder: Encoder[List[Course]] = deriveEncoder[List[Course]]
  val schema: ConnectionApiMessageSchema[ListCoursesForUserAPIMessage, List[Course]] = ConnectionApiMessageSchema(
    name = "ListCoursesForUserAPIMessage",
    inputDecoder = inputDecoder,
    outputEncoder = outputEncoder,
    execute = (input, connection) => input.plan(connection)
  )
  given Decoder[ListCoursesForUserAPIMessage] = inputDecoder
  given Encoder[ListCoursesForUserAPIMessage] = deriveEncoder[ListCoursesForUserAPIMessage]

  private[catalog] def listCoursesForUser(
    connection: Connection,
    currentUser: UserProfile,
    progressByLesson: Map[String, Boolean],
    studyRecordsByLesson: Map[String, LessonStudyRecord]
  ): IO[List[Course]] =
    for
      courseRows <- CourseCatalogQueryTable.listCourseRows(connection)
      auditRows <- CourseAuditTable.listAuditRows(connection)
      modules <- listModulesForUser(connection, currentUser, progressByLesson, studyRecordsByLesson)
      enrollments <- CourseCatalogQueryTable.listCourseEnrollments(connection)
      enrolledCountByCourse = enrollments.filter(_.status == "enrolled").groupBy(_.courseId).view.mapValues(_.size).toMap
    yield courseRows.map { courseRow =>
      val courseModules = modules.getOrElse(courseRow.id, Nil)
      val auditRow = auditRows.get(courseRow.id)
      val computedCompletionRate =
        if currentUser.role == UserRole.Student then
          val lessons = courseModules.flatMap(_.lessons)
          if lessons.isEmpty then 0
          else Math.round(lessons.count(_.completed).toDouble / lessons.size * 100).toInt
        else courseRow.completionRate
      Course(
        id = courseRow.id,
        title = courseRow.title,
        subtitle = courseRow.subtitle,
        category = courseRow.category,
        grade = courseRow.grade,
        schedule = courseRow.schedule,
        lessonsCount = courseModules.flatMap(_.lessons).size,
        price = courseRow.price,
        rating = courseRow.rating,
        completionRate = computedCompletionRate,
        enrolledCount = enrolledCountByCourse.getOrElse(courseRow.id, 0),
        status = courseRow.status,
        auditStatus = auditRow.map(_.auditStatus).getOrElse(defaultAuditStatusForCourseStatus(courseRow.status)),
        auditComment = auditRow.flatMap(_.auditComment),
        auditedBy = auditRow.flatMap(_.auditedBy),
        auditedAt = auditRow.flatMap(_.auditedAt),
        teacherId = courseRow.teacherId,
        assistants = CourseTable.decodeUserIdCsv(courseRow.assistants),
        semesterLabel = courseRow.semesterLabel,
        offeringCode = courseRow.offeringCode,
        startsAt = courseRow.startsAt,
        endsAt = courseRow.endsAt,
        academicClassIds = CourseTable.decodeUserIdCsv(courseRow.academicClassIds),
        capacity = courseRow.capacity,
        enrollmentPolicy = EnrollmentPolicy(
          requiresApproval = courseRow.enrollmentRequiresApproval,
          openAt = courseRow.enrollmentOpenAt,
          closeAt = courseRow.enrollmentCloseAt,
          waitlistEnabled = courseRow.waitlistEnabled,
          inviteCode = courseRow.enrollmentInviteCode
        ),
        tags = CourseTable.decodeCsv(courseRow.tags),
        description = courseRow.description,
        coverImageUrl = courseRow.coverImageUrl,
        modules = courseModules
      )
    }

  private def listModulesForUser(
    connection: Connection,
    currentUser: UserProfile,
    progressByLesson: Map[String, Boolean],
    studyRecordsByLesson: Map[String, LessonStudyRecord]
  ): IO[Map[String, List[CourseModule]]] =
    for
      moduleRows <- CourseStructureProjectionTable.listModuleRows(connection)
      lessonRows <- CourseStructureProjectionTable.listLessonRows(connection)
      lessonsByModule = lessonRows.groupBy(_.moduleId).view.mapValues(_.map { lessonRow =>
        val completed =
          if currentUser.role == UserRole.Student then progressByLesson.getOrElse(lessonRow.lesson.id, false)
          else lessonRow.lesson.completed
        val isLocked =
          if currentUser.role == UserRole.Student then
            lessonRow.lesson.unlockAfterLessonId.exists(prerequisiteId => !progressByLesson.getOrElse(prerequisiteId, false))
          else false
        lessonRow.lesson.copy(
          completed = completed,
          isLocked = isLocked,
          studyRecord = studyRecordsByLesson.get(lessonRow.lesson.id)
        )
      }).toMap
      modulesByCourse = moduleRows.groupBy(_.courseId).view.mapValues(_.map { moduleRow =>
        CourseModule(
          id = moduleRow.id,
          title = moduleRow.title,
          lessons = lessonsByModule.getOrElse(moduleRow.id, Nil)
        )
      }).toMap
    yield modulesByCourse

  private def defaultAuditStatusForCourseStatus(status: CourseStatus): CourseAuditStatus =
    status match
      case CourseStatus.Published => CourseAuditStatus.Approved
      case _ => CourseAuditStatus.Pending
