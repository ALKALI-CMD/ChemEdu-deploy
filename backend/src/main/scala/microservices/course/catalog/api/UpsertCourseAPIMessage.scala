// 文件说明：后端课程目录接口实现，用于处理新增或更新课程请求并返回类型安全响应。
package microservices.course.catalog.api


import microservices.admin.objects.apiTypes.*
import microservices.auth.objects.apiTypes.*
import microservices.course.catalog.objects.apiTypes.*
import microservices.course.discussion.objects.apiTypes.*
import microservices.course.learning.objects.apiTypes.*
import microservices.course.review.objects.apiTypes.*
import microservices.dashboard.objects.apiTypes.*
import cats.effect.IO
import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}
import microservices.auth.api.RequireSessionUserAPIMessage
import microservices.auth.objects.{UserProfile, UserRole}
import microservices.admin.tables.OrganizationTable
import microservices.course.catalog.tables.CourseAuthoringTable
import microservices.course.catalog.tables.{CourseCatalogQueryTable, CourseTable}
import microservices.course.catalog.objects.{Course, CourseLessonInput, CourseModuleInput, DeleteCourseData, EnrollmentPolicy, UpdateCourseStatusData, UpsertCourseData}
import microservices.course.catalog.objects.apiTypes.{CourseMutationResponse, MessageResponse}
import system.api.{ConnectionAPIMessage, ConnectionApiMessageSchema}
import microservices.course.catalog.objects.CourseStatus

import java.sql.Connection

final case class UpsertCourseAPIMessage(
  sessionToken: String,
  courseId: Option[String],
  title: String,
  subtitle: String,
  category: String,
  grade: String,
  schedule: String,
  price: Int,
  rating: Double,
  completionRate: Int,
  status: CourseStatus,
  teacherId: Option[String],
  assistants: List[String],
  semesterLabel: Option[String],
  offeringCode: Option[String],
  startsAt: Option[String],
  endsAt: Option[String],
  academicClassIds: List[String],
  capacity: Int,
  enrollmentPolicy: EnrollmentPolicy,
  tags: List[String],
  description: String,
  coverImageUrl: Option[String],
  modules: List[CourseModuleInput]
) extends ConnectionAPIMessage[CourseMutationResponse]:
  override def plan(connection: Connection): IO[CourseMutationResponse] =
    UpsertCourseAPIMessage.schema.execute(this, connection)



