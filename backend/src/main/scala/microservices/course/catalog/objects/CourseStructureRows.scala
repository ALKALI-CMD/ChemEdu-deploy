// 文件说明：定义课程目录课程StructureRows领域数据类型，用于业务流程和接口传输。
package microservices.course.catalog.objects

import microservices.course.learning.objects.*

private[catalog] final case class CourseRow(
  id: String,
  title: String,
  subtitle: String,
  category: String,
  grade: String,
  schedule: String,
  price: Int,
  rating: Double,
  completionRate: Int,
  status: CourseStatus,
  teacherId: String,
  assistants: String,
  semesterLabel: Option[String],
  offeringCode: Option[String],
  startsAt: Option[String],
  endsAt: Option[String],
  academicClassIds: String,
  capacity: Int,
  enrollmentRequiresApproval: Boolean,
  enrollmentOpenAt: Option[String],
  enrollmentCloseAt: Option[String],
  waitlistEnabled: Boolean,
  enrollmentInviteCode: Option[String],
  tags: String,
  description: String,
  coverImageUrl: Option[String]
)

private[catalog] final case class ModuleRow(
  id: String,
  courseId: String,
  title: String
)

private[catalog] final case class LessonRow(
  moduleId: String,
  lesson: Lesson
)
