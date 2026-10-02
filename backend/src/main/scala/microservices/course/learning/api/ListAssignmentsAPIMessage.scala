// 文件说明：后端学习接口实现，用于处理列表查询Assignments请求并返回类型安全响应。
package microservices.course.learning.api

import microservices.course.learning.tables.AssignmentTable

import cats.effect.IO
import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}
import microservices.auth.objects.{UserProfile, UserRole}
import microservices.course.learning.objects.Assignment
import system.api.{ConnectionAPIMessage, ConnectionApiMessageSchema}

import java.sql.Connection

final case class ListAssignmentsAPIMessage(
  currentUser: UserProfile
) extends ConnectionAPIMessage[List[Assignment]]:
  override def plan(connection: Connection): IO[List[Assignment]] =
    ListAssignmentsAPIMessage.schema.execute(this, connection)

object ListAssignmentsAPIMessage:
  val inputDecoder: Decoder[ListAssignmentsAPIMessage] = deriveDecoder[ListAssignmentsAPIMessage]
  val outputEncoder: Encoder[List[Assignment]] = deriveEncoder[List[Assignment]]
  val schema: ConnectionApiMessageSchema[ListAssignmentsAPIMessage, List[Assignment]] = ConnectionApiMessageSchema(
    name = "ListAssignmentsAPIMessage",
    inputDecoder = inputDecoder,
    outputEncoder = outputEncoder,
    execute = (input, connection) => listAssignments(connection, input.currentUser)
  )

  private[learning] def listAssignments(connection: Connection, currentUser: UserProfile): IO[List[Assignment]] =
    currentUser.role match
      case UserRole.Student =>
        AssignmentTable.listStudentAssignments(connection, currentUser.id)
      case _ =>
        AssignmentTable.listAllSubmittedAssignments(connection)

  given Decoder[ListAssignmentsAPIMessage] = inputDecoder
  given Encoder[ListAssignmentsAPIMessage] = deriveEncoder[ListAssignmentsAPIMessage]
