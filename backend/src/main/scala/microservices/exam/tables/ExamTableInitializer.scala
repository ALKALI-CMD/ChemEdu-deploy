// 文件说明：考试评定域存储初始化语句，启动时创建期次、考试、答题卡、判分、争分、分析与线索表。
package microservices.exam.tables

import cats.effect.IO
import cats.syntax.all.*

import java.sql.Connection

private[exam] object ExamTableInitializer:

  val initStatements: List[String] = List(
    """
      |create table if not exists edu_training_cohorts (
      |  id varchar(64) primary key,
      |  name varchar(200) not null,
      |  season varchar(40) not null,
      |  start_date varchar(80) not null,
      |  end_date varchar(80) not null,
      |  description text not null default '',
      |  member_ids text not null default '',
      |  status varchar(32) not null default 'active',
      |  created_by varchar(64),
      |  created_at varchar(80) not null
      |);
      |""".stripMargin,
    """
      |create table if not exists edu_exams (
      |  id varchar(64) primary key,
      |  cohort_id varchar(64) not null references edu_training_cohorts(id) on delete cascade,
      |  name varchar(200) not null,
      |  description text not null default '',
      |  scheduled_start varchar(80) not null,
      |  scheduled_end varchar(80) not null,
      |  argue_hours integer not null default 48,
      |  argue_deadline varchar(80),
      |  status varchar(32) not null default 'draft',
      |  questions text not null default '[]',
      |  grading_regions text not null default '{}',
      |  sheet_template_image text,
      |  created_by varchar(64) not null,
      |  created_at varchar(80) not null,
      |  released_at varchar(80)
      |);
      |""".stripMargin,
    """
      |create table if not exists edu_answer_sheets (
      |  id varchar(64) primary key,
      |  exam_id varchar(64) not null references edu_exams(id) on delete cascade,
      |  student_id varchar(64) not null references edu_users(id) on delete cascade,
      |  student_name varchar(120) not null,
      |  image_data text not null,
      |  status varchar(32) not null default 'pending',
      |  raw_total double precision,
      |  converted_total double precision,
      |  uploaded_by_name varchar(120) not null default '',
      |  uploaded_at varchar(80) not null,
      |  graded_at varchar(80)
      |);
      |""".stripMargin,
    """
      |create table if not exists edu_question_scores (
      |  id varchar(64) primary key,
      |  exam_id varchar(64) not null references edu_exams(id) on delete cascade,
      |  sheet_id varchar(64) not null references edu_answer_sheets(id) on delete cascade,
      |  question_id varchar(64) not null,
      |  score double precision not null,
      |  max_score double precision not null,
      |  converted_score double precision not null,
      |  comment text not null default '',
      |  grader_id varchar(64) not null,
      |  grader_name varchar(120) not null default '',
      |  graded_at varchar(80) not null,
      |  adjusted boolean not null default false
      |);
      |""".stripMargin,
    """
      |create index if not exists idx_edu_question_scores_sheet on edu_question_scores(sheet_id);
      |""".stripMargin,
    """
      |create table if not exists edu_exam_argues (
      |  id varchar(64) primary key,
      |  exam_id varchar(64) not null references edu_exams(id) on delete cascade,
      |  sheet_id varchar(64) not null references edu_answer_sheets(id) on delete cascade,
      |  student_id varchar(64) not null,
      |  student_name varchar(120) not null default '',
      |  question_id varchar(64) not null,
      |  question_title varchar(200) not null default '',
      |  reason text not null,
      |  status varchar(32) not null default 'open',
      |  response text not null default '',
      |  handled_by_name varchar(120),
      |  created_at varchar(80) not null,
      |  resolved_at varchar(80)
      |);
      |""".stripMargin,
    """
      |create table if not exists edu_exam_analyses (
      |  id varchar(64) primary key,
      |  exam_id varchar(64) not null references edu_exams(id) on delete cascade,
      |  student_id varchar(64) not null,
      |  student_name varchar(120) not null default '',
      |  source varchar(32) not null default 'heuristic',
      |  model varchar(120) not null default '',
      |  content text not null,
      |  generated_at varchar(80) not null
      |);
      |""".stripMargin,
    """
      |create table if not exists edu_enrollment_leads (
      |  id varchar(64) primary key,
      |  student_name varchar(120) not null,
      |  contact varchar(120) not null,
      |  grade_level varchar(40) not null default '',
      |  target_stage varchar(40) not null default '',
      |  course_interest varchar(200) not null default '',
      |  message text not null default '',
      |  status varchar(32) not null default 'new',
      |  created_at varchar(80) not null
      |);
      |""".stripMargin
  )

  def initialize(connection: Connection): IO[Unit] =
    initStatements.traverse_(sql =>
      IO.blocking {
        val statement = connection.createStatement()
        try
          statement.execute(sql)
          ()
        finally statement.close()
      }
    )
