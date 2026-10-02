package microservices.course.learning.tables

import cats.effect.IO
import microservices.course.learning.objects.*

import java.sql.Connection
import java.time.Instant
import scala.collection.mutable.ListBuffer

private[learning] object LessonProgressTable:

  val schemaStatements: List[String] = List(
    """
      |create table if not exists edu_lesson_progress (
      |  user_id varchar(64) not null references edu_users(id) on delete cascade,
      |  lesson_id varchar(64) not null references edu_course_lessons(id) on delete cascade,
      |  status varchar(32) not null,
      |  updated_at varchar(80) not null,
      |  primary key (user_id, lesson_id)
      |);
      |""".stripMargin,
    "alter table edu_lesson_progress add column if not exists study_minutes integer not null default 0",
    "alter table edu_lesson_progress add column if not exists last_position_seconds integer not null default 0",
    "alter table edu_lesson_progress add column if not exists last_studied_at varchar(80)",
    "alter table edu_lesson_progress add column if not exists completed_preview_resource_ids text not null default ''",
    "alter table edu_lesson_progress add column if not exists last_playback_rate double precision not null default 1"
  )

  val seedStatements: List[String] = List(
    "insert into edu_lesson_progress (user_id, lesson_id, status, updated_at) values ('student-lin', 'l1', 'completed', '2026-03-20T12:30:00Z') on conflict do nothing",
    "insert into edu_lesson_progress (user_id, lesson_id, status, updated_at) values ('student-lin', 'l2', 'completed', '2026-03-21T12:30:00Z') on conflict do nothing",
    "insert into edu_lesson_progress (user_id, lesson_id, status, updated_at) values ('student-lin', 'l5', 'completed', '2026-03-25T12:30:00Z') on conflict do nothing",
    "insert into edu_lesson_progress (user_id, lesson_id, status, updated_at) values ('student-lin', 'l8', 'completed', '2026-03-27T12:30:00Z') on conflict do nothing"
  )

  val countLessonProgressSql: String =
    "select count(*) from edu_lesson_progress"

  val listLessonCompletionSql: String =
    "select lesson_id, status from edu_lesson_progress where user_id = ?"

  val listLessonStudyRecordsSql: String =
    "select lesson_id, study_minutes, last_position_seconds, last_studied_at, completed_preview_resource_ids, last_playback_rate from edu_lesson_progress where user_id = ?"

  val findLessonProgressSql: String =
    "select status, study_minutes, last_position_seconds, completed_preview_resource_ids, last_playback_rate from edu_lesson_progress where user_id = ? and lesson_id = ?"

  val upsertLessonProgressStatusSql: String =
    """
      |insert into edu_lesson_progress (user_id, lesson_id, status, updated_at)
      |values (?, ?, ?, ?)
      |on conflict (user_id, lesson_id) do update set
      |  status = excluded.status,
      |  updated_at = excluded.updated_at
      |""".stripMargin

  val updateLessonProgressStudyStateSql: String =
    """
      |update edu_lesson_progress
      |set study_minutes = ?, last_position_seconds = ?, last_studied_at = ?, completed_preview_resource_ids = ?, last_playback_rate = ?
      |where user_id = ? and lesson_id = ?
      |""".stripMargin

  private[learning] def listLessonCompletion(connection: Connection, userId: String): IO[Map[String, Boolean]] =
    using(connection.prepareStatement(listLessonCompletionSql)) { statement =>
      IO.blocking {
        statement.setObject(1, userId)
        val resultSet = statement.executeQuery()
        val buffer = ListBuffer.empty[(String, Boolean)]
        try
          while resultSet.next() do
            buffer += resultSet.getString("lesson_id") ->
              LessonProgressStatus
                .fromString(resultSet.getString("status"))
                .contains(LessonProgressStatus.Completed)
          buffer.toMap
        finally resultSet.close()
      }
    }

  private[learning] def listLessonStudyRecords(
    connection: Connection,
    userId: String,
    timelineByLesson: Map[String, List[LessonStudyTimelineEntry]]
  ): IO[Map[String, LessonStudyRecord]] =
    using(connection.prepareStatement(listLessonStudyRecordsSql)) { statement =>
      IO.blocking {
        statement.setObject(1, userId)
        val resultSet = statement.executeQuery()
        val buffer = ListBuffer.empty[(String, LessonStudyRecord)]
        try
          while resultSet.next() do
            val lessonId = resultSet.getString("lesson_id")
            buffer += lessonId -> LessonStudyRecord(
              studyMinutes = resultSet.getInt("study_minutes"),
              lastPositionSeconds = resultSet.getInt("last_position_seconds"),
              lastStudiedAt = Option(resultSet.getString("last_studied_at")).filter(_.nonEmpty),
              recentTimeline = timelineByLesson.getOrElse(lessonId, Nil),
              completedPreviewResourceIds = decodeCsv(resultSet.getString("completed_preview_resource_ids")),
              playbackRate = Option(resultSet.getObject("last_playback_rate"))
                .map(_ => resultSet.getDouble("last_playback_rate"))
                .filter(_ > 0)
                .getOrElse(1d)
            )
          buffer.toMap
        finally resultSet.close()
      }
    }

  private[learning] def findLessonProgress(connection: Connection, userId: String, lessonId: String): IO[(LessonProgressStatus, Int, Int, List[String], Double)] =
    using(connection.prepareStatement(findLessonProgressSql)) { statement =>
      IO.blocking {
        statement.setObject(1, userId)
        statement.setObject(2, lessonId)
        val resultSet = statement.executeQuery()
        try
          if resultSet.next() then
            (
              LessonProgressStatus
                .fromString(resultSet.getString("status"))
                .getOrElse(LessonProgressStatus.Incomplete),
              resultSet.getInt("study_minutes"),
              resultSet.getInt("last_position_seconds"),
              decodeCsv(resultSet.getString("completed_preview_resource_ids")),
              Option(resultSet.getObject("last_playback_rate"))
                .map(_ => resultSet.getDouble("last_playback_rate"))
                .filter(_ > 0)
                .getOrElse(1d)
            )
          else (LessonProgressStatus.Incomplete, 0, 0, Nil, 1d)
        finally resultSet.close()
      }
    }

  private[learning] def upsertLessonProgressStatus(connection: Connection, userId: String, lessonId: String, status: LessonProgressStatus): IO[Unit] =
    using(connection.prepareStatement(upsertLessonProgressStatusSql)) { statement =>
      IO.blocking {
        statement.setObject(1, userId)
        statement.setObject(2, lessonId)
        statement.setObject(3, LessonProgressStatus.toString(status))
        statement.setObject(4, Instant.now().toString)
        statement.executeUpdate()
      }
    }

  private[learning] def updateLessonProgressStudyState(
    connection: Connection,
    userId: String,
    lessonId: String,
    studyMinutes: Int,
    lastPositionSeconds: Int,
    completedPreviewResourceIds: List[String],
    playbackRate: Double
  ): IO[Unit] =
    using(connection.prepareStatement(updateLessonProgressStudyStateSql)) { statement =>
      IO.blocking {
        statement.setObject(1, studyMinutes)
        statement.setObject(2, lastPositionSeconds)
        statement.setObject(3, Instant.now().toString)
        statement.setObject(4, encodeCsv(completedPreviewResourceIds))
        statement.setObject(5, playbackRate)
        statement.setObject(6, userId)
        statement.setObject(7, lessonId)
        statement.executeUpdate()
      }
    }

  private def decodeCsv(value: String | Null): List[String] =
    Option(value).toList
      .flatMap(_.split(",").toList)
      .map(_.trim)
      .filter(_.nonEmpty)

  private def encodeCsv(values: List[String]): String =
    values.map(_.trim).filter(_.nonEmpty).distinct.mkString(",")

  private[learning] def using[A <: AutoCloseable, B](resource: A)(use: A => IO[B]): IO[B] =
    use(resource).guarantee(IO.blocking(resource.close()).handleErrorWith(_ => IO.unit))
