// 文件说明：考试评定域接口实现，用于阅卷人员拉取某场考试的全部答题卡。
package microservices.exam.api

import cats.effect.IO
import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}
import microservices.auth.api.RequireSessionUserAPIMessage
import microservices.exam.objects.apiTypes.*
import microservices.exam.tables.ExamTable
import system.api.{ConnectionAPIMessage, ConnectionApiMessageSchema}

import java.sql.Connection

final case class ListAnswerSheetsAPIMessage(
  sessionToken: String,
  examId: String
) extends ConnectionAPIMessage[AnswerSheetListResponse]:
  override def plan(connection: Connection): IO[AnswerSheetListResponse] =
    ListAnswerSheetsAPIMessage.schema.execute(this, connection)

object ListAnswerSheetsAPIMessage:
  val inputDecoder: Decoder[ListAnswerSheetsAPIMessage] = deriveDecoder[ListAnswerSheetsAPIMessage]
  val outputEncoder: Encoder[AnswerSheetListResponse] = deriveEncoder[AnswerSheetListResponse]
  val schema: ConnectionApiMessageSchema[ListAnswerSheetsAPIMessage, AnswerSheetListResponse] =
    ConnectionApiMessageSchema(
      name = "ListAnswerSheetsAPIMessage",
      inputDecoder = inputDecoder,
      outputEncoder = outputEncoder,
      execute = (input, connection) =>
        for
          currentUser <- RequireSessionUserAPIMessage(input.sessionToken).plan(connection)
          _ <- ExamAccessControl.requireGrader(currentUser)
          sheets <- ExamTable.listSheetsByExam(connection, input.examId)
          scores <- ExamTable.listScoresByExam(connection, input.examId)
        yield AnswerSheetListResponse("答题卡列表已返回。", sheets, scores)
    )
  given Decoder[ListAnswerSheetsAPIMessage] = inputDecoder
  given Encoder[ListAnswerSheetsAPIMessage] = deriveEncoder[ListAnswerSheetsAPIMessage]
