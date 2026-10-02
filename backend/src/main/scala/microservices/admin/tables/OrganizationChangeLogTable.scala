package microservices.admin.tables

import cats.effect.IO
import microservices.admin.objects.OrganizationChangeLog

import java.sql.Connection

object OrganizationChangeLogTable:

  val schemaStatements: List[String] = List(
    """
      |create table if not exists edu_org_change_logs (
      |  id varchar(64) primary key,
      |  actor_name varchar(120) not null,
      |  action varchar(120) not null,
      |  target_type varchar(80) not null,
      |  target_id varchar(120) not null,
      |  detail text not null,
      |  created_at varchar(80) not null
      |);
      |""".stripMargin
  )

  val listOrganizationChangeLogsSql: String =
    """
      |select id, actor_name, action, target_type, target_id, detail, created_at
      |from edu_org_change_logs
      |order by created_at desc
      |""".stripMargin

  val insertOrganizationChangeLogSql: String =
    """
      |insert into edu_org_change_logs (id, actor_name, action, target_type, target_id, detail, created_at)
      |values (?, ?, ?, ?, ?, ?, ?)
      |""".stripMargin

  def insert(
    connection: Connection,
    actorName: String,
    action: String,
    targetType: String,
    targetId: String,
    detail: String
  ): IO[Unit] =
    IO.blocking {
      val statement = connection.prepareStatement(insertOrganizationChangeLogSql)
      try
        statement.setObject(1, s"org-log-${java.util.UUID.randomUUID().toString.take(8)}")
        statement.setObject(2, actorName)
        statement.setObject(3, action)
        statement.setObject(4, targetType)
        statement.setObject(5, targetId)
        statement.setObject(6, detail)
        statement.setObject(7, java.time.Instant.now().toString)
        statement.executeUpdate()
        ()
      finally statement.close()
    }

  def list(connection: Connection): IO[List[OrganizationChangeLog]] =
    IO.blocking {
      val statement = connection.createStatement()
      try
        val resultSet = statement.executeQuery(listOrganizationChangeLogsSql)
        try
          val buffer = scala.collection.mutable.ListBuffer.empty[OrganizationChangeLog]
          while resultSet.next() do
            buffer += OrganizationChangeLog(
              id = resultSet.getString("id"),
              actorName = resultSet.getString("actor_name"),
              action = resultSet.getString("action"),
              targetType = resultSet.getString("target_type"),
              targetId = resultSet.getString("target_id"),
              detail = resultSet.getString("detail"),
              createdAt = resultSet.getString("created_at")
            )
          buffer.toList
        finally resultSet.close()
      finally statement.close()
    }
