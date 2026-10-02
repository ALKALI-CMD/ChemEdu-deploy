// 文件说明：后端课程目录接口实现，用于处理查找课程ById请求并返回类型安全响应。
package microservices.course.catalog.api

import cats.effect.IO
import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}
import microservices.auth.objects.UserProfile
import microservices.course.catalog.objects.Course
import microservices.course.learning.objects.LessonStudyRecord
import microservices.course.learning.api.{ResolveLessonProgressAPIMessage, ResolveLessonStudyRecordsAPIMessage}
import system.api.{ConnectionAPIMessage, ConnectionApiMessageSchema}

import java.sql.Connection

final case class FindCourseByIdAPIMessage(
  courseId: String,
  currentUser: UserProfile
) extends ConnectionAPIMessage[Option[Course]]:
  override def plan(connection: Connection): IO[Option[Course]] =
    for
      progressByLesson <- ResolveLessonProgressAPIMessage(currentUser).plan(connection)
      studyRecordsByLesson <- ResolveLessonStudyRecordsAPIMessage(currentUser).plan(connection)
      course <- FindCourseByIdAPIMessage.findCourseByIdForUser(connection, courseId, currentUser, progressByLesson, studyRecordsByLesson)
    yield course

object FindCourseByIdAPIMessage:
  val inputDecoder: Decoder[FindCourseByIdAPIMessage] = deriveDecoder[FindCourseByIdAPIMessage]
  val outputEncoder: Encoder[Option[Course]] = deriveEncoder[Option[Course]]
  val schema: ConnectionApiMessageSchema[FindCourseByIdAPIMessage, Option[Course]] = ConnectionApiMessageSchema(
    name = "FindCourseByIdAPIMessage",
    inputDecoder = inputDecoder,
    outputEncoder = outputEncoder,
    execute = (input, connection) => input.plan(connection)
  )

  private[catalog] def findCourseByIdForUser(
    connection: Connection,
    courseId: String,
    currentUser: UserProfile,
    progressByLesson: Map[String, Boolean],
    studyRecordsByLesson: Map[String, LessonStudyRecord]
  ): IO[Option[Course]] =
    ListCoursesForUserAPIMessage.listCoursesForUser(connection, currentUser, progressByLesson, studyRecordsByLesson).map(_.find(_.id == courseId))

  given Decoder[FindCourseByIdAPIMessage] = inputDecoder
  given Encoder[FindCourseByIdAPIMessage] = deriveEncoder[FindCourseByIdAPIMessage]
