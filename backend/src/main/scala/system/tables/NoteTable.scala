package system.tables

import cats.effect.IO
import system.objects.*

import java.sql.{Connection, PreparedStatement, ResultSet, Timestamp}
import java.util.UUID

object NoteTable:
  private val initializeSql: String =
    """
      |create table if not exists demo_notes (
      |  id uuid primary key,
      |  title varchar(120) not null,
      |  body text not null,
      |  status varchar(32) not null check (status in ('draft', 'published')),
      |  created_at timestamptz not null
      |);
      |
      |comment on table demo_notes is 'JDBC + PostgreSQL demo notes table';
      |comment on column demo_notes.id is 'NoteId(UUID)';
      |comment on column demo_notes.title is 'NoteTitle';
      |comment on column demo_notes.body is 'NoteBody';
      |comment on column demo_notes.status is 'NoteStatus';
      |comment on column demo_notes.created_at is 'Instant';
      |""".stripMargin

  private val insertSql: String =
    """
      |insert into demo_notes (id, title, body, status, created_at)
      |values (?, ?, ?, ?, ?)
      |returning id, title, body, status, created_at
      |""".stripMargin

  private val findByIdSql: String =
    """
      |select id, title, body, status, created_at
      |from demo_notes
      |where id = ?
      |""".stripMargin

  def initialize(connection: Connection): IO[Unit] =
    IO.blocking {
      val statement = connection.createStatement()
      try statement.execute(initializeSql)
      finally statement.close()
    }

  def insert(connection: Connection, title: NoteTitle, body: NoteBody, status: NoteStatus): IO[DemoNote] =
    IO.blocking {
      val noteId = NoteId(UUID.randomUUID())
      val createdAt = java.time.Instant.now()
      val statement = connection.prepareStatement(insertSql)
      try
        setNoteId(statement, 1, noteId)
        setNoteTitle(statement, 2, title)
        setNoteBody(statement, 3, body)
        setNoteStatus(statement, 4, status)
        setInstant(statement, 5, createdAt)

        val resultSet = statement.executeQuery()
        try
          if resultSet.next() then readDemoNote(resultSet)
          else throw new IllegalStateException("Insert succeeded but returned no row")
        finally resultSet.close()
      finally statement.close()
    }

  def findById(connection: Connection, noteId: NoteId): IO[Option[DemoNote]] =
    IO.blocking {
      val statement = connection.prepareStatement(findByIdSql)
      try
        setNoteId(statement, 1, noteId)
        val resultSet = statement.executeQuery()
        try
          if resultSet.next() then Some(readDemoNote(resultSet))
          else None
        finally resultSet.close()
      finally statement.close()
    }

  private def setNoteId(statement: PreparedStatement, index: Int, noteId: NoteId): Unit =
    statement.setObject(index, noteId.value)

  private def setNoteTitle(statement: PreparedStatement, index: Int, title: NoteTitle): Unit =
    statement.setString(index, title.value)

  private def setNoteBody(statement: PreparedStatement, index: Int, body: NoteBody): Unit =
    statement.setString(index, body.value)

  private def setNoteStatus(statement: PreparedStatement, index: Int, status: NoteStatus): Unit =
    statement.setString(index, NoteStatus.toString(status))

  private def setInstant(statement: PreparedStatement, index: Int, instant: java.time.Instant): Unit =
    statement.setTimestamp(index, Timestamp.from(instant))

  private def readDemoNote(resultSet: ResultSet): DemoNote =
    DemoNote(
      id = NoteId(resultSet.getObject("id", classOf[java.util.UUID])),
      title = NoteTitle(resultSet.getString("title")),
      body = NoteBody(resultSet.getString("body")),
      status = NoteStatus.fromString(resultSet.getString("status"))
        .fold(message => throw new IllegalArgumentException(message), identity),
      createdAt = resultSet.getTimestamp("created_at").toInstant
    )
