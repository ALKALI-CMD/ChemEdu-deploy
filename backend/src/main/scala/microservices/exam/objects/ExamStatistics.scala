// 文件说明：定义考试评定域统计聚合领域数据类型，用于数据分析处看板。
package microservices.exam.objects

import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}

/** 单题统计：avgRate/fullMarkRate/zeroRate 分别为平均得分率、满分率、零分率。 */
final case class ExamQuestionStat(
  questionId: String,
  title: String,
  topicTag: String,
  avgScore: Double,
  maxScore: Double,
  avgRate: Double,
  fullMarkRate: Double,
  zeroRate: Double
)

object ExamQuestionStat:
  given Decoder[ExamQuestionStat] = deriveDecoder[ExamQuestionStat]
  given Encoder[ExamQuestionStat] = deriveEncoder[ExamQuestionStat]

/** 分数段分布。 */
final case class ExamScoreBucket(
  label: String,
  count: Int
)

object ExamScoreBucket:
  given Decoder[ExamScoreBucket] = deriveDecoder[ExamScoreBucket]
  given Encoder[ExamScoreBucket] = deriveEncoder[ExamScoreBucket]

/** 班级概要：学生端结果页用于展示自己在班级中的位置。 */
final case class ExamClassSummary(
  studentCount: Int,
  gradedCount: Int,
  avgRaw: Option[Double],
  avgConverted: Option[Double]
)

object ExamClassSummary:
  given Decoder[ExamClassSummary] = deriveDecoder[ExamClassSummary]
  given Encoder[ExamClassSummary] = deriveEncoder[ExamClassSummary]

/** 单场考试的统计摘要。 */
final case class ExamStatSummary(
  examId: String,
  examName: String,
  cohortId: String,
  cohortName: String,
  status: String,
  sheetCount: Int,
  gradedCount: Int,
  avgRaw: Option[Double],
  maxRaw: Option[Double],
  minRaw: Option[Double],
  avgConverted: Option[Double],
  questionStats: List[ExamQuestionStat],
  buckets: List[ExamScoreBucket]
)

object ExamStatSummary:
  given Decoder[ExamStatSummary] = deriveDecoder[ExamStatSummary]
  given Encoder[ExamStatSummary] = deriveEncoder[ExamStatSummary]

/** 跨考试的趋势行，按考试时间排列。 */
final case class CohortTrendRow(
  cohortId: String,
  cohortName: String,
  examId: String,
  examName: String,
  gradedCount: Int,
  avgConverted: Option[Double],
  scheduledStart: String
)

object CohortTrendRow:
  given Decoder[CohortTrendRow] = deriveDecoder[CohortTrendRow]
  given Encoder[CohortTrendRow] = deriveEncoder[CohortTrendRow]
