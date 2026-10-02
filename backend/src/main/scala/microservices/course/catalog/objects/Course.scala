// 文件说明：定义课程目录课程领域数据类型，用于业务流程和接口传输。
package microservices.course.catalog.objects

import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}
import microservices.course.learning.objects.{AssignmentAttachment, LessonStudyRecord}
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

final case class Course(
  id: String,
  title: String,
  subtitle: String,
  category: String,
  grade: String,
  schedule: String,
  lessonsCount: Int,
  price: Int,
  rating: Double,
  completionRate: Int,
  enrolledCount: Int,
  status: CourseStatus,
  auditStatus: CourseAuditStatus,
  auditComment: Option[String],
  auditedBy: Option[String],
  auditedAt: Option[String],
  teacherId: String,
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
  modules: List[CourseModule]
)

object Course:
  given Encoder[Course] = deriveEncoder[Course]
  given Decoder[Course] = deriveDecoder[Course]
