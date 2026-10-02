package microservices.admin.tables

import cats.effect.IO

import java.sql.Connection

private[admin] object AdminTableInitializer:

  val initTableSql: String =
    """
      |create table if not exists edu_departments (
      |  id varchar(64) primary key,
      |  name varchar(120) not null
      |);
      |
      |create table if not exists edu_majors (
      |  id varchar(64) primary key,
      |  department_id varchar(64) not null references edu_departments(id) on delete cascade,
      |  name varchar(120) not null
      |);
      |
      |create table if not exists edu_academic_classes (
      |  id varchar(64) primary key,
      |  major_id varchar(64) not null references edu_majors(id) on delete cascade,
      |  grade varchar(80) not null,
      |  name varchar(120) not null,
      |  capacity integer not null default 50
      |);
      |
      |create table if not exists edu_semesters (
      |  id varchar(64) primary key,
      |  label varchar(120) not null,
      |  start_at varchar(80) not null,
      |  end_at varchar(80) not null,
      |  archived boolean not null default false
      |);
      |
      |create table if not exists edu_messages (
      |  id varchar(64) primary key,
      |  sender_name varchar(120) not null,
      |  recipient_name varchar(120) not null,
      |  content text not null,
      |  attachment_label varchar(200),
      |  sent_at varchar(80) not null,
      |  read boolean not null default false,
      |  category varchar(64) not null default 'message',
      |  course_id varchar(64)
      |);
      |
      |create table if not exists edu_notifications (
      |  id varchar(64) primary key,
      |  user_id varchar(64) not null references edu_users(id) on delete cascade,
      |  course_id varchar(64),
      |  category varchar(64) not null,
      |  title varchar(200) not null,
      |  content text not null,
      |  read boolean not null default false,
      |  created_at varchar(80) not null,
      |  action_url varchar(240)
      |);
      |
      |create table if not exists edu_notification_settings (
      |  user_id varchar(64) not null references edu_users(id) on delete cascade,
      |  category varchar(64) not null,
      |  enabled boolean not null default true,
      |  primary key (user_id, category)
      |);
      |
      |create table if not exists edu_orders (
      |  id varchar(64) primary key,
      |  buyer varchar(120) not null,
      |  course_title varchar(200) not null,
      |  amount integer not null,
      |  status varchar(32) not null,
      |  paid_at varchar(80) not null,
      |  original_amount integer not null default 0,
      |  discount_amount integer not null default 0,
      |  payment_state varchar(32) not null default 'paid',
      |  payment_method varchar(64),
      |  coupon_code varchar(64),
      |  refund_status varchar(64),
      |  refund_amount integer not null default 0,
      |  invoice_status varchar(64),
      |  invoice_title varchar(200),
      |  promotion_id varchar(64),
      |  billing_cycle varchar(64)
      |);
      |
      |create table if not exists edu_coupons (
      |  id varchar(64) primary key,
      |  code varchar(64) not null unique,
      |  title varchar(200) not null,
      |  discount_amount integer not null,
      |  min_amount integer not null,
      |  valid_from varchar(80) not null,
      |  valid_to varchar(80) not null,
      |  active boolean not null default true
      |);
      |
      |create table if not exists edu_promotions (
      |  id varchar(64) primary key,
      |  title varchar(200) not null,
      |  description text not null,
      |  discount_percent integer not null,
      |  starts_at varchar(80) not null,
      |  ends_at varchar(80) not null,
      |  active boolean not null default true
      |);
      |
      |create table if not exists edu_invoices (
      |  id varchar(64) primary key,
      |  order_id varchar(64) not null,
      |  title varchar(200) not null,
      |  amount integer not null,
      |  status varchar(64) not null,
      |  issued_at varchar(80)
      |);
      |
      |create table if not exists edu_refunds (
      |  id varchar(64) primary key,
      |  order_id varchar(64) not null,
      |  amount integer not null,
      |  reason text not null,
      |  status varchar(64) not null,
      |  requested_at varchar(80) not null,
      |  processed_at varchar(80)
      |);
      |
      |create table if not exists edu_resource_assets (
      |  id varchar(64) primary key,
      |  course_id varchar(64) not null references edu_courses(id) on delete cascade,
      |  owner_id varchar(64) not null references edu_users(id) on delete cascade,
      |  filename varchar(240) not null,
      |  content_type varchar(120) not null,
      |  size_bytes bigint not null,
      |  storage_key varchar(320) not null,
      |  preview_url varchar(320) not null,
      |  download_url varchar(320) not null,
      |  version integer not null default 1,
      |  visibility varchar(64) not null default 'course_members',
      |  created_at varchar(80) not null,
      |  updated_at varchar(80) not null
      |);
      |
      |create table if not exists edu_teacher_tasks (
      |  id varchar(64) primary key,
      |  title varchar(200) not null,
      |  assignee varchar(120) not null,
      |  status varchar(32) not null
      |);
      |
      |create table if not exists edu_course_audits (
      |  course_id varchar(64) primary key references edu_courses(id) on delete cascade,
      |  audit_status varchar(32) not null,
      |  audit_comment text not null,
      |  audited_by varchar(120),
      |  audited_at varchar(80)
      |);
      |
      |create table if not exists edu_org_change_logs (
      |  id varchar(64) primary key,
      |  actor_name varchar(120) not null,
      |  action varchar(120) not null,
      |  target_type varchar(80) not null,
      |  target_id varchar(120) not null,
      |  detail text not null,
      |  created_at varchar(80) not null
      |);
      |
      |alter table edu_messages add column if not exists read boolean not null default false;
      |alter table edu_messages add column if not exists category varchar(64) not null default 'message';
      |alter table edu_messages add column if not exists course_id varchar(64);
      |alter table edu_orders add column if not exists original_amount integer not null default 0;
      |alter table edu_orders add column if not exists discount_amount integer not null default 0;
      |alter table edu_orders add column if not exists payment_state varchar(32) not null default 'paid';
      |alter table edu_orders add column if not exists payment_method varchar(64);
      |alter table edu_orders add column if not exists coupon_code varchar(64);
      |alter table edu_orders add column if not exists refund_status varchar(64);
      |alter table edu_orders add column if not exists refund_amount integer not null default 0;
      |alter table edu_orders add column if not exists invoice_status varchar(64);
      |alter table edu_orders add column if not exists invoice_title varchar(200);
      |alter table edu_orders add column if not exists promotion_id varchar(64);
      |alter table edu_orders add column if not exists billing_cycle varchar(64);
      |alter table edu_course_audits add column if not exists pending_course_payload text;
      |update edu_orders set original_amount = amount where original_amount = 0;
      |""".stripMargin

  def initialize(connection: Connection): IO[Unit] =
    executeSql(connection, initTableSql)

  def seedSamples(connection: Connection): IO[Unit] =
    CourseAuditTable.count(connection).flatMap { count =>
      if count == 0 then executeStatements(connection, CourseAuditTable.seedStatements)
      else IO.unit
    }

  private def executeStatements(connection: Connection, statements: List[String]): IO[Unit] =
    statements.foldLeft(IO.unit)((acc, sql) => acc.flatMap(_ => executeSql(connection, sql)))

  private def executeSql(connection: Connection, sql: String): IO[Unit] =
    IO.blocking {
      val statement = connection.createStatement()
      try statement.execute(sql)
      finally statement.close()
    }.void
