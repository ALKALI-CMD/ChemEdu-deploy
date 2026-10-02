// 文件说明：定义看板教学洞察Snapshot领域数据类型，用于业务流程和接口传输。
package microservices.dashboard.objects

import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}

final case class TeachingInsightSnapshot(
  atRiskStudents: List[AtRiskStudent],
  questionHotspots: List[QuestionHotspot],
  lessonBottlenecks: List[LessonBottleneck],
  completionDistributions: List[CourseCompletionDistribution],
  courseGradeDistributions: List[CourseGradeDistribution],
  classGradeDistributions: List[ClassGradeDistribution],
  interventionQueueCount: Int
)

object TeachingInsightSnapshot:
  given Encoder[TeachingInsightSnapshot] = deriveEncoder[TeachingInsightSnapshot]
  given Decoder[TeachingInsightSnapshot] = deriveDecoder[TeachingInsightSnapshot]
