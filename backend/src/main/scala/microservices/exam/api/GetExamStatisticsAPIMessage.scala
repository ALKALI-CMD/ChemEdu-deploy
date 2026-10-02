// 文件说明：考试评定域接口实现，用于数据分析处汇总各考试的得分分布、题目得分率与期次趋势。
package microservices.exam.api

import cats.effect.IO
import cats.syntax.all.*
import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}
import microservices.auth.api.RequireSessionUserAPIMessage
import microservices.exam.objects.*
import microservices.exam.objects.apiTypes.*
import microservices.exam.tables.ExamTable
import system.api.{ConnectionAPIMessage, ConnectionApiMessageSchema}

import java.sql.Connection

final case class GetExamStatisticsAPIMessage(
  sessionToken: String,
  cohortId: Option[String]
) extends ConnectionAPIMessage[ExamStatisticsResponse]:
  override def plan(connection: Connection): IO[ExamStatisticsResponse] =
    GetExamStatisticsAPIMessage.schema.execute(this, connection)

object GetExamStatisticsAPIMessage:
  val inputDecoder: Decoder[GetExamStatisticsAPIMessage] = deriveDecoder[GetExamStatisticsAPIMessage]
  val outputEncoder: Encoder[ExamStatisticsResponse] = deriveEncoder[ExamStatisticsResponse]
  val schema: ConnectionApiMessageSchema[GetExamStatisticsAPIMessage, ExamStatisticsResponse] =
    ConnectionApiMessageSchema(
      name = "GetExamStatisticsAPIMessage",
      inputDecoder = inputDecoder,
      outputEncoder = outputEncoder,
      execute = (input, connection) =>
        for
          currentUser <- RequireSessionUserAPIMessage(input.sessionToken).plan(connection)
          _ <- ExamAccessControl.requireAnalyst(currentUser)
          cohorts <- ExamTable.listCohorts(connection)
          cohortNames = cohorts.map(cohort => cohort.id -> cohort.name).toMap
          exams <- ExamTable.listExams(connection, input.cohortId)
          summaries <- exams.traverse(summarizeExam(connection, cohortNames))
          trendRows <- buildTrendRows(connection, exams, cohortNames)
        yield ExamStatisticsResponse("考试统计已返回。", summaries, trendRows)
    )

  private def summarizeExam(connection: Connection, cohortNames: Map[String, String])(exam: Exam): IO[ExamStatSummary] =
    for
      sheets <- ExamTable.listSheetsByExam(connection, exam.id)
      scores <- ExamTable.listScoresByExam(connection, exam.id)
      graded = sheets.filter(_.status == SheetStatus.Graded.entryName)
      rawTotals = graded.flatMap(_.rawTotal)
      convertedTotals = graded.flatMap(_.convertedTotal)
      maxConvertedTotal = exam.questions.map(_.convertedScore).sum
      questionStats = exam.questions.map { question =>
        val questionScores = scores.filter(_.questionId == question.id)
        val rates = questionScores.map(_.score / question.maxScore)
        ExamQuestionStat(
          questionId = question.id,
          title = question.title,
          topicTag = question.topicTag,
          avgScore = round2(if questionScores.isEmpty then 0.0 else questionScores.map(_.score).sum / questionScores.size),
          maxScore = question.maxScore,
          avgRate = round2(if rates.isEmpty then 0.0 else rates.sum / rates.size),
          fullMarkRate = round2(if questionScores.isEmpty then 0.0 else questionScores.count(_.score >= question.maxScore - 1e-9).toDouble / questionScores.size),
          zeroRate = round2(if questionScores.isEmpty then 0.0 else questionScores.count(_.score <= 1e-9).toDouble / questionScores.size)
        )
      }
    yield ExamStatSummary(
      examId = exam.id,
      examName = exam.name,
      cohortId = exam.cohortId,
      cohortName = cohortNames.getOrElse(exam.cohortId, ""),
      status = exam.status,
      sheetCount = sheets.size,
      gradedCount = graded.size,
      avgRaw = averageOf(rawTotals),
      maxRaw = if rawTotals.isEmpty then None else Some(round1(rawTotals.max)),
      minRaw = if rawTotals.isEmpty then None else Some(round1(rawTotals.min)),
      avgConverted = averageOf(convertedTotals),
      questionStats = questionStats,
      buckets = scoreBuckets(graded, convertedTotals, maxConvertedTotal)
    )

  private def scoreBuckets(graded: List[AnswerSheet], convertedTotals: List[Double], maxConvertedTotal: Double): List[ExamScoreBucket] =
    if convertedTotals.isEmpty || maxConvertedTotal <= 0 then Nil
    else
      val buckets = List(
        "90%以上" -> (0.9, 1.01),
        "75%-89%" -> (0.75, 0.9),
        "60%-74%" -> (0.6, 0.75),
        "40%-59%" -> (0.4, 0.6),
        "40%以下" -> (-0.01, 0.4)
      )
      buckets.map { case (label, (low, high)) =>
        ExamScoreBucket(label, convertedTotals.count(ratio => ratio / maxConvertedTotal >= low && ratio / maxConvertedTotal < high))
      }

  private def buildTrendRows(connection: Connection, exams: List[Exam], cohortNames: Map[String, String]): IO[List[CohortTrendRow]] =
    exams
      .filter(exam => exam.status == ExamStatus.Released.entryName || exam.status == ExamStatus.Archived.entryName)
      .toList
      .traverse { exam =>
        for
          sheets <- ExamTable.listSheetsByExam(connection, exam.id)
          graded = sheets.filter(_.status == SheetStatus.Graded.entryName)
          convertedTotals = graded.flatMap(_.convertedTotal)
        yield CohortTrendRow(
          cohortId = exam.cohortId,
          cohortName = cohortNames.getOrElse(exam.cohortId, ""),
          examId = exam.id,
          examName = exam.name,
          gradedCount = graded.size,
          avgConverted = averageOf(convertedTotals),
          scheduledStart = exam.scheduledStart
        )
      }
      .map(_.sortBy(_.scheduledStart))

  private def averageOf(values: List[Double]): Option[Double] =
    if values.isEmpty then None else Some(round1(values.sum / values.size))

  private def round1(value: Double): Double =
    BigDecimal(value).setScale(1, BigDecimal.RoundingMode.HALF_UP).toDouble

  private def round2(value: Double): Double =
    BigDecimal(value).setScale(2, BigDecimal.RoundingMode.HALF_UP).toDouble

  given Decoder[GetExamStatisticsAPIMessage] = inputDecoder
  given Encoder[GetExamStatisticsAPIMessage] = deriveEncoder[GetExamStatisticsAPIMessage]
