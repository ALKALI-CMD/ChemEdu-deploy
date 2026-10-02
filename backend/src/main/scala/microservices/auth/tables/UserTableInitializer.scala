package microservices.auth.tables

import cats.effect.IO

import java.sql.Connection

private[auth] object UserTableInitializer:

  val initTableSql: String =
    """
      |create table if not exists edu_users (
      |  id varchar(64) primary key,
      |  name varchar(120) not null,
      |  email varchar(200) not null unique,
      |  password_hash varchar(256) not null,
      |  password_salt varchar(128) not null,
      |  role varchar(32) not null,
      |  age integer,
      |  grade varchar(120),
      |  subject varchar(120),
      |  department_id varchar(64),
      |  department_name varchar(120),
      |  major_id varchar(64),
      |  major_name varchar(120),
      |  academic_class_id varchar(64),
      |  academic_class_name varchar(120),
      |  bio text not null,
      |  permissions text not null default '',
      |  avatar_url text,
      |  created_at timestamptz not null default now()
      |);
      |
      |create index if not exists edu_users_role_idx on edu_users(role);
      |create index if not exists edu_users_academic_class_id_idx on edu_users(academic_class_id);
      |
      |alter table edu_users add column if not exists password_hash varchar(256);
      |alter table edu_users add column if not exists password_salt varchar(128);
      |alter table edu_users add column if not exists age integer;
      |alter table edu_users add column if not exists grade varchar(120);
      |alter table edu_users add column if not exists subject varchar(120);
      |alter table edu_users add column if not exists department_id varchar(64);
      |alter table edu_users add column if not exists department_name varchar(120);
      |alter table edu_users add column if not exists major_id varchar(64);
      |alter table edu_users add column if not exists major_name varchar(120);
      |alter table edu_users add column if not exists academic_class_id varchar(64);
      |alter table edu_users add column if not exists academic_class_name varchar(120);
      |alter table edu_users add column if not exists bio text;
      |alter table edu_users add column if not exists permissions text;
      |alter table edu_users add column if not exists avatar_url text;
      |alter table edu_users add column if not exists created_at timestamptz not null default now();
      |
      |do $$
      |begin
      |  if exists (
      |    select 1
      |    from information_schema.columns
      |    where table_name = 'edu_users' and column_name = 'password'
      |  ) then
      |    alter table edu_users alter column password drop not null;
      |  end if;
      |end $$;
      |
      |update edu_users
      |set password_hash = 'b36457a8929232f22cd638099741d110a742c584d7031d4d39228880b11e40b4'
      |where password_hash is null or password_hash = '';
      |
      |update edu_users
      |set password_salt = '00112233445566778899aabbccddeeff'
      |where password_salt is null or password_salt = '';
      |
      |update edu_users set bio = '' where bio is null;
      |update edu_users set permissions = '' where permissions is null;
      |
      |alter table edu_users alter column password_hash set not null;
      |alter table edu_users alter column password_salt set not null;
      |alter table edu_users alter column bio set not null;
      |alter table edu_users alter column permissions set not null;
      |""".stripMargin

  def initialize(connection: Connection): IO[Unit] =
    executeSql(connection, initTableSql)

  private def executeSql(connection: Connection, sql: String): IO[Unit] =
    IO.blocking {
      val statement = connection.createStatement()
      try statement.execute(sql)
      finally statement.close()
    }.void