object UpsertCourseAPIMessage:
  val inputDecoder: Decoder[UpsertCourseAPIMessage] = deriveDecoder[UpsertCourseAPIMessage]
  val outputEncoder: Encoder[CourseMutationResponse] = deriveEncoder[CourseMutationResponse]
  val schema: ConnectionApiMessageSchema[UpsertCourseAPIMessage, CourseMutationResponse] = ConnectionApiMessageSchema(
    name = "UpsertCourseAPIMessage",
    inputDecoder = inputDecoder,
    outputEncoder = outputEncoder,
    execute = (input, connection) =>
          for
            currentUser <- RequireSessionUserAPIMessage(input.sessionToken).plan(connection)
            course <- upsertCourseForUser(
              connection,
              currentUser,
              UpsertCourseData(
                courseId = input.courseId,
                title = input.title,
                subtitle = input.subtitle,
                category = input.category,
                grade = input.grade,
                schedule = input.schedule,
                price = input.price,
                rating = input.rating,
                completionRate = input.completionRate,
                status = input.status,
                teacherId = input.teacherId,
                assistants = input.assistants,
                semesterLabel = input.semesterLabel,
                offeringCode = input.offeringCode,
                startsAt = input.startsAt,
                endsAt = input.endsAt,
                academicClassIds = input.academicClassIds,
                capacity = input.capacity,
                enrollmentPolicy = input.enrollmentPolicy,
                tags = input.tags,
                description = input.description,
                coverImageUrl = input.coverImageUrl,
                modules = input.modules
              )
            )
          yield CourseMutationResponse(
            message = s"Course ${course.title} saved.",
            course = course
          )
  )

  private def upsertCourseForUser(
    connection: Connection,
    actor: UserProfile,
    request: UpsertCourseData
  ): IO[Course] =
    for
      _ <- authorizeCourseManager(actor)
      courseId = request.courseId.getOrElse(CourseTable.generateId("course"))
      teacherId = resolveTeacherId(actor, request.teacherId)
      effectiveStatus = normalizeCourseStatusForActor(actor, request.status)
      _ <- validateTeacherAccess(connection, actor, teacherId, request.courseId)
      existingCourse <- request.courseId match
        case Some(existingCourseId) => CourseCatalogQueryTable.findCourseRow(connection, existingCourseId)
        case None => IO.pure(None)
      academicClasses <- OrganizationTable.listAcademicClasses(connection)
      totalAcademicClassCapacity =
        if request.academicClassIds.isEmpty then 0
        else academicClasses.filter(academicClass => request.academicClassIds.contains(academicClass.id)).map(_.capacity).sum
      _ <- IO.raiseWhen(request.academicClassIds.nonEmpty && request.capacity > totalAcademicClassCapacity)(
        new IllegalArgumentException("Course capacity cannot exceed the total capacity of assigned academic classes.")
      )
      currentEnrolledCount <- request.courseId match
        case Some(existingCourseId) => CourseTable.countActiveCourseEnrollments(connection, existingCourseId)
        case None => IO.pure(0)
      _ <- IO.raiseWhen(request.academicClassIds.nonEmpty && currentEnrolledCount > totalAcademicClassCapacity)(
        new IllegalArgumentException("Current enrolled count exceeds the total capacity of assigned academic classes.")
      )
      savedCourse <-
        if actor.role == UserRole.Teacher && existingCourse.exists(_.status == CourseStatus.Published) then
          for
            _ <- CourseAuthoringTable.storePendingCourseRevision(connection, courseId, request.copy(courseId = Some(courseId), status = CourseStatus.Published))
            course <- FindCourseByIdAPIMessage.findCourseByIdForUser(connection, courseId, actor, Map.empty, Map.empty)
            saved <- IO.fromOption(course)(
              new IllegalStateException("Course revision submitted successfully but current course could not be reloaded.")
            )
          yield saved
        else
          for
            _ <- CourseAuthoringTable.applyCourseUpsert(connection, courseId, teacherId, effectiveStatus, request)
            _ <- CourseAuthoringTable.clearCourseStructure(connection, courseId)
            _ <- CourseAuthoringTable.insertModules(connection, courseId, request.modules)
            _ <- syncCourseAuditStateAfterUpsert(connection, actor, courseId, effectiveStatus)
            course <- FindCourseByIdAPIMessage.findCourseByIdForUser(connection, courseId, actor, Map.empty, Map.empty)
            saved <- IO.fromOption(course)(
              new IllegalStateException("Course saved successfully but could not be reloaded.")
            )
          yield saved
    yield savedCourse

  private def authorizeCourseManager(user: UserProfile): IO[Unit] =
    if user.role == UserRole.Teacher || user.role == UserRole.Admin then IO.unit
    else IO.raiseError(new IllegalArgumentException("Only teachers or admins can manage courses."))

  private def resolveTeacherId(actor: UserProfile, requestedTeacherId: Option[String]): String =
    if actor.role == UserRole.Teacher then actor.id else requestedTeacherId.getOrElse(actor.id)

  private def validateTeacherAccess(
    connection: Connection,
    actor: UserProfile,
    teacherId: String,
    courseId: Option[String]
  ): IO[Unit] =
    for
      _ <-
        if actor.role == UserRole.Teacher && teacherId != actor.id then
          IO.raiseError(new IllegalArgumentException("Teachers can only manage their own courses."))
        else IO.unit
      _ <- courseId match
        case Some(existingCourseId) =>
          CourseCatalogQueryTable.findCourseRow(connection, existingCourseId).flatMap {
            case Some(row) => validateCourseOwner(actor, row.teacherId)
            case None => IO.raiseError(new IllegalArgumentException("Course does not exist."))
          }
        case None => IO.unit
    yield ()

  private def validateCourseOwner(actor: UserProfile, teacherId: String): IO[Unit] =
    if actor.role == UserRole.Admin || actor.id == teacherId then IO.unit
    else IO.raiseError(new IllegalArgumentException("You do not have permission to modify this course."))

  private def normalizeCourseStatusForActor(actor: UserProfile, requestedStatus: CourseStatus): CourseStatus =
    if actor.role == UserRole.Admin then requestedStatus
    else if requestedStatus == CourseStatus.Published then CourseStatus.Draft
    else requestedStatus

  private def syncCourseAuditStateAfterUpsert(
    connection: Connection,
    actor: UserProfile,
    courseId: String,
    courseStatus: CourseStatus
  ): IO[Unit] =
    actor.role match
      case UserRole.Admin =>
        courseStatus match
          case CourseStatus.Published =>
            CourseAuthoringTable.upsertCourseAuditRow(
              connection,
              courseId,
              microservices.course.catalog.objects.CourseAuditStatus.Approved,
              "Published directly by an administrator.",
              Some(actor.name),
              Some(java.time.Instant.now().toString)
            )
          case _ => IO.unit
      case _ =>
        CourseAuthoringTable.upsertCourseAuditRow(
          connection,
          courseId,
          microservices.course.catalog.objects.CourseAuditStatus.Pending,
          "Awaiting administrator review before publication.",
          None,
          None
        )
  given Decoder[UpsertCourseAPIMessage] = inputDecoder
  given Encoder[UpsertCourseAPIMessage] = deriveEncoder[UpsertCourseAPIMessage]


