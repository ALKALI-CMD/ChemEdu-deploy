// 文件说明：定义课程目录新增或更新课程领域数据类型，用于业务流程和接口传输。
package microservices.course.catalog.objects

import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}
import microservices.auth.objects.*
import microservices.admin.objects.*
import microservices.course.catalog.objects.*
import microservices.admin.objects.*
import microservices.auth.objects.*
import microservices.course.discussion.objects.*
import microservices.course.enrollment.objects.*
import microservices.course.learning.objects.*
import microservices.course.review.objects.*
import microservices.dashboard.objects.*
import microservices.course.learning.objects.*
import microservices.dashboard.objects.*
import microservices.course.discussion.objects.*

final case class UpsertCourseData(
  courseId: Option[String],
  title: String,
  subtitle: String,
  category: String,
  grade: String,
  schedule: String,
  price: Int,
  rating: Double,
  completionRate: Int,
  status: CourseStatus,
  teacherId: Option[String],
  assistants: List[String],
  semesterLabel: Option[String],
  offeringCode: Option[String],
  startsAt: Option[String],
  endsAt: Option[String],
  academicClassIds: List[String],
  capacity: Int,
  enrollmentPolicy: EnrollmentPolicy,
  tags: List[String],
  description: String,
  coverImageUrl: Option[String],
  modules: List[CourseModuleInput]
)

object UpsertCourseData:
  given Decoder[UpsertCourseData] = deriveDecoder[UpsertCourseData]
  given Encoder[UpsertCourseData] = deriveEncoder[UpsertCourseData]
