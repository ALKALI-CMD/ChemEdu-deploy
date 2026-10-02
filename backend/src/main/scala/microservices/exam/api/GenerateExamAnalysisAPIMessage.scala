// 文件说明：考试评定域接口实现，用于生成学生考试智能分析报告（优先调用大模型接口，失败时回退内置规则）。
package microservices.exam.api

import cats.effect.IO
import cats.syntax.all.*
import io.circe.{Decoder, Encoder, Json}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}
import microservices.auth.api.RequireSessionUserAPIMessage
import microservices.auth.objects.{UserProfile, UserRole}
import microservices.exam.objects.*
import microservices.exam.objects.apiTypes.*
import microservices.exam.tables.ExamTable
import system.api.{ConnectionAPIMessage, ConnectionApiMessageSchema}

import java.sql.Connection
import java.time.Instant
import java.util.UUID

final case class GenerateExamAnalysisAPIMessage(
  sessionToken: String,
  examId: String,
  studentId: Option[String]
) extends ConnectionAPIMessage[ExamAnalysisMutationResponse]:
  override def plan(connection: Connection): IO[ExamAnalysisMutationResponse] =
    GenerateExamAnalysisAPIMessage.schema.execute(this, connection)

object GenerateExamAnalysisAPIMessage:

  private val systemPrompt =
    """你是化学竞赛培训机构的学情分析老师。根据给定的考试题目、学生得分与班级平均得分率，
      |用中文输出一份严谨、可执行的学情分析。只输出一个 JSON 对象，不要输出多余文字，
      |字段结构：{"summary":"总体评价(120字内)","strengths":[{"topic":"知识模块","comment":"一句话点评"}],
      |"weaknesses":[{"topic":"知识模块","comment":"错因与补救建议"}],"suggestions":["建议1","建议2","建议3"],
      |"focusTopics":["重点补强模块"]}""".stripMargin

  final case class AiTopic(topic: String, comment: String)
  final case class AiDraftContent(
    summary: String,
    strengths: List[AiTopic],
    weaknesses: List[AiTopic],
    suggestions: List[String],
    focusTopics: List[String]
  )
  object AiTopic:
    given Decoder[AiTopic] = deriveDecoder[AiTopic]
  object AiDraftContent:
    given Decoder[AiDraftContent] = deriveDecoder[AiDraftContent]

  val inputDecoder: Decoder[GenerateExamAnalysisAPIMessage] = deriveDecoder[GenerateExamAnalysisAPIMessage]
  val outputEncoder: Encoder[ExamAnalysisMutationResponse] = deriveEncoder[ExamAnalysisMutationResponse]
  val schema: ConnectionApiMessageSchema[GenerateExamAnalysisAPIMessage, ExamAnalysisMutationResponse] =
    ConnectionApiMessageSchema(
      name = "GenerateExamAnalysisAPIMessage",
      inputDecoder = inputDecoder,
      outputEncoder = outputEncoder,
      execute = (input, connection) =>
        for
          currentUser <- RequireSessionUserAPIMessage(input.sessionToken).plan(connection)
          exam <- ExamTable.findExamById(connection, input.examId).flatMap {
            case Some(found) => IO.pure(found)
            case None => IO.raiseError(new IllegalArgumentException("考试不存在。"))
          }
          targetStudentId <- currentUser.role match
            case UserRole.Student =>
              input.studentId match
                case Some(other) if other != currentUser.id =>
                  IO.raiseError(new IllegalArgumentException("学生只能生成自己的分析报告。"))
                case _ => IO.pure(currentUser.id)
            case _ => IO.fromOption(input.studentId)(new IllegalArgumentException("请指定要分析的学生。"))
          _ <- currentUser.role match
            case UserRole.Student =>
              if exam.status == ExamStatus.Released.entryName || exam.status == ExamStatus.Archived.entryName then IO.unit
              else IO.raiseError(new IllegalArgumentException("本场考试成绩尚未公布。"))
            case _ => IO.unit
          sheet <- ExamTable.findSheetByExamAndStudent(connection, exam.id, targetStudentId).flatMap {
            case Some(found) => IO.pure(found)
            case None => IO.raiseError(new IllegalArgumentException("该学生没有本场考试的答题卡。"))
          }
          scores <- ExamTable.listScoresBySheet(connection, sheet.id)
          allScores <- ExamTable.listScoresByExam(connection, exam.id)
          now <- IO.pure(Instant.now())
          prompt <- IO.pure(buildUserPrompt(exam, sheet.studentName, scores, allScores))
          aiText <- AiAnalysisClient.complete(systemPrompt, prompt)
          (content, source, model) = buildContent(exam, sheet.studentName, scores, allScores, aiText)
          analysis = ExamAnalysis(
            id = s"analysis-${UUID.randomUUID().toString.take(8)}",
            examId = exam.id,
            studentId = targetStudentId,
            studentName = sheet.studentName,
            source = source,
            model = model,
            content = content,
            generatedAt = now.toString
          )
          _ <- ExamTable.upsertAnalysis(connection, analysis)
        yield ExamAnalysisMutationResponse("分析报告已生成。", analysis)
    )

  /** 计算每个题目的学生得分率与班级平均得分率。 */
  private[exam] def questionRates(
    exam: Exam,
    scores: List[QuestionScoreEntry],
    allScores: List[QuestionScoreEntry]
  ): List[(ExamQuestion, Option[Double], Double)] =
    exam.questions.map { question =>
      val studentScore = scores.find(_.questionId == question.id).map(_.score / question.maxScore)
      val classRates = allScores
        .filter(_.questionId == question.id)
        .map(_.score / question.maxScore)
      val classAvg = if classRates.isEmpty then 0.0 else classRates.sum / classRates.size
      (question, studentScore, classAvg)
    }

  private def buildUserPrompt(
    exam: Exam,
    studentName: String,
    scores: List[QuestionScoreEntry],
    allScores: List[QuestionScoreEntry]
  ): String =
    val lines = questionRates(exam, scores, allScores).map { case (question, studentScore, classAvg) =>
      studentScore match
        case Some(rate) => f"第${question.orderIndex}题 [${question.topicTag}] ${question.title}：得分率 ${rate * 100}%.1f%%，班级平均 ${classAvg * 100}%.1f%%"
        case None => f"第${question.orderIndex}题 [${question.topicTag}] ${question.title}：未判分，班级平均 ${classAvg * 100}%.1f%%"
    }
    val studentLine =
      val raw = scores.map(_.score).sum
      val converted = scores.map(_.convertedScore).sum
      f"学生 $studentName 卷面总分 $raw%.1f，折合总分 $converted%.1f（卷面满分 ${exam.questions.map(_.maxScore).sum}%.0f，折合满分 ${exam.questions.map(_.convertedScore).sum}%.0f）"
    (studentLine :: lines).mkString("\n")

  /** 组装分析内容：AI 返回可解析 JSON 时合并计算出的得分率，否则使用内置规则分析。 */
  private def buildContent(
    exam: Exam,
    studentName: String,
    scores: List[QuestionScoreEntry],
    allScores: List[QuestionScoreEntry],
    aiText: Option[String]
  ): (ExamAnalysisContent, String, String) =
    val rates = questionRates(exam, scores, allScores)
    val heuristic = heuristicContent(exam, studentName, scores, rates)
    aiText.flatMap(AiAnalysisClient.extractJson).flatMap(_.as[AiDraftContent].toOption) match
      case Some(draft) if draft.summary.trim.nonEmpty =>
        val weaknesses = draft.weaknesses.flatMap { weakness =>
          matchTopic(rates, weakness.topic).map { case (question, studentRate, classAvg) =>
            ExamWeaknessItem(weakness.topic.trim, question.id, studentRate, classAvg, weakness.comment.trim)
          }
        }
        val strengths = draft.strengths.flatMap { strength =>
          matchTopic(rates, strength.topic).map { case (question, studentRate, _) =>
            ExamStrengthItem(strength.topic.trim, studentRate, strength.comment.trim)
          }
        }
        val focusTopics = draft.focusTopics.map(_.trim).filter(_.nonEmpty) match
          case Nil => weaknesses.map(_.topic).distinct
          case topics => topics.distinct
        (
          ExamAnalysisContent(draft.summary.trim, strengths, weaknesses, draft.suggestions.map(_.trim).filter(_.nonEmpty), focusTopics),
          "ai",
          AiAnalysisClient.config.map(_.model).getOrElse("")
        )
      case _ => (heuristic, "heuristic", "")

  /** 把 AI 给出的知识模块匹配到该生该模块中表现最差（或最好）的题目上，用于填充得分率。 */
  private def matchTopic(
    rates: List[(ExamQuestion, Option[Double], Double)],
    topic: String
  ): Option[(ExamQuestion, Double, Double)] =
    val normalized = topic.trim.toLowerCase
    val matched = rates.filter { case (question, _, _) => question.topicTag.toLowerCase.contains(normalized) || normalized.contains(question.topicTag.toLowerCase) }
    val withScore = matched.filter { case (_, studentScore, _) => studentScore.isDefined }
    withScore.sortBy { case (_, studentScore, classAvg) => studentScore.getOrElse(0.0) - classAvg }.headOption
      .map { case (question, studentScore, classAvg) => (question, studentScore.getOrElse(0.0), classAvg) }

  /** 内置规则分析：按得分率与班级平均的差值找短板，按知识模块给出固定建议。 */
  private[exam] def heuristicContent(
    exam: Exam,
    studentName: String,
    scores: List[QuestionScoreEntry],
    rates: List[(ExamQuestion, Option[Double], Double)]
  ): ExamAnalysisContent =
    val scored = rates.collect { case (question, Some(rate), classAvg) => (question, rate, classAvg) }
    val weaknesses = scored
      .filter { case (_, rate, classAvg) => rate < classAvg - 0.02 || rate < 0.6 }
      .sortBy { case (_, rate, classAvg) => rate - classAvg }
      .take(4)
      .map { case (question, rate, classAvg) =>
        ExamWeaknessItem(
          topic = question.topicTag,
          questionId = question.id,
          scoreRate = round2(rate),
          classAvgRate = round2(classAvg),
          comment = f"第${question.orderIndex}题（${question.title}）得分率 ${rate * 100}%.0f%%，低于班级平均 ${classAvg * 100}%.0f%%，说明该模块的陌生情境拆解能力需要专项补强。"
        )
      }
    val strengths = scored
      .filter { case (_, rate, classAvg) => rate >= 0.85 || rate >= classAvg + 0.1 }
      .sortBy { case (_, rate, _) => -rate }
      .take(3)
      .map { case (question, rate, _) =>
        ExamStrengthItem(
          topic = question.topicTag,
          scoreRate = round2(rate),
          comment = f"第${question.orderIndex}题（${question.topicTag}）得分率 ${rate * 100}%.0f%%，掌握扎实，保持当前训练节奏。"
        )
      }
    val suggestions = weaknesses.map(w => s"针对「${w.topic}」：${topicAdvice(w.topic)}").distinct.take(4) :+
      "对照参考答案逐题重写过程分步骤，标出被跳过的中间结论。"
    val focusTopics = weaknesses.map(_.topic).distinct
    val summary =
      s"本次《${exam.name}》，$studentName 的卷面总分为 ${fmt(scores.map(_.score).sum)}，折合总分 ${fmt(scores.map(_.convertedScore).sum)}。" +
        (if weaknesses.isEmpty then "各题得分率整体不低于班级平均，弱点集中在少数细节步骤，继续保持完整的套卷训练即可。"
        else s"薄弱点集中在 ${focusTopics.mkString("、")}，建议按下方建议逐项补强后再进入下一轮套卷。")
    ExamAnalysisContent(summary, strengths, weaknesses, suggestions, focusTopics)

  private def topicAdvice(topic: String): String =
    val advice = List(
      "结构化学" -> "回到晶系、对称性与系统消光的推导链，重做近年国初结构大题并核对得分步骤。",
      "有机化学" -> "按官能团归类整理人名反应，重点复盘立体电子效应对区域选择性的影响。",
      "物理化学" -> "梳理热力学状态函数与平衡常数的关系，限时完成带非理想修正的计算题。",
      "化学原理与计算" -> "巩固酸碱平衡与电化学计算，每天限时完成一道国初计算大题。",
      "无机元素化学" -> "按族复习过渡金属配位化学，整理高价态配合物的氧化还原与稳定性规律。",
      "分析化学" -> "熟悉常见实验装置与分离操作原理，复盘误差分析与装置排序类小题。",
      "高分子化学" -> "掌握 Flory-Huggins 等高分子溶液理论的核心假设与推导过程。"
    )
    advice.collectFirst { case (key, value) if topic.contains(key) => value }.getOrElse("整理该模块错题，限时重做同类模拟题并核对答案要点。")

  private def round2(value: Double): Double =
    BigDecimal(value).setScale(2, BigDecimal.RoundingMode.HALF_UP).toDouble

  private def fmt(value: Double): String =
    BigDecimal(value).setScale(1, BigDecimal.RoundingMode.HALF_UP).toString

  given Decoder[GenerateExamAnalysisAPIMessage] = inputDecoder
  given Encoder[GenerateExamAnalysisAPIMessage] = deriveEncoder[GenerateExamAnalysisAPIMessage]
