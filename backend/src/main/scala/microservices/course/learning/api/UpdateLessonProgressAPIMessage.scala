// 文件说明：后端学习接口实现，用于处理更新课时进度请求并返回类型安全响应。
package microservices.course.learning.api

import microservices.admin.objects.apiTypes.*
import microservices.auth.objects.apiTypes.*
import microservices.course.catalog.objects.apiTypes.*
import microservices.course.discussion.objects.apiTypes.*
import microservices.course.learning.objects.apiTypes.*
import microservices.course.review.objects.apiTypes.*
import microservices.dashboard.objects.apiTypes.*
import microservices.course.learning.tables.{CourseLessonTable, LessonProgressTable, LessonStudyEventTable}


import cats.effect.IO
import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}
import microservices.auth.api.RequireSessionUserAPIMessage
import microservices.course.catalog.objects.*
import microservices.admin.objects.*
import microservices.auth.objects.*
import microservices.course.discussion.objects.*
import microservices.course.enrollment.objects.*
import microservices.course.learning.objects.*
import microservices.course.review.objects.*
import microservices.dashboard.objects.*
import microservices.course.learning.objects.*
import system.api.{ConnectionAPIMessage, ConnectionApiMessageSchema}
import microservices.admin.objects.*
import microservices.dashboard.objects.*
import microservices.course.discussion.objects.*

import java.sql.Connection

final case class UpdateLessonProgressAPIMessage(
  sessionToken: String,
  lessonId: Option[String],
  status: LessonProgressStatus,
  studyMinutes: Option[Int],
  lastPositionSeconds: Option[Int],
  completedPreviewResourceIds: Option[List[String]],
  playbackRate: Option[Double],
  eventType: Option[String]
) extends ConnectionAPIMessage[LessonProgressMutationResponse]:
  override def plan(connection: Connection): IO[LessonProgressMutationResponse] =
    UpdateLessonProgressAPIMessage.schema.execute(this, connection)



