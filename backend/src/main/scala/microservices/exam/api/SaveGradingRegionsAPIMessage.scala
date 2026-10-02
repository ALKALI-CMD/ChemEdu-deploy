// 文件说明：考试评定域接口实现，用于教研老师在答题卡上划定每道题的改题区域。
package microservices.exam.api

import cats.effect.IO
import cats.syntax.all.*
import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}
import microservices.auth.api.RequireSessionUserAPIMessage
import microservices.exam.objects.{ExamStatus, GradingRegion}
import microservices.exam.objects.apiTypes.*
import microservices.exam.tables.ExamTable
import system.api.{ConnectionAPIMessage, ConnectionApiMessageSchema}

import java.sql.Connection

final case class SaveGradingRegionsAPIMessage(
  sessionToken: String,
  examId: String,
  regions: Map[String, GradingRegion],
  sheetTemplateImage: Option[String]
) extends ConnectionAPIMessage[ExamMutationResponse]:
  override def plan(connection: Connection): IO[ExamMutationResponse] =
    SaveGradingRegionsAPIMessage.schema.execute(this, connection)

object SaveGradingRegionsAPIMessage:
  val inputDecoder: Decoder[SaveGradingRegionsAPIMessage] = deriveDecoder[SaveGradingRegionsAPIMessage]
  val outputEncoder: Encoder[ExamMutationResponse] = deriveEncoder[ExamMutationResponse]
  val schema: ConnectionApiMessageSchema[SaveGradingRegionsAPIMessage, ExamMutationResponse] =
    ConnectionApiMessageSchema(
      name = "SaveGradingRegionsAPIMessage",
      inputDecoder = inputDecoder,
      outputEncoder = outputEncoder,
      execute = (input, connection) =>
        for
          currentUser <- RequireSessionUserAPIMessage(input.sessionToken).plan(connection)
          _ <- ExamAccessControl.requireExamManager(currentUser)
          exam <- ExamTable.findExamById(connection, input.examId).flatMap {
            case Some(found) => IO.pure(found)
            case None => IO.raiseError(new IllegalArgumentException("考试不存在。"))
          }
          _ <- if exam.status == ExamStatus.Released.entryName || exam.status == ExamStatus.Archived.entryName then
            IO.raiseError(new IllegalArgumentException("成绩已公布，不能修改改题区域。"))
          else IO.unit
          questionIds = exam.questions.map(_.id).toSet
          _ <- input.regions.keySet.filterNot(questionIds.contains).toList.traverse_ { unknownId =>
            IO.raiseError(new IllegalArgumentException(s"改题区域对应了不存在的题目：$unknownId"))
          }
          _ <- input.regions.values.toList.traverse_(region =>
            if region.x < 0 || region.y < 0 || region.w <= 0 || region.h <= 0 ||
              region.x + region.w > 1.0001 || region.y + region.h > 1.0001 then
              IO.raiseError(new IllegalArgumentException("改题区域坐标必须在答题卡范围内。"))
            else IO.unit)
          templateImage = input.sheetTemplateImage.map(_.trim).filter(_.nonEmpty).orElse(exam.sheetTemplateImage)
          updated = exam.copy(
            gradingRegions = input.regions,
            sheetTemplateImage = templateImage
          )
          _ <- ExamTable.updateExam(connection, updated)
        yield ExamMutationResponse("改题区域已保存。", updated)
    )
  given Decoder[SaveGradingRegionsAPIMessage] = inputDecoder
  given Encoder[SaveGradingRegionsAPIMessage] = deriveEncoder[SaveGradingRegionsAPIMessage]
