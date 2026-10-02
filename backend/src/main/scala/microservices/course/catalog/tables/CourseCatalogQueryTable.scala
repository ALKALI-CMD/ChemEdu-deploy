package microservices.course.catalog.tables

import cats.effect.IO
import microservices.course.catalog.objects.CourseRow
import microservices.course.enrollment.objects.CourseEnrollment

import java.sql.Connection

private[catalog] object CourseCatalogQueryTable:

  private val listCoursesSql: String =
    """
      |select id, title, subtitle, category, grade, schedule, price, rating, completion_rate, status,
      |teacher_id, assistants, semester_label, offering_code, starts_at, ends_at,
      |academic_class_ids, capacity, enrollment_requires_approval, enrollment_open_at,
      |enrollment_close_at, waitlist_enabled, enrollment_invite_code, tags, description, cover_image_url
      |from edu_courses
      |order by created_at asc
      |""".stripMargin

  private val listCourseEnrollmentsSql: String =
    "select user_id, course_id, enrolled_at, status from edu_enrollments"

  private val findCourseRowSql: String =
    """
      |select id, title, subtitle, category, grade, schedule, price, rating, completion_rate, status,
      |teacher_id, assistants, semester_label, offering_code, starts_at, ends_at, academic_class_ids,
      |capacity, enrollment_requires_approval, enrollment_open_at, enrollment_close_at,
      |waitlist_enabled, enrollment_invite_code, tags, description, cover_image_url
      |from edu_courses
      |where id = ?
      |""".stripMargin

  private[catalog] def listCourseRows(connection: Connection): IO[List[CourseRow]] =
    CourseTable.selectList(connection, listCoursesSql)(CourseTable.readCourseRow)

  private[catalog] def listCourseEnrollments(connection: Connection): IO[List[CourseEnrollment]] =
    CourseTable.selectList(connection, listCourseEnrollmentsSql)(CourseTable.readEnrollment)

  private[catalog] def findCourseRow(connection: Connection, courseId: String): IO[Option[CourseRow]] =
    CourseTable.using(connection.prepareStatement(findCourseRowSql)) { statement =>
      IO.blocking {
        statement.setObject(1, courseId)
        val resultSet = statement.executeQuery()
        try if resultSet.next() then Some(CourseTable.readCourseRow(resultSet)) else None
        finally resultSet.close()
      }
    }
