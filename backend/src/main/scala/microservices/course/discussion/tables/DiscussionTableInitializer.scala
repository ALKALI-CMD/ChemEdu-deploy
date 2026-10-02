package microservices.course.discussion.tables

import cats.effect.IO

import java.sql.Connection

private[discussion] object DiscussionTableInitializer:
  def initialize(connection: Connection): IO[Unit] =
    executeStatements(connection, DiscussionTable.schemaStatements)

  private def executeStatements(connection: Connection, statements: List[String]): IO[Unit] =
    statements.foldLeft(IO.unit)((acc, sql) => acc.flatMap(_ => executeSql(connection, sql)))

  private def executeSql(connection: Connection, sql: String): IO[Unit] =
    using(connection.createStatement())(statement => IO.blocking(statement.execute(sql)).void)

  private def using[A <: AutoCloseable, B](resource: A)(use: A => IO[B]): IO[B] =
    use(resource).guarantee(IO.blocking(resource.close()).handleErrorWith(_ => IO.unit))
