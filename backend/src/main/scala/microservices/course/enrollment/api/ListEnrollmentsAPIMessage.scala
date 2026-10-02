// 文件说明：后端课程报名接口实现，用于处理列表查询Enrollments请求并返回类型安全响应。
package microservices.course.enrollment.api

import cats.effect.IO
import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}
import microservices.auth.api.RequireSessionUserAPIMessage
import microservices.course.enrollment.objects.CourseEnrollment
import microservices.course.enrollment.tables.EnrollmentTable
import system.api.{ConnectionAPIMessage, ConnectionApiMessageSchema}

import java.sql.Connection

final case class ListEnrollmentsAPIMessage(
  sessionToken: String
) extends ConnectionAPIMessage[List[CourseEnrollment]]:
  override def plan(connection: Connection): IO[List[CourseEnrollment]] =
    ListEnrollmentsAPIMessage.schema.execute(this, connection)

object ListEnrollmentsAPIMessage:
  val inputDecoder: Decoder[ListEnrollmentsAPIMessage] = deriveDecoder[ListEnrollmentsAPIMessage]
  val outputEncoder: Encoder[List[CourseEnrollment]] = Encoder.encodeList[CourseEnrollment]
  val schema: ConnectionApiMessageSchema[ListEnrollmentsAPIMessage, List[CourseEnrollment]] = ConnectionApiMessageSchema(
    name = "ListEnrollmentsAPIMessage",
    inputDecoder = inputDecoder,
    outputEncoder = outputEncoder,
    execute = (input, connection) =>
      for
        currentUser <- RequireSessionUserAPIMessage(input.sessionToken).plan(connection)
        enrollments <- EnrollmentTable.listEnrollments(connection, currentUser)
      yield enrollments
  )
  given Decoder[ListEnrollmentsAPIMessage] = inputDecoder
  given Encoder[ListEnrollmentsAPIMessage] = deriveEncoder[ListEnrollmentsAPIMessage]
