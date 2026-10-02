package microservices.auth.tables

import cats.effect.IO

import java.sql.Connection

private[auth] object UserSessionTableInitializer:

  val initTableSql: String =
    """
      |create table if not exists edu_sessions (
      |  token_hash varchar(128) primary key,
      |  user_id varchar(64) not null references edu_users(id) on delete cascade,
      |  created_at timestamptz not null default now(),
      |  expires_at timestamptz not null
      |);
      |
      |alter table edu_sessions add column if not exists token_hash varchar(128);
      |alter table edu_sessions add column if not exists user_id varchar(64);
      |alter table edu_sessions add column if not exists created_at timestamptz not null default now();
      |alter table edu_sessions add column if not exists expires_at timestamptz not null default now();
      |
      |delete from edu_sessions;
      |
      |do $$
      |declare
      |  primary_key_name text;
      |begin
      |  for primary_key_name in
      |    select conname
      |    from pg_constraint
      |    where conrelid = 'edu_sessions'::regclass and contype = 'p'
      |  loop
      |    execute format('alter table edu_sessions drop constraint %I', primary_key_name);
      |  end loop;
      |end $$;
      |
      |do $$
      |begin
      |  alter table edu_sessions alter column token drop not null;
      |exception
      |  when undefined_column then null;
      |end $$;
      |
      |alter table edu_sessions alter column token_hash set not null;
      |alter table edu_sessions alter column user_id set not null;
      |alter table edu_sessions alter column created_at set not null;
      |alter table edu_sessions alter column expires_at set not null;
      |
      |do $$
      |begin
      |  if not exists (
      |    select 1
      |    from pg_constraint
      |    where conrelid = 'edu_sessions'::regclass and contype = 'p'
      |  ) then
      |    alter table edu_sessions add constraint edu_sessions_pkey primary key (token_hash);
      |  end if;
      |end $$;
      |
      |create index if not exists edu_sessions_user_id_idx on edu_sessions(user_id);
      |create index if not exists edu_sessions_expires_at_idx on edu_sessions(expires_at);
      |""".stripMargin

  def initialize(connection: Connection): IO[Unit] =
    executeSql(connection, initTableSql)

  private def executeSql(connection: Connection, sql: String): IO[Unit] =
    IO.blocking {
      val statement = connection.createStatement()
      try statement.execute(sql)
      finally statement.close()
    }.void