object UpdateLessonProgressAPIMessage:
  val inputDecoder: Decoder[UpdateLessonProgressAPIMessage] = deriveDecoder[UpdateLessonProgressAPIMessage]
  val outputEncoder: Encoder[LessonProgressMutationResponse] = deriveEncoder[LessonProgressMutationResponse]
  val schema: ConnectionApiMessageSchema[UpdateLessonProgressAPIMessage, LessonProgressMutationResponse] = ConnectionApiMessageSchema(
    name = "UpdateLessonProgressAPIMessage",
    inputDecoder = inputDecoder,
    outputEncoder = outputEncoder,
    execute = (input, connection) =>
          for
            resolvedLessonId <- IO.fromOption(input.lessonId)(
              new IllegalArgumentException("input.lessonId is required for UpdateLessonProgressAPIMessage")
            )
            currentUser <- RequireSessionUserAPIMessage(input.sessionToken).plan(connection)
            response <- updateLessonProgressForUser(
              connection,
              currentUser,
              UpdateLessonProgressInput(
                lessonId = resolvedLessonId,
                status = input.status,
                studyMinutes = input.studyMinutes,
                lastPositionSeconds = input.lastPositionSeconds,
                completedPreviewResourceIds = input.completedPreviewResourceIds,
                playbackRate = input.playbackRate,
                eventType = input.eventType
              )
            )
          yield response
  )

  given Decoder[UpdateLessonProgressAPIMessage] = inputDecoder
  given Encoder[UpdateLessonProgressAPIMessage] = deriveEncoder[UpdateLessonProgressAPIMessage]

  private def ensureStudent(user: UserProfile): IO[Unit] =
    if user.role == UserRole.Student then IO.unit
    else IO.raiseError(new IllegalArgumentException("Only students can perform this action."))

  private def findLessonCourseId(connection: Connection, lessonId: String): IO[String] =
    CourseLessonTable.findLessonCourseId(connection, lessonId).flatMap(courseId =>
      IO.fromOption(courseId)(new IllegalArgumentException("Lesson does not exist."))
    )

  private def ensureEnrolled(connection: Connection, userId: String, courseId: String): IO[Unit] =
    CourseLessonTable.findStudentEnrollment(connection, userId, courseId).flatMap {
      case true => IO.unit
      case false => IO.raiseError(new IllegalArgumentException("The current student is not enrolled in this course."))
    }

  def resolveLessonProgress(
    connection: Connection,
    user: UserProfile
  ): IO[Map[String, Boolean]] =
    if user.role == UserRole.Student then
      LessonProgressTable.listLessonCompletion(connection, user.id)
    else IO.pure(Map.empty)

  def resolveLessonStudyRecords(
    connection: Connection,
    user: UserProfile
  ): IO[Map[String, LessonStudyRecord]] =
    if user.role == UserRole.Student then
      for
        timelineByLesson <- resolveRecentStudyTimeline(connection, user)
        records <- LessonProgressTable.listLessonStudyRecords(connection, user.id, timelineByLesson)
      yield records
    else IO.pure(Map.empty)

  private def resolveRecentStudyTimeline(
    connection: Connection,
    user: UserProfile
  ): IO[Map[String, List[LessonStudyTimelineEntry]]] =
    LessonStudyEventTable.listRecentStudyTimeline(connection, user.id)

  def updateLessonProgressForUser(
    connection: Connection,
    currentUser: UserProfile,
    request: UpdateLessonProgressInput
  ): IO[LessonProgressMutationResponse] =
    for
      _ <- ensureStudent(currentUser)
      courseId <- findLessonCourseId(connection, request.lessonId)
      _ <- ensureEnrolled(connection, currentUser.id, courseId)
      requiredStudyMinutes <- findRequiredStudyMinutes(connection, request.lessonId)
      previousProgress <- LessonProgressTable.findLessonProgress(connection, currentUser.id, request.lessonId)
      nextStudyMinutes = Math.max(0, previousProgress._2 + request.studyMinutes.getOrElse(0))
      nextLastPosition = Math.max(0, request.lastPositionSeconds.getOrElse(previousProgress._3))
      nextCompletedPreviewResourceIds =
        (previousProgress._4 ++ request.completedPreviewResourceIds.getOrElse(Nil))
          .map(_.trim)
          .filter(_.nonEmpty)
          .distinct
      nextPlaybackRate = request.playbackRate.filter(_ > 0).getOrElse(previousProgress._5)
      _ <-
        if request.status == LessonProgressStatus.Completed && nextStudyMinutes < requiredStudyMinutes then
          IO.raiseError(
            new IllegalArgumentException(
              s"Please complete at least $requiredStudyMinutes minutes of study before marking this lesson as completed."
            )
          )
        else IO.unit
      _ <- LessonProgressTable.upsertLessonProgressStatus(connection, currentUser.id, request.lessonId, request.status)
      _ <- LessonProgressTable.updateLessonProgressStudyState(connection, currentUser.id, request.lessonId, nextStudyMinutes, nextLastPosition, nextCompletedPreviewResourceIds, nextPlaybackRate)
      _ <- insertStudyEvent(
        connection = connection,
        userId = currentUser.id,
        lessonId = request.lessonId,
        previousStatus = previousProgress._1,
        nextStatus = request.status,
        studyMinutesDelta = request.studyMinutes.getOrElse(0),
        lastPositionSeconds = nextLastPosition,
        requestedEventType = request.eventType
      )
    yield LessonProgressMutationResponse(
      message =
        if request.status == LessonProgressStatus.Completed then "Lesson marked as completed."
        else "Lesson progress reset to incomplete.",
      lessonId = request.lessonId,
      status = request.status,
      studyMinutes = nextStudyMinutes,
      lastPositionSeconds = nextLastPosition,
      completedPreviewResourceIds = nextCompletedPreviewResourceIds,
      playbackRate = nextPlaybackRate
    )

  private def findRequiredStudyMinutes(
    connection: Connection,
    lessonId: String
  ): IO[Int] =
    CourseLessonTable.findRequiredStudyMinutes(connection, lessonId).flatMap(minutes =>
      IO.fromOption(minutes)(new IllegalArgumentException("Lesson does not exist."))
    )

  private def insertStudyEvent(
    connection: Connection,
    userId: String,
    lessonId: String,
    previousStatus: LessonProgressStatus,
    nextStatus: LessonProgressStatus,
    studyMinutesDelta: Int,
    lastPositionSeconds: Int,
    requestedEventType: Option[String]
  ): IO[Unit] =
    val eventType =
      requestedEventType
        .map(_.trim)
        .filter(_.nonEmpty)
        .getOrElse(
          if nextStatus == LessonProgressStatus.Completed && previousStatus != LessonProgressStatus.Completed then "completed"
          else if studyMinutesDelta > 0 then "study_recorded"
          else "position_saved"
        )

    LessonStudyEventTable.insertStudyEvent(connection, userId, lessonId, eventType, studyMinutesDelta, lastPositionSeconds)

