// 文件说明：定义考试评定域智能分析报告领域数据类型，用于学生短板分析与建议展示。
package microservices.exam.objects

import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}

/** 薄弱知识点条目：scoreRate 为该生得分率，classAvgRate 为班级平均得分率。 */
final case class ExamWeaknessItem(
  topic: String,
  questionId: String,
  scoreRate: Double,
  classAvgRate: Double,
  comment: String
)

object ExamWeaknessItem:
  given Decoder[ExamWeaknessItem] = deriveDecoder[ExamWeaknessItem]
  given Encoder[ExamWeaknessItem] = deriveEncoder[ExamWeaknessItem]

/** 优势知识点条目。 */
final case class ExamStrengthItem(
  topic: String,
  scoreRate: Double,
  comment: String
)

object ExamStrengthItem:
  given Decoder[ExamStrengthItem] = deriveDecoder[ExamStrengthItem]
  given Encoder[ExamStrengthItem] = deriveEncoder[ExamStrengthItem]

/** 分析报告正文：由 AI 接口或内置规则生成，判分统计部分始终由后端计算。 */
final case class ExamAnalysisContent(
  summary: String,
  strengths: List[ExamStrengthItem],
  weaknesses: List[ExamWeaknessItem],
  suggestions: List[String],
  focusTopics: List[String]
)

object ExamAnalysisContent:
  given Decoder[ExamAnalysisContent] = deriveDecoder[ExamAnalysisContent]
  given Encoder[ExamAnalysisContent] = deriveEncoder[ExamAnalysisContent]

/** 一次考试分析报告：source 为 ai / heuristic，model 记录使用的模型名。 */
final case class ExamAnalysis(
  id: String,
  examId: String,
  studentId: String,
  studentName: String,
  source: String,
  model: String,
  content: ExamAnalysisContent,
  generatedAt: String
)

object ExamAnalysis:
  given Decoder[ExamAnalysis] = deriveDecoder[ExamAnalysis]
  given Encoder[ExamAnalysis] = deriveEncoder[ExamAnalysis]
