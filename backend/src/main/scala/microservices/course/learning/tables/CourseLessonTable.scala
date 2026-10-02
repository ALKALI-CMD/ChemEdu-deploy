package microservices.course.learning.tables

import cats.effect.IO

import java.sql.Connection

private[learning] object CourseLessonTable:

  val schemaStatements: List[String] = List(
    "alter table edu_course_lessons add column if not exists content_blocks text not null default '[]'",
    "alter table edu_course_lessons add column if not exists resource_attachments text not null default '[]'",
    "alter table edu_course_lessons add column if not exists video_url text",
    "alter table edu_course_lessons add column if not exists document_url text",
    "alter table edu_course_lessons add column if not exists unlock_after_lesson_id varchar(64)",
    "alter table edu_course_lessons add column if not exists required_study_minutes integer not null default 20"
  )

  val findLessonCourseIdSql: String =
    """
      |select m.course_id
      |from edu_course_lessons l
      |join edu_course_modules m on m.id = l.module_id
      |where l.id = ?
      |""".stripMargin

  val findRequiredStudyMinutesSql: String =
    "select required_study_minutes from edu_course_lessons where id = ?"

  val findCourseTeacherSql: String =
    "select teacher_id from edu_courses where id = ?"

  val findCourseTeachingMembersSql: String =
    "select teacher_id, assistants from edu_courses where id = ?"

  val findCourseExistsSql: String =
    "select 1 from edu_courses where id = ?"

  val listEnrolledStudentIdsSql: String =
    "select user_id from edu_enrollments where course_id = ? and status = 'enrolled' order by user_id asc"

  val findStudentEnrollmentSql: String =
    "select 1 from edu_enrollments where user_id = ? and course_id = ? and status = 'enrolled'"

  private[learning] def findLessonCourseId(connection: Connection, lessonId: String): IO[Option[String]] =
    using(connection.prepareStatement(findLessonCourseIdSql)) { statement =>
      IO.blocking {
        statement.setObject(1, lessonId)
        val resultSet = statement.executeQuery()
        try Option.when(resultSet.next())(resultSet.getString("course_id"))
        finally resultSet.close()
      }
    }

  private[learning] def findStudentEnrollment(connection: Connection, userId: String, courseId: String): IO[Boolean] =
    using(connection.prepareStatement(findStudentEnrollmentSql)) { statement =>
      IO.blocking {
        statement.setObject(1, userId)
        statement.setObject(2, courseId)
        val resultSet = statement.executeQuery()
        try resultSet.next()
        finally resultSet.close()
      }
    }

  private[learning] def findRequiredStudyMinutes(connection: Connection, lessonId: String): IO[Option[Int]] =
    using(connection.prepareStatement(findRequiredStudyMinutesSql)) { statement =>
      IO.blocking {
        statement.setObject(1, lessonId)
        val resultSet = statement.executeQuery()
        try Option.when(resultSet.next())(Math.max(0, resultSet.getInt("required_study_minutes")))
        finally resultSet.close()
      }
    }

  private[learning] def listEnrolledStudentIds(connection: Connection, courseId: String): IO[List[String]] =
    using(connection.prepareStatement(listEnrolledStudentIdsSql)) { statement =>
      IO.blocking {
        statement.setObject(1, courseId)
        val resultSet = statement.executeQuery()
        val buffer = scala.collection.mutable.ListBuffer.empty[String]
        try
          while resultSet.next() do buffer += resultSet.getString("user_id")
          buffer.toList
        finally resultSet.close()
      }
    }

  private[learning] def findCourseTeacherId(connection: Connection, courseId: String): IO[Option[String]] =
    using(connection.prepareStatement(findCourseTeacherSql)) { statement =>
      IO.blocking {
        statement.setObject(1, courseId)
        val resultSet = statement.executeQuery()
        try Option.when(resultSet.next())(resultSet.getString("teacher_id"))
        finally resultSet.close()
      }
    }

  private[learning] def findCourseTeachingMembers(connection: Connection, courseId: String): IO[Option[(String, List[String])]] =
    using(connection.prepareStatement(findCourseTeachingMembersSql)) { statement =>
      IO.blocking {
        statement.setObject(1, courseId)
        val resultSet = statement.executeQuery()
        try
          Option.when(resultSet.next())(
            resultSet.getString("teacher_id") -> decodeCsv(resultSet.getString("assistants"))
          )
        finally resultSet.close()
      }
    }

  private[learning] def courseExists(connection: Connection, courseId: String): IO[Boolean] =
    using(connection.prepareStatement(findCourseExistsSql)) { statement =>
      IO.blocking {
        statement.setObject(1, courseId)
        val resultSet = statement.executeQuery()
        try resultSet.next()
        finally resultSet.close()
      }
    }

  private def decodeCsv(value: String): List[String] =
    Option(value).toList.flatMap(_.split(",")).map(_.trim).filter(_.nonEmpty)

  private[learning] def using[A <: AutoCloseable, B](resource: A)(use: A => IO[B]): IO[B] =
    use(resource).guarantee(IO.blocking(resource.close()).handleErrorWith(_ => IO.unit))
