package microservices.auth.tables

import cats.effect.IO
import microservices.auth.objects.{UserId, UserProfile}

import java.sql.{Connection, PreparedStatement, ResultSet, Timestamp}
import java.time.Instant

private[auth] object UserSessionTable:
  private val insertSessionSql: String =
    """
      |insert into edu_sessions (token_hash, user_id, created_at, expires_at)
      |values (?, ?, ?, ?)
      |""".stripMargin

  private val deleteSessionSql: String =
    """
      |delete from edu_sessions
      |where token_hash = ?
      |""".stripMargin

  private val findUserBySessionSql: String =
    """
      |select u.id, u.name, u.email, u.role, u.age, u.grade, u.subject, u.department_id, u.department_name,
      |u.major_id, u.major_name, u.academic_class_id, u.academic_class_name, u.bio, u.permissions, u.avatar_url
      |from edu_sessions s
      |join edu_users u on u.id = s.user_id
      |where s.token_hash = ? and s.expires_at > now()
      |""".stripMargin

  private[auth] def insert(connection: Connection, tokenHash: String, userId: UserId, expiresAt: Instant): IO[Unit] =
    IO.blocking {
      val statement = connection.prepareStatement(insertSessionSql)
      try
        statement.setString(1, tokenHash)
        statement.setString(2, userId.value)
        statement.setTimestamp(3, Timestamp.from(Instant.now()))
        statement.setTimestamp(4, Timestamp.from(expiresAt))
        statement.executeUpdate()
        ()
      finally statement.close()
    }

  private[auth] def delete(connection: Connection, tokenHash: String): IO[Int] =
    IO.blocking {
      val statement = connection.prepareStatement(deleteSessionSql)
      try
        statement.setString(1, tokenHash)
        statement.executeUpdate()
      finally statement.close()
    }

  private[auth] def findUserByTokenHash(connection: Connection, tokenHash: String): IO[Option[UserProfile]] =
    queryOne(connection.prepareStatement(findUserBySessionSql)) { statement =>
      statement.setString(1, tokenHash)
    }(UserTable.readUser)

  private def queryOne[A](statement: PreparedStatement)(bind: PreparedStatement => Unit)(reader: ResultSet => A): IO[Option[A]] =
    IO.blocking {
      try
        bind(statement)
        val resultSet = statement.executeQuery()
        try
          if resultSet.next() then Some(reader(resultSet))
          else None
        finally resultSet.close()
      finally statement.close()
    }
