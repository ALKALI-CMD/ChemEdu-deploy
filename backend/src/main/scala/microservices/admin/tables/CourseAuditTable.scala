package microservices.admin.tables

import cats.effect.IO
import io.circe.parser.decode
import io.circe.syntax.*
import microservices.course.catalog.objects.*

import java.sql.{Connection, PreparedStatement, ResultSet, Timestamp}
import java.time.Instant

object CourseAuditTable:

  val schemaStatements: List[String] = List(
    """
      |create table if not exists edu_course_audits (
      |  course_id varchar(64) primary key references edu_courses(id) on delete cascade,
      |  audit_status varchar(32) not null,
      |  audit_comment text not null,
      |  audited_by varchar(120),
      |  audited_at varchar(80)
      |);
      |""".stripMargin,
    "alter table edu_course_audits add column if not exists pending_course_payload text"
  )

  val seedStatements: List[String] = List(
    """
      |insert into edu_course_audits (course_id, audit_status, audit_comment, audited_by, audited_at)
      |values
      |  ('ts-fullstack', 'approved', 'Core learning workflow and type-safe design are complete enough for release.', 'He Jiacheng', '2026-04-01T10:00:00Z'),
      |  ('math-visual', 'approved', 'Free entry course approved as a foundational subject.', 'He Jiacheng', '2026-04-02T10:00:00Z'),
      |  ('ai-study-lab', 'approved', 'Practical AI workflow course approved for campus rollout.', 'He Jiacheng', '2026-04-03T10:00:00Z'),
      |  ('ux-pitch', 'pending', 'Awaiting final review of course outline and landing-page assets.', 'He Jiacheng', '2026-04-04T10:00:00Z')
      |on conflict (course_id) do nothing
      |""".stripMargin
  )

  val countCourseAuditsSql: String =
    "select count(*) from edu_course_audits"

  def count(connection: Connection): IO[Int] =
    IO.blocking {
      val statement = connection.createStatement()
      try
        val resultSet = statement.executeQuery(countCourseAuditsSql)
        try if resultSet.next() then resultSet.getInt(1) else 0
        finally resultSet.close()
      finally statement.close()
    }

  val findCourseRowSql: String =
    """
      |select id, title, subtitle, category, grade, schedule, price, rating, completion_rate, status,
      |teacher_id, assistants, semester_label, offering_code, starts_at, ends_at, academic_class_ids,
      |capacity, enrollment_requires_approval, enrollment_open_at, enrollment_close_at,
      |waitlist_enabled, enrollment_invite_code, tags, description, cover_image_url
      |from edu_courses
      |where id = ?
      |""".stripMargin

  val listCourseModulesSql: String =
    "select id, course_id, title, position from edu_course_modules order by course_id asc, position asc"

  val listCourseLessonsSql: String =
    "select id, module_id, title, duration, lesson_type, completed, position from edu_course_lessons order by module_id asc, position asc"

  val listCourseEnrollmentsSql: String =
    "select user_id, course_id, enrolled_at, status from edu_enrollments"

  val upsertCourseAuditSql: String =
    """
      |insert into edu_course_audits (course_id, audit_status, audit_comment, audited_by, audited_at)
      |values (?, ?, ?, ?, ?)
      |on conflict (course_id) do update set
      |  audit_status = excluded.audit_status,
      |  audit_comment = excluded.audit_comment,
      |  audited_by = excluded.audited_by,
      |  audited_at = excluded.audited_at,
      |  pending_course_payload = null
      |""".stripMargin

  val updateCourseStatusSql: String =
    "update edu_courses set status = ?, updated_at = now() where id = ?"

  val findPendingCourseRevisionSql: String =
    "select pending_course_payload from edu_course_audits where course_id = ?"

  val applyPendingCourseRevisionSql: String =
    """
      |update edu_courses
      |set title = ?, subtitle = ?, category = ?, grade = ?, schedule = ?, price = ?, rating = ?,
      |completion_rate = ?, status = ?, teacher_id = ?, assistants = ?, semester_label = ?, offering_code = ?,
      |starts_at = ?, ends_at = ?, academic_class_ids = ?, capacity = ?, enrollment_requires_approval = ?,
      |enrollment_open_at = ?, enrollment_close_at = ?, waitlist_enabled = ?, enrollment_invite_code = ?,
      |tags = ?, description = ?, cover_image_url = ?, updated_at = ?
      |where id = ?
      |""".stripMargin

  val deleteCourseModulesSql: String =
    "delete from edu_course_modules where course_id = ?"

  val insertCourseModuleSql: String =
    "insert into edu_course_modules (id, course_id, title, position) values (?, ?, ?, ?)"

  val insertCourseLessonSql: String =
    """
      |insert into edu_course_lessons (
      |  id, module_id, title, duration, lesson_type, completed, position,
      |  content_blocks, resource_attachments, video_url, document_url, unlock_after_lesson_id, required_study_minutes
      |)
      |values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      |""".stripMargin

  def findPendingCourseRevision(connection: Connection, courseId: String): IO[Option[UpsertCourseData]] =
    IO.blocking {
      val statement = connection.prepareStatement(findPendingCourseRevisionSql)
      try
        statement.setObject(1, courseId)
        val resultSet = statement.executeQuery()
        try
          if resultSet.next() then
            Option(resultSet.getString("pending_course_payload")).flatMap(payload => decode[UpsertCourseData](payload).toOption)
          else None
        finally resultSet.close()
      finally statement.close()
    }

  def upsertCourseAudit(connection: Connection, courseId: String, auditStatus: CourseAuditStatus, auditComment: String, adminName: String): IO[Unit] =
    execute(connection.prepareStatement(upsertCourseAuditSql)) { statement =>
      statement.setObject(1, courseId)
      statement.setObject(2, CourseAuditStatus.toString(auditStatus))
      statement.setObject(3, auditComment)
      statement.setObject(4, adminName)
      statement.setObject(5, Instant.now().toString)
    }.void

  def updateCourseStatus(connection: Connection, courseId: String, status: CourseStatus): IO[Unit] =
    execute(connection.prepareStatement(updateCourseStatusSql)) { statement =>
      statement.setObject(1, CourseStatus.toString(status))
      statement.setObject(2, courseId)
    }.void

  def applyPendingCourseRevision(connection: Connection, fallbackTeacherId: String, revision: UpsertCourseData): IO[Unit] =
    val courseId = revision.courseId.getOrElse(throw new IllegalArgumentException("Pending course revision is missing course id."))
    val teacherId = revision.teacherId.getOrElse(fallbackTeacherId)
    for
      _ <- applyCourseRow(connection, courseId, teacherId, revision)
      _ <- execute(connection.prepareStatement(deleteCourseModulesSql))(_.setObject(1, courseId)).void
      _ <- insertModules(connection, courseId, revision.modules)
    yield ()

  private def applyCourseRow(connection: Connection, courseId: String, teacherId: String, request: UpsertCourseData): IO[Unit] =
    execute(connection.prepareStatement(applyPendingCourseRevisionSql)) { statement =>
      statement.setObject(1, request.title)
      statement.setObject(2, request.subtitle)
      statement.setObject(3, request.category)
      statement.setObject(4, request.grade)
      statement.setObject(5, request.schedule)
      statement.setObject(6, request.price)
      statement.setObject(7, request.rating)
      statement.setObject(8, request.completionRate)
      statement.setObject(9, CourseStatus.toString(CourseStatus.Published))
      statement.setObject(10, teacherId)
      statement.setObject(11, encodeCsv(request.assistants))
      statement.setObject(12, request.semesterLabel.orNull)
      statement.setObject(13, request.offeringCode.orNull)
      statement.setObject(14, request.startsAt.orNull)
      statement.setObject(15, request.endsAt.orNull)
      statement.setObject(16, encodeCsv(request.academicClassIds))
      statement.setObject(17, request.capacity)
      statement.setBoolean(18, request.enrollmentPolicy.requiresApproval)
      statement.setObject(19, request.enrollmentPolicy.openAt.orNull)
      statement.setObject(20, request.enrollmentPolicy.closeAt.orNull)
      statement.setBoolean(21, request.enrollmentPolicy.waitlistEnabled)
      statement.setObject(22, request.enrollmentPolicy.inviteCode.orNull)
      statement.setObject(23, encodeCsv(request.tags))
      statement.setObject(24, request.description)
      statement.setObject(25, request.coverImageUrl.orNull)
      statement.setTimestamp(26, Timestamp.from(Instant.now()))
      statement.setObject(27, courseId)
    }.void

  private def insertModules(connection: Connection, courseId: String, modules: List[CourseModuleInput]): IO[Unit] =
    modules.zipWithIndex.foldLeft(IO.unit) { case (acc, (module, moduleIndex)) =>
      acc.flatMap { _ =>
        val moduleId = module.id.getOrElse(s"module-${java.util.UUID.randomUUID().toString.take(8)}")
        for
          _ <- execute(connection.prepareStatement(insertCourseModuleSql)) { statement =>
            statement.setObject(1, moduleId)
            statement.setObject(2, courseId)
            statement.setObject(3, module.title)
            statement.setObject(4, moduleIndex + 1)
          }
          _ <- module.lessons.zipWithIndex.foldLeft(IO.unit) { case (lessonAcc, (lesson, lessonIndex)) =>
            lessonAcc.flatMap { _ =>
              val lessonId = lesson.id.getOrElse(s"lesson-${java.util.UUID.randomUUID().toString.take(8)}")
              execute(connection.prepareStatement(insertCourseLessonSql)) { statement =>
                statement.setObject(1, lessonId)
                statement.setObject(2, moduleId)
                statement.setObject(3, lesson.title)
                statement.setObject(4, lesson.duration)
                statement.setObject(5, LessonType.toString(lesson.`type`))
                statement.setBoolean(6, lesson.completed)
                statement.setObject(7, lessonIndex + 1)
                statement.setObject(8, lesson.contentBlocks.asJson.noSpaces)
                statement.setObject(9, lesson.resourceAttachments.asJson.noSpaces)
                statement.setObject(10, lesson.videoUrl.orNull)
                statement.setObject(11, lesson.documentUrl.orNull)
                statement.setObject(12, lesson.unlockAfterLessonId.orNull)
                statement.setObject(13, lesson.requiredStudyMinutes)
              }.void
            }
          }
        yield ()
      }
    }

  private def execute(statement: PreparedStatement)(bind: PreparedStatement => Unit): IO[Int] =
    IO.blocking {
      try
        bind(statement)
        statement.executeUpdate()
      finally statement.close()
    }

  private def encodeCsv(values: List[String]): String =
    values.map(_.trim).filter(_.nonEmpty).distinct.mkString(",")

  val listCourseAuditRowsSql: String =
    """
      |select course_id, audit_status, audit_comment, audited_by, audited_at
      |from edu_course_audits
      |""".stripMargin

  def listAuditRows(connection: Connection): IO[Map[String, CourseAuditRow]] =
    IO.blocking {
      val statement = connection.createStatement()
      try
        val resultSet = statement.executeQuery(listCourseAuditRowsSql)
        try
          val buffer = scala.collection.mutable.Map.empty[String, CourseAuditRow]
          while resultSet.next() do
            val row = readAuditRow(resultSet)
            buffer += row.courseId -> row
          buffer.toMap
        finally resultSet.close()
      finally statement.close()
    }

  private def readAuditRow(resultSet: ResultSet): CourseAuditRow =
    CourseAuditRow(
      courseId = resultSet.getString("course_id"),
      auditStatus = CourseAuditStatus.fromString(resultSet.getString("audit_status")).getOrElse(CourseAuditStatus.Pending),
      auditComment = Option(resultSet.getString("audit_comment")).filter(_.nonEmpty),
      auditedBy = Option(resultSet.getString("audited_by")).filter(_.nonEmpty),
      auditedAt = Option(resultSet.getString("audited_at")).filter(_.nonEmpty)
    )

  final case class CourseAuditRow(
    courseId: String,
    auditStatus: CourseAuditStatus,
    auditComment: Option[String],
    auditedBy: Option[String],
    auditedAt: Option[String]
  )
