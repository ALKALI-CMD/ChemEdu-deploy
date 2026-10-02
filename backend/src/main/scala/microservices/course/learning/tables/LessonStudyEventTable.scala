package microservices.course.learning.tables

import cats.effect.IO
import microservices.course.learning.objects.LessonStudyTimelineEntry

import java.sql.Connection
import java.time.Instant
import java.util.UUID
import scala.collection.mutable.ListBuffer

private[learning] object LessonStudyEventTable:

  val schemaStatements: List[String] = List(
    """
      |create table if not exists edu_lesson_study_events (
      |  id varchar(64) primary key,
      |  user_id varchar(64) not null references edu_users(id) on delete cascade,
      |  lesson_id varchar(64) not null references edu_course_lessons(id) on delete cascade,
      |  event_type varchar(32) not null,
      |  study_minutes_delta integer not null default 0,
      |  last_position_seconds integer not null default 0,
      |  recorded_at varchar(80) not null
      |);
      |""".stripMargin
  )

  val listRecentStudyTimelineSql: String =
    """
      |select id, lesson_id, event_type, study_minutes_delta, last_position_seconds, recorded_at
      |from edu_lesson_study_events
      |where user_id = ?
      |order by recorded_at desc
      |""".stripMargin

  val insertLessonStudyEventSql: String =
    """
      |insert into edu_lesson_study_events (
      |  id, user_id, lesson_id, event_type, study_minutes_delta, last_position_seconds, recorded_at
      |) values (?, ?, ?, ?, ?, ?, ?)
      |""".stripMargin

  private[learning] def listRecentStudyTimeline(connection: Connection, userId: String): IO[Map[String, List[LessonStudyTimelineEntry]]] =
    using(connection.prepareStatement(listRecentStudyTimelineSql)) { statement =>
      IO.blocking {
        statement.setObject(1, userId)
        val resultSet = statement.executeQuery()
        val buffer = ListBuffer.empty[(String, LessonStudyTimelineEntry)]
        try
          while resultSet.next() do
            val lessonId = resultSet.getString("lesson_id")
            val entry = LessonStudyTimelineEntry(
              id = resultSet.getString("id"),
              eventType = resultSet.getString("event_type"),
              studyMinutesDelta = resultSet.getInt("study_minutes_delta"),
              lastPositionSeconds = resultSet.getInt("last_position_seconds"),
              recordedAt = resultSet.getString("recorded_at")
            )
            buffer += lessonId -> entry
          buffer
            .groupBy(_._1)
            .iterator
            .map { case (lessonId, entries) => lessonId -> entries.map(_._2).take(5).toList }
            .toMap
        finally resultSet.close()
      }
    }

  private[learning] def insertStudyEvent(
    connection: Connection,
    userId: String,
    lessonId: String,
    eventType: String,
    studyMinutesDelta: Int,
    lastPositionSeconds: Int
  ): IO[Unit] =
    using(connection.prepareStatement(insertLessonStudyEventSql)) { statement =>
      IO.blocking {
        statement.setObject(1, s"lse-${UUID.randomUUID().toString.take(12)}")
        statement.setObject(2, userId)
        statement.setObject(3, lessonId)
        statement.setObject(4, eventType)
        statement.setObject(5, Math.max(0, studyMinutesDelta))
        statement.setObject(6, Math.max(0, lastPositionSeconds))
        statement.setObject(7, Instant.now().toString)
        statement.executeUpdate()
      }.void
    }

  private[learning] def using[A <: AutoCloseable, B](resource: A)(use: A => IO[B]): IO[B] =
    use(resource).guarantee(IO.blocking(resource.close()).handleErrorWith(_ => IO.unit))
