package microservices.course.catalog.tables

import cats.effect.IO
import microservices.course.catalog.objects.{LessonRow, ModuleRow}

import java.sql.Connection

private[catalog] object CourseStructureProjectionTable:

  private val listCourseModulesSql: String =
    "select id, course_id, title, position from edu_course_modules order by course_id asc, position asc"

  private val listCourseLessonsSql: String =
    """
      |select id, module_id, title, duration, lesson_type, completed, position,
      |content_blocks, resource_attachments, video_url, document_url, unlock_after_lesson_id, required_study_minutes
      |from edu_course_lessons
      |order by module_id asc, position asc
      |""".stripMargin

  private[catalog] def listModuleRows(connection: Connection): IO[List[ModuleRow]] =
    CourseTable.selectList(connection, listCourseModulesSql)(CourseTable.readModuleRow)

  private[catalog] def listLessonRows(connection: Connection): IO[List[LessonRow]] =
    CourseTable.selectList(connection, listCourseLessonsSql)(CourseTable.readLessonRow)
