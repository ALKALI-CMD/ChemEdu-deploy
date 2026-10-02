package microservices.course.learning.tables

import cats.effect.IO

import java.sql.Connection

private[learning] object LearningTableInitializer:

  val initStatements: List[String] = List(
    """
      |create table if not exists edu_lesson_progress (
      |  user_id varchar(64) not null references edu_users(id) on delete cascade,
      |  lesson_id varchar(64) not null references edu_course_lessons(id) on delete cascade,
      |  status varchar(32) not null,
      |  updated_at varchar(80) not null,
      |  primary key (user_id, lesson_id)
      |);
      |
      |create table if not exists edu_lesson_study_events (
      |  id varchar(64) primary key,
      |  user_id varchar(64) not null references edu_users(id) on delete cascade,
      |  lesson_id varchar(64) not null references edu_course_lessons(id) on delete cascade,
      |  event_type varchar(32) not null,
      |  study_minutes_delta integer not null default 0,
      |  last_position_seconds integer not null default 0,
      |  recorded_at varchar(80) not null
      |);
      |
      |create table if not exists edu_assignments (
      |  id varchar(64) primary key,
      |  course_id varchar(64) not null references edu_courses(id) on delete cascade,
      |  student_id varchar(64) references edu_users(id) on delete cascade,
      |  title varchar(200) not null,
      |  description text not null,
      |  deadline varchar(80) not null,
      |  attachment_label varchar(255) not null default '',
      |  submission_status varchar(32) not null,
      |  score integer
      |);
      |
      |create table if not exists edu_quizzes (
      |  id varchar(64) primary key,
      |  course_id varchar(64) not null references edu_courses(id) on delete cascade,
      |  student_id varchar(64) references edu_users(id) on delete cascade,
      |  title varchar(200) not null,
      |  duration_minutes integer not null,
      |  objective_question_count integer not null,
      |  subjective_question_count integer not null,
      |  status varchar(32) not null,
      |  score integer
      |);
      |
      |create table if not exists edu_quiz_answer_keys (
      |  quiz_id varchar(64) not null references edu_quizzes(id) on delete cascade,
      |  question_index integer not null,
      |  correct_option varchar(4) not null,
      |  primary key (quiz_id, question_index)
      |);
      |
      |alter table edu_lesson_progress add column if not exists study_minutes integer not null default 0;
      |alter table edu_lesson_progress add column if not exists last_position_seconds integer not null default 0;
      |alter table edu_lesson_progress add column if not exists last_studied_at varchar(80);
      |alter table edu_lesson_progress add column if not exists completed_preview_resource_ids text not null default '';
      |alter table edu_lesson_progress add column if not exists last_playback_rate double precision not null default 1;
      |
      |alter table edu_course_lessons add column if not exists content_blocks text not null default '[]';
      |alter table edu_course_lessons add column if not exists resource_attachments text not null default '[]';
      |alter table edu_course_lessons add column if not exists video_url text;
      |alter table edu_course_lessons add column if not exists document_url text;
      |alter table edu_course_lessons add column if not exists unlock_after_lesson_id varchar(64);
      |alter table edu_course_lessons add column if not exists required_study_minutes integer not null default 20;
      |
      |alter table edu_assignments add column if not exists submission_content text;
      |alter table edu_assignments add column if not exists submitted_at varchar(80);
      |alter table edu_assignments add column if not exists feedback text;
      |alter table edu_assignments add column if not exists reviewer_name varchar(120);
      |alter table edu_assignments add column if not exists submission_attachments text;
      |alter table edu_assignments add column if not exists review_attachments text;
      |alter table edu_assignments add column if not exists reviewed_at varchar(80);
      |alter table edu_assignments add column if not exists attempt_count integer not null default 0;
      |alter table edu_assignments add column if not exists max_attempts integer not null default 2;
      |alter table edu_assignments add column if not exists allow_late_submission boolean not null default true;
      |alter table edu_assignments add column if not exists allow_resubmission boolean not null default true;
      |alter table edu_assignments add column if not exists allow_make_up_submission boolean not null default false;
      |alter table edu_assignments add column if not exists late_submission_deadline varchar(80);
      |alter table edu_assignments add column if not exists late_penalty_percent_per_day integer not null default 0;
      |alter table edu_assignments add column if not exists late_penalty_cap_percent integer not null default 0;
      |alter table edu_assignments add column if not exists late_penalty_applied_percent integer not null default 0;
      |alter table edu_assignments add column if not exists late_submitted boolean not null default false;
      |alter table edu_assignments add column if not exists raw_score integer;
      |alter table edu_assignments add column if not exists submission_note text;
      |alter table edu_assignments add column if not exists rubric_json text not null default '[]';
      |alter table edu_assignments add column if not exists rubric_scores_json text not null default '[]';
      |alter table edu_assignments add column if not exists teacher_annotations_json text not null default '[]';
      |alter table edu_assignments add column if not exists submission_history_json text not null default '[]';
      |alter table edu_assignments add column if not exists review_history_json text not null default '[]';
      |
      |alter table edu_quizzes add column if not exists subjective_answer text;
      |alter table edu_quizzes add column if not exists submitted_at varchar(80);
      |alter table edu_quizzes add column if not exists objective_score integer;
      |alter table edu_quizzes add column if not exists subjective_score integer;
      |alter table edu_quizzes add column if not exists subjective_feedback text;
      |alter table edu_quizzes add column if not exists reviewer_name varchar(120);
      |alter table edu_quizzes add column if not exists reviewed_at varchar(80);
      |alter table edu_quizzes add column if not exists draw_count integer;
      |alter table edu_quizzes add column if not exists shuffle_questions boolean not null default false;
      |alter table edu_quizzes add column if not exists shuffle_options boolean not null default false;
      |alter table edu_quizzes add column if not exists question_bank_json text not null default '[]';
      |alter table edu_quizzes add column if not exists objective_answer_record_json text not null default '[]';
      |alter table edu_quizzes add column if not exists wrong_question_ids_json text not null default '[]';
      |""".stripMargin
  )

  val progressSeedCountSql: String =
    """
      |select count(*)
      |from edu_lesson_progress
      |""".stripMargin

  val progressSeedStatements: List[String] = List(
    """
      |insert into edu_lesson_progress (user_id, lesson_id, status, updated_at)
      |values ('student-lin', 'l1', 'completed', '2026-03-20T12:30:00Z')
      |on conflict do nothing
      |""".stripMargin,
    """
      |insert into edu_lesson_progress (user_id, lesson_id, status, updated_at)
      |values ('student-lin', 'l2', 'completed', '2026-03-21T12:30:00Z')
      |on conflict do nothing
      |""".stripMargin,
    """
      |insert into edu_lesson_progress (user_id, lesson_id, status, updated_at)
      |values ('student-lin', 'l5', 'completed', '2026-03-25T12:30:00Z')
      |on conflict do nothing
      |""".stripMargin,
    """
      |insert into edu_lesson_progress (user_id, lesson_id, status, updated_at)
      |values ('student-lin', 'l8', 'completed', '2026-03-27T12:30:00Z')
      |on conflict do nothing
      |""".stripMargin
  )

  val quizAnswerKeySeedCountSql: String =
    """
      |select count(*)
      |from edu_quiz_answer_keys
      |""".stripMargin

  val quizAnswerKeySeedStatements: List[String] = List(
    """
      |insert into edu_quiz_answer_keys (quiz_id, question_index, correct_option)
      |values ('q1', 1, 'A')
      |on conflict do nothing
      |""".stripMargin,
    """
      |insert into edu_quiz_answer_keys (quiz_id, question_index, correct_option)
      |values ('q1', 2, 'C')
      |on conflict do nothing
      |""".stripMargin,
    """
      |insert into edu_quiz_answer_keys (quiz_id, question_index, correct_option)
      |values ('q1', 3, 'B')
      |on conflict do nothing
      |""".stripMargin,
    """
      |insert into edu_quiz_answer_keys (quiz_id, question_index, correct_option)
      |values ('q2', 1, 'D')
      |on conflict do nothing
      |""".stripMargin,
    """
      |insert into edu_quiz_answer_keys (quiz_id, question_index, correct_option)
      |values ('q2', 2, 'A')
      |on conflict do nothing
      |""".stripMargin
  )

  def initialize(connection: Connection): IO[Unit] =
    executeStatements(connection, initStatements)

  def seedSamples(connection: Connection): IO[Unit] =
    for
      _ <- seedIfEmpty(connection, progressSeedCountSql, progressSeedStatements)
      _ <- seedIfEmpty(connection, quizAnswerKeySeedCountSql, quizAnswerKeySeedStatements)
    yield ()

  private def executeStatements(connection: Connection, statements: List[String]): IO[Unit] =
    statements.foldLeft(IO.unit)((acc, sql) => acc.flatMap(_ => executeSql(connection, sql)))

  private def executeSql(connection: Connection, sql: String): IO[Unit] =
    using(connection.createStatement())(statement => IO.blocking(statement.execute(sql)).void)

  private def seedIfEmpty(connection: Connection, countSql: String, seedStatements: List[String]): IO[Unit] =
    countRows(connection, countSql).flatMap { count =>
      if count == 0 then executeStatements(connection, seedStatements)
      else IO.unit
    }

  private def countRows(connection: Connection, sql: String): IO[Int] =
    using(connection.createStatement()) { statement =>
      IO.blocking {
        val resultSet = statement.executeQuery(sql)
        try if resultSet.next() then resultSet.getInt(1) else 0
        finally resultSet.close()
      }
    }

  private def using[A <: AutoCloseable, B](resource: A)(use: A => IO[B]): IO[B] =
    use(resource).guarantee(IO.blocking(resource.close()).handleErrorWith(_ => IO.unit))
