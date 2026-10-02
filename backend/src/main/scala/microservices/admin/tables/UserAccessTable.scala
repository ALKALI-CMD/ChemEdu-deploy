package microservices.admin.tables

import cats.effect.IO
import microservices.auth.objects.{UserProfile, UserRole}

import java.sql.{Connection, ResultSet}
import scala.collection.mutable

object UserAccessTable:
  private val findByIdSql: String =
    """
      |select id, name, email, role, age, grade, subject, bio, avatar_url, permissions,
      |department_id, department_name, major_id, major_name, academic_class_id, academic_class_name
      |from edu_users
      |where id = ?
      |""".stripMargin

  private val listUsersSql: String =
    """
      |select id, name, email, role, age, grade, subject, bio, avatar_url, permissions,
      |department_id, department_name, major_id, major_name, academic_class_id, academic_class_name
      |from edu_users
      |order by created_at asc
      |""".stripMargin

  private val updateAccessSql: String =
    """
      |update edu_users
      |set role = ?, permissions = ?
      |where id = ?
      |""".stripMargin

  private[admin] def findById(connection: Connection, userId: String): IO[Option[UserProfile]] =
    IO.blocking {
      val statement = connection.prepareStatement(findByIdSql)
      try
        statement.setString(1, userId)
        val resultSet = statement.executeQuery()
        try if resultSet.next() then Some(readUser(resultSet)) else None
        finally resultSet.close()
      finally statement.close()
    }

  private[admin] def list(connection: Connection): IO[List[UserProfile]] =
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

  private[admin] def updateAccess(connection: Connection, userId: String, role: UserRole, permissions: List[String]): IO[Unit] =
    IO.blocking {
      val statement = connection.prepareStatement(updateAccessSql)
      try
        statement.setString(1, UserRole.toString(role))
        statement.setString(2, encodePermissions(permissions))
        statement.setString(3, userId)
        statement.executeUpdate()
        ()
      finally statement.close()
    }

  private def encodePermissions(values: List[String]): String =
    values.filter(_.nonEmpty).mkString(",")

  private def readUser(resultSet: ResultSet): UserProfile =
    UserProfile(
      id = resultSet.getString("id"),
      name = resultSet.getString("name"),
      email = resultSet.getString("email"),
      role = UserRole.fromString(resultSet.getString("role")).getOrElse(UserRole.Student),
      age = Option(resultSet.getObject("age")).map(_.toString.toInt),
      grade = Option(resultSet.getString("grade")).filter(_.nonEmpty),
      subject = Option(resultSet.getString("subject")).filter(_.nonEmpty),
      departmentId = optionalString(resultSet, "department_id"),
      departmentName = optionalString(resultSet, "department_name"),
      majorId = optionalString(resultSet, "major_id"),
      majorName = optionalString(resultSet, "major_name"),
      academicClassId = optionalString(resultSet, "academic_class_id"),
      academicClassName = optionalString(resultSet, "academic_class_name"),
      bio = resultSet.getString("bio"),
      avatarUrl = optionalString(resultSet, "avatar_url"),
      permissions = Option(resultSet.getString("permissions")).filter(_.nonEmpty).map(decodeCsv)
    )

  private def optionalString(resultSet: ResultSet, column: String): Option[String] =
    try Option(resultSet.getString(column)).filter(_.nonEmpty)
    catch
      case _: Throwable => None

  private def decodeCsv(value: String): List[String] =
    Option(value).toList.flatMap(_.split(",")).map(_.trim).filter(_.nonEmpty)
