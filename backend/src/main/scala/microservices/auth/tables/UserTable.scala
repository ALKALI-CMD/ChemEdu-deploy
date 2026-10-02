package microservices.auth.tables

import cats.effect.IO
import microservices.auth.objects.{UserId, UserProfile, UserRole}

import java.sql.{Connection, PreparedStatement, ResultSet}
import scala.collection.mutable

private[auth] final case class StoredUserCredential(
  user: UserProfile,
  passwordHash: String,
  passwordSalt: String
)

private[auth] object UserTable:
  private val listUsersSql: String =
    """
      |select id, name, email, role, age, grade, subject, department_id, department_name,
      |major_id, major_name, academic_class_id, academic_class_name, bio, permissions, avatar_url
      |from edu_users
      |order by created_at asc
      |""".stripMargin

  private val findByEmailSql: String =
    """
      |select id, name, email, role, age, grade, subject, department_id, department_name,
      |major_id, major_name, academic_class_id, academic_class_name, bio, permissions, avatar_url
      |from edu_users
      |where email = ?
      |""".stripMargin

  private val findByNameSql: String =
    """
      |select id, name, email, role, age, grade, subject, department_id, department_name,
      |major_id, major_name, academic_class_id, academic_class_name, bio, permissions, avatar_url
      |from edu_users
      |where lower(name) = lower(?)
      |""".stripMargin

  private val findByIdSql: String =
    """
      |select id, name, email, role, age, grade, subject, department_id, department_name,
      |major_id, major_name, academic_class_id, academic_class_name, bio, permissions, avatar_url
      |from edu_users
      |where id = ?
      |""".stripMargin

  private val findCredentialByEmailSql: String =
    """
      |select id, name, email, role, age, grade, subject, department_id, department_name,
      |major_id, major_name, academic_class_id, academic_class_name, bio, permissions, avatar_url,
      |password_hash, password_salt
      |from edu_users
      |where email = ?
      |""".stripMargin

  private val insertUserSql: String =
    """
      |insert into edu_users (id, name, email, password_hash, password_salt, role, age, grade, subject, bio, avatar_url, permissions)
      |values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      |returning id, name, email, role, age, grade, subject, department_id, department_name,
      |major_id, major_name, academic_class_id, academic_class_name, bio, permissions, avatar_url
      |""".stripMargin

  private val updateProfileSql: String =
    """
      |update edu_users
      |set name = ?, age = ?, grade = ?, subject = ?, bio = ?, avatar_url = ?
      |where id = ?
      |""".stripMargin

  private val updatePasswordSql: String =
    """
      |update edu_users
      |set password_hash = ?, password_salt = ?
      |where id = ?
      |""".stripMargin

  private[auth] def listUsers(connection: Connection): IO[List[UserProfile]] =
    IO.blocking {
      val statement = connection.createStatement()
      try
        val resultSet = statement.executeQuery(listUsersSql)
        val buffer = mutable.ListBuffer.empty[UserProfile]
        try
          while resultSet.next() do buffer += readUser(resultSet)
          buffer.toList
        finally resultSet.close()
      finally statement.close()
    }

  private[auth] def findByEmail(connection: Connection, email: String): IO[Option[UserProfile]] =
    queryOne(connection.prepareStatement(findByEmailSql)) { statement =>
      statement.setString(1, email)
    }(readUser)

  private[auth] def findByName(connection: Connection, name: String): IO[Option[UserProfile]] =
    queryOne(connection.prepareStatement(findByNameSql)) { statement =>
      statement.setString(1, name)
    }(readUser)

  private[auth] def findById(connection: Connection, userId: UserId): IO[Option[UserProfile]] =
    queryOne(connection.prepareStatement(findByIdSql)) { statement =>
      statement.setString(1, userId.value)
    }(readUser)

  private[auth] def findCredentialByEmail(connection: Connection, email: String): IO[Option[StoredUserCredential]] =
    queryOne(connection.prepareStatement(findCredentialByEmailSql)) { statement =>
      statement.setString(1, email)
    }(readCredential)

  private[auth] def insert(
    connection: Connection,
    userId: UserId,
    name: String,
    email: String,
    passwordHash: String,
    passwordSalt: String,
    role: UserRole,
    age: Option[Int],
    grade: Option[String],
    subject: Option[String],
    bio: String,
    avatarUrl: Option[String],
    permissions: String
  ): IO[UserProfile] =
    IO.blocking {
      val statement = connection.prepareStatement(insertUserSql)
      try
        statement.setString(1, userId.value)
        statement.setString(2, name)
        statement.setString(3, email)
        statement.setString(4, passwordHash)
        statement.setString(5, passwordSalt)
        statement.setString(6, UserRole.toString(role))
        setOptionalInt(statement, 7, age)
        statement.setString(8, grade.orNull)
        statement.setString(9, subject.orNull)
        statement.setString(10, bio)
        statement.setString(11, avatarUrl.orNull)
        statement.setString(12, permissions)
        val resultSet = statement.executeQuery()
        try
          if resultSet.next() then readUser(resultSet)
          else throw new IllegalStateException("User insert returned no row.")
        finally resultSet.close()
      finally statement.close()
    }

  private[auth] def updateProfile(
    connection: Connection,
    userId: UserId,
    name: String,
    age: Option[Int],
    grade: Option[String],
    subject: Option[String],
    bio: String,
    avatarUrl: Option[String]
  ): IO[Unit] =
    IO.blocking {
      val statement = connection.prepareStatement(updateProfileSql)
      try
        statement.setString(1, name)
        setOptionalInt(statement, 2, age)
        statement.setString(3, grade.orNull)
        statement.setString(4, subject.orNull)
        statement.setString(5, bio)
        statement.setString(6, avatarUrl.orNull)
        statement.setString(7, userId.value)
        statement.executeUpdate()
        ()
      finally statement.close()
    }

  private[auth] def updatePassword(connection: Connection, userId: UserId, passwordHash: String, passwordSalt: String): IO[Unit] =
    IO.blocking {
      val statement = connection.prepareStatement(updatePasswordSql)
      try
        statement.setString(1, passwordHash)
        statement.setString(2, passwordSalt)
        statement.setString(3, userId.value)
        statement.executeUpdate()
        ()
      finally statement.close()
    }

  private[auth] def readUser(resultSet: ResultSet): UserProfile =
    UserProfile(
      id = resultSet.getString("id"),
      name = resultSet.getString("name"),
      email = resultSet.getString("email"),
      role = UserRole.fromString(resultSet.getString("role")).getOrElse(UserRole.Student),
      age = Option(resultSet.getObject("age")).map(_.asInstanceOf[Int]),
      grade = Option(resultSet.getString("grade")),
      subject = Option(resultSet.getString("subject")),
      departmentId = Option(resultSet.getString("department_id")),
      departmentName = Option(resultSet.getString("department_name")),
      majorId = Option(resultSet.getString("major_id")),
      majorName = Option(resultSet.getString("major_name")),
      academicClassId = Option(resultSet.getString("academic_class_id")),
      academicClassName = Option(resultSet.getString("academic_class_name")),
      bio = resultSet.getString("bio"),
      avatarUrl = Option(resultSet.getString("avatar_url")),
      permissions = Option(resultSet.getString("permissions")).map(_.split(",").toList.map(_.trim).filter(_.nonEmpty))
    )

  private def readCredential(resultSet: ResultSet): StoredUserCredential =
    StoredUserCredential(
      user = readUser(resultSet),
      passwordHash = resultSet.getString("password_hash"),
      passwordSalt = resultSet.getString("password_salt")
    )

  private def setOptionalInt(statement: PreparedStatement, index: Int, value: Option[Int]): Unit =
    value match
      case Some(number) => statement.setInt(index, number)
      case None => statement.setObject(index, null)

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
