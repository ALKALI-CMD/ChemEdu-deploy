package microservices.course.catalog.tables

import cats.effect.IO
import io.circe.parser.decode
import microservices.course.catalog.objects.*
import microservices.course.enrollment.objects.CourseEnrollment
import microservices.course.learning.objects.*

import java.sql.{Connection, ResultSet}
import java.util.UUID
import scala.collection.mutable

private[catalog] object CourseTable:

  val schemaStatements: List[String] = List(
    """
      |create table if not exists edu_courses (
      |  id varchar(64) primary key,
      |  title varchar(200) not null,
      |  subtitle text not null,
      |  category varchar(80) not null,
      |  grade varchar(80) not null,
      |  schedule varchar(120) not null,
      |  price integer not null,
      |  rating double precision not null,
      |  completion_rate integer not null,
      |  status varchar(32) not null,
      |  teacher_id varchar(64) not null references edu_users(id),
      |  assistants text not null default '',
      |  tags text not null default '',
      |  description text not null,
      |  created_at timestamptz not null default now(),
      |  updated_at timestamptz not null default now()
      |);
      |""".stripMargin,
    """
      |create table if not exists edu_course_modules (
      |  id varchar(64) primary key,
      |  course_id varchar(64) not null references edu_courses(id) on delete cascade,
      |  title varchar(200) not null,
      |  position integer not null
      |);
      |""".stripMargin,
    """
      |create table if not exists edu_course_lessons (
      |  id varchar(64) primary key,
      |  module_id varchar(64) not null references edu_course_modules(id) on delete cascade,
      |  title varchar(200) not null,
      |  duration varchar(80) not null,
      |  lesson_type varchar(32) not null,
      |  completed boolean not null,
      |  position integer not null
      |);
      |""".stripMargin,
    "alter table edu_courses add column if not exists semester_label varchar(120)",
    "alter table edu_courses add column if not exists offering_code varchar(120)",
    "alter table edu_courses add column if not exists starts_at varchar(80)",
    "alter table edu_courses add column if not exists ends_at varchar(80)",
    "alter table edu_courses add column if not exists academic_class_ids text not null default ''",
    "alter table edu_courses add column if not exists capacity integer not null default 60",
    "alter table edu_courses add column if not exists enrollment_requires_approval boolean not null default false",
    "alter table edu_courses add column if not exists enrollment_open_at varchar(80)",
    "alter table edu_courses add column if not exists enrollment_close_at varchar(80)",
    "alter table edu_courses add column if not exists waitlist_enabled boolean not null default false",
    "alter table edu_courses add column if not exists enrollment_invite_code varchar(120)",
    "alter table edu_courses add column if not exists cover_image_url text"
  )

  val countUsersSql: String =
    "select count(*) from edu_users"

  val refreshCourseRatingsSql: String =
    """
      |update edu_courses c
      |set rating = review_summary.average_rating,
      |    updated_at = now()
      |from (
      |  select course_id, round(avg(rating)::numeric, 1) as average_rating
      |  from edu_course_reviews
      |  group by course_id
      |) review_summary
      |where c.id = review_summary.course_id
      |""".stripMargin

  val backfillDiscussionAuthorIdsSql: String =
    """
      |update edu_discussions d
      |set author_id = u.id
      |from edu_users u
      |where d.author_id = '' and d.author = u.name
      |""".stripMargin

  val backfillDiscussionReplyAuthorIdsSql: String =
    """
      |update edu_discussion_replies r
      |set author_id = u.id
      |from edu_users u
      |where r.author_id = '' and r.author = u.name
      |""".stripMargin

  val listDepartmentsSql: String =
    "select id, name from edu_departments order by id asc"

  val listMajorsSql: String =
    "select id, department_id, name from edu_majors order by id asc"

  val listAcademicClassesSql: String =
    "select id, major_id, grade, name, capacity from edu_academic_classes order by id asc"

  val listAcademicClassMembershipsSql: String =
    "select id, academic_class_id from edu_users where academic_class_id is not null and academic_class_id <> ''"

  val listSemestersSql: String =
    "select id, label, start_at, end_at, archived from edu_semesters order by start_at asc, id asc"

  val findEnrolledCourseParticipantSql: String =
    "select 1 from edu_enrollments where user_id = ? and course_id = ? and status = 'enrolled'"

  val findCourseTeachingMembersSql: String =
    "select teacher_id, assistants from edu_courses where id = ?"

  val countCourseEnrollmentsSql: String =
    "select count(*) from edu_enrollments where course_id = ?"

  val countActiveCourseEnrollmentsSql: String =
    "select count(*) from edu_enrollments where course_id = ? and status = 'enrolled'"

  private[catalog] def initialize(connection: Connection): IO[Unit] =
    executeStatements(connection, schemaStatements)

  private[catalog] def seedInitialDataIfNeeded(connection: Connection): IO[Unit] =
    for
      userCount <- scalar(connection, countUsersSql)
      _ <- if userCount == 0 then executeStatements(connection, CourseSeedTable.seedStatements) else IO.unit
      _ <- executeSql(connection, refreshCourseRatingsSql)
      _ <- executeSql(connection, backfillDiscussionAuthorIdsSql)
      _ <- executeSql(connection, backfillDiscussionReplyAuthorIdsSql)
    yield ()


  private[catalog] def countCourseEnrollments(connection: Connection, courseId: String): IO[Int] =
    using(connection.prepareStatement(countCourseEnrollmentsSql)) { statement =>
      IO.blocking {
        statement.setObject(1, courseId)
        val resultSet = statement.executeQuery()
        try if resultSet.next() then resultSet.getInt(1) else 0
        finally resultSet.close()
      }
    }

  private[catalog] def countActiveCourseEnrollments(connection: Connection, courseId: String): IO[Int] =
    using(connection.prepareStatement(countActiveCourseEnrollmentsSql)) { statement =>
      IO.blocking {
        statement.setObject(1, courseId)
        val resultSet = statement.executeQuery()
        try if resultSet.next() then resultSet.getInt(1) else 0
        finally resultSet.close()
      }
    }

  private[catalog] def isEnrolledCourseParticipant(connection: Connection, userId: String, courseId: String): IO[Boolean] =
    using(connection.prepareStatement(findEnrolledCourseParticipantSql)) { statement =>
      IO.blocking {
        statement.setObject(1, userId)
        statement.setObject(2, courseId)
        val resultSet = statement.executeQuery()
        try resultSet.next()
        finally resultSet.close()
      }
    }

  private[catalog] def findCourseTeachingMembers(connection: Connection, courseId: String): IO[Option[(String, List[String])]] =
    using(connection.prepareStatement(findCourseTeachingMembersSql)) { statement =>
      IO.blocking {
        statement.setObject(1, courseId)
        val resultSet = statement.executeQuery()
        try
          if resultSet.next() then Some(resultSet.getString("teacher_id") -> decodeCsv(resultSet.getString("assistants")))
          else None
        finally resultSet.close()
      }
    }

  private[catalog] def selectList[A](connection: Connection, sql: String)(reader: ResultSet => A): IO[List[A]] =
    using(connection.createStatement()) { statement =>
      IO.blocking {
        val resultSet = statement.executeQuery(sql)
        val buffer = mutable.ListBuffer.empty[A]
        try
          while resultSet.next() do buffer += reader(resultSet)
          buffer.toList
        finally resultSet.close()
      }
    }

  private[catalog] def readEnrollment(resultSet: ResultSet): CourseEnrollment =
    CourseEnrollment(
      userId = resultSet.getString("user_id"),
      courseId = resultSet.getString("course_id"),
      enrolledAt = resultSet.getString("enrolled_at"),
      status = optionalString(resultSet, "status").getOrElse("enrolled")
    )

  private[catalog] def readCourseRow(resultSet: ResultSet): CourseRow =
    CourseRow(
      id = resultSet.getString("id"),
      title = resultSet.getString("title"),
      subtitle = resultSet.getString("subtitle"),
      category = resultSet.getString("category"),
      grade = resultSet.getString("grade"),
      schedule = resultSet.getString("schedule"),
      price = resultSet.getInt("price"),
      rating = resultSet.getDouble("rating"),
      completionRate = resultSet.getInt("completion_rate"),
      status = CourseStatus.fromString(resultSet.getString("status")).getOrElse(CourseStatus.Draft),
      teacherId = resultSet.getString("teacher_id"),
      assistants = resultSet.getString("assistants"),
      semesterLabel = optionalString(resultSet, "semester_label"),
      offeringCode = optionalString(resultSet, "offering_code"),
      startsAt = optionalString(resultSet, "starts_at"),
      endsAt = optionalString(resultSet, "ends_at"),
      academicClassIds = Option(resultSet.getString("academic_class_ids")).getOrElse(""),
      capacity = optionalInt(resultSet, "capacity").getOrElse(60),
      enrollmentRequiresApproval = optionalBoolean(resultSet, "enrollment_requires_approval", false),
      enrollmentOpenAt = optionalString(resultSet, "enrollment_open_at"),
      enrollmentCloseAt = optionalString(resultSet, "enrollment_close_at"),
      waitlistEnabled = optionalBoolean(resultSet, "waitlist_enabled", false),
      enrollmentInviteCode = optionalString(resultSet, "enrollment_invite_code"),
      tags = resultSet.getString("tags"),
      description = resultSet.getString("description"),
      coverImageUrl = optionalString(resultSet, "cover_image_url")
    )

  private[catalog] def readModuleRow(resultSet: ResultSet): ModuleRow =
    ModuleRow(
      id = resultSet.getString("id"),
      courseId = resultSet.getString("course_id"),
      title = resultSet.getString("title")
    )

  private[catalog] def readLessonRow(resultSet: ResultSet): LessonRow =
    val lessonType = LessonType.fromString(resultSet.getString("lesson_type")).getOrElse(LessonType.Video)
    LessonRow(
      moduleId = resultSet.getString("module_id"),
      lesson = Lesson(
        id = resultSet.getString("id"),
        title = resultSet.getString("title"),
        duration = resultSet.getString("duration"),
        `type` = lessonType,
        completed = resultSet.getBoolean("completed"),
        contentBlocks = decodeLessonContentBlocks(resultSet.getString("content_blocks"), resultSet.getString("title"), lessonType),
        resourceAttachments = decodeAttachments(resultSet.getString("resource_attachments")),
        videoUrl = Option(resultSet.getString("video_url")).filter(_.nonEmpty),
        documentUrl = Option(resultSet.getString("document_url")).filter(_.nonEmpty),
        unlockAfterLessonId = Option(resultSet.getString("unlock_after_lesson_id")).filter(_.nonEmpty),
        isLocked = false,
        requiredStudyMinutes = resultSet.getInt("required_study_minutes"),
        studyRecord = None
      )
    )

  private[catalog] def encodeCsv(values: List[String]): String =
    values.map(_.trim).filter(_.nonEmpty).mkString(",")

  private[catalog] def decodeCsv(value: String): List[String] =
    Option(value).toList.flatMap(_.split(",")).map(_.trim).filter(_.nonEmpty)

  private[catalog] def encodeUserIdCsv(values: List[String]): String =
    values.mkString(",")

  private[catalog] def decodeUserIdCsv(value: String): List[String] =
    decodeCsv(value)

  private def optionalString(resultSet: ResultSet, column: String): Option[String] =
    try Option(resultSet.getString(column)).filter(_.nonEmpty)
    catch
      case _: Throwable => None

  private def optionalInt(resultSet: ResultSet, column: String): Option[Int] =
    try Option(resultSet.getObject(column)).map(_.toString.toInt)
    catch
      case _: Throwable => None

  private def optionalBoolean(resultSet: ResultSet, column: String, default: Boolean): Boolean =
    try resultSet.getBoolean(column)
    catch
      case _: Throwable => default

  private def decodeAttachments(value: String): List[AssignmentAttachment] =
    Option(value).filter(_.trim.nonEmpty).flatMap(raw => decode[List[AssignmentAttachment]](raw).toOption).getOrElse(Nil)

  private def decodeLessonContentBlocks(value: String, title: String, lessonType: LessonType): List[LessonContentBlock] =
    Option(value)
      .filter(_.trim.nonEmpty)
      .flatMap(raw => decode[List[LessonContentBlock]](raw).toOption)
      .filter(_.nonEmpty)
      .getOrElse(buildDefaultLessonContent(title, lessonType))

  private def buildDefaultLessonContent(title: String, lessonType: LessonType): List[LessonContentBlock] =
    lessonType match
      case LessonType.Video =>
        List(
          LessonContentBlock(s"$title-video", LessonContentType.Video, "Course video", title),
          LessonContentBlock(s"$title-notes", LessonContentType.RichText, "Learning notes", s"$title notes.")
        )
      case LessonType.Document =>
        List(
          LessonContentBlock(s"$title-slides", LessonContentType.Slides, "Slides", title),
          LessonContentBlock(s"$title-body", LessonContentType.RichText, "Body", s"$title body.")
        )
      case LessonType.Quiz =>
        List(LessonContentBlock(s"$title-quiz", LessonContentType.RichText, "Quiz", s"$title quiz."))
      case LessonType.Live =>
        List(LessonContentBlock(s"$title-live", LessonContentType.RichText, "Live", s"$title live."))

  private[catalog] def generateId(prefix: String): String =
    s"$prefix-${UUID.randomUUID().toString.take(8)}"
  private[catalog] def executeStatements(connection: Connection, statements: List[String]): IO[Unit] =
    statements.foldLeft(IO.unit)((acc, sql) => acc.flatMap(_ => executeSql(connection, sql)))

  private def executeSql(connection: Connection, sql: String): IO[Unit] =
    using(connection.createStatement())(statement => IO.blocking(statement.execute(sql)).void)

  private def scalar(connection: Connection, sql: String): IO[Int] =
    using(connection.createStatement()) { statement =>
      IO.blocking {
        val resultSet = statement.executeQuery(sql)
        try if resultSet.next() then resultSet.getInt(1) else 0
        finally resultSet.close()
      }
    }

  private[catalog] def using[A <: AutoCloseable, B](resource: A)(use: A => IO[B]): IO[B] =
    use(resource).guarantee(IO.blocking(resource.close()).handleErrorWith(_ => IO.unit))
