// 文件说明：初始化课程报名相关存储或基础数据的接口定义。
package microservices.course.enrollment.api

import cats.effect.IO
import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}
import microservices.course.enrollment.objects.apiTypes.EnrollmentMessageResponse
import microservices.course.enrollment.tables.EnrollmentTable
import system.api.{ConnectionAPIMessage, ConnectionApiMessageSchema}

import java.sql.Connection

final case class InitializeEnrollmentStorage() extends ConnectionAPIMessage[EnrollmentMessageResponse]:
  override def plan(connection: Connection): IO[EnrollmentMessageResponse] =
    EnrollmentTable.initialize(connection).as(EnrollmentMessageResponse("Enrollment storage initialized."))

object InitializeEnrollmentStorage:
  val inputDecoder: Decoder[InitializeEnrollmentStorage] = deriveDecoder[InitializeEnrollmentStorage]
  val outputEncoder: Encoder[EnrollmentMessageResponse] = deriveEncoder[EnrollmentMessageResponse]
  val schema: ConnectionApiMessageSchema[InitializeEnrollmentStorage, EnrollmentMessageResponse] = ConnectionApiMessageSchema(
    name = "InitializeEnrollmentStorage",
    inputDecoder = inputDecoder,
    outputEncoder = outputEncoder,
    execute = (input, connection) => input.plan(connection)
  )
  given Decoder[InitializeEnrollmentStorage] = inputDecoder
  given Encoder[InitializeEnrollmentStorage] = deriveEncoder[InitializeEnrollmentStorage]
