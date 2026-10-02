// 文件说明：后端课程报名接口实现，用于处理报名课程请求并返回类型安全响应。
package microservices.course.enrollment.api

import cats.effect.IO
import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}
import microservices.auth.api.RequireSessionUserAPIMessage
import microservices.auth.objects.UserRole
import microservices.course.catalog.api.FindCourseByIdAPIMessage
import microservices.course.catalog.objects.{Course, CourseStatus}
import microservices.course.enrollment.objects.EnrollCourseData
import microservices.course.enrollment.objects.apiTypes.EnrollmentMessageResponse
import microservices.course.enrollment.tables.EnrollmentTable
import microservices.course.learning.api.SyncLearningArtifactsForEnrollmentAPIMessage
import system.api.{ConnectionAPIMessage, ConnectionApiMessageSchema}

import java.sql.Connection
import java.time.Instant
import java.util.UUID

final case class EnrollCourseAPIMessage(
  sessionToken: String,
  courseId: Option[String],
  inviteCode: Option[String],
  paymentMethod: Option[String]
) extends ConnectionAPIMessage[EnrollmentMessageResponse]:
  override def plan(connection: Connection): IO[EnrollmentMessageResponse] =
    EnrollCourseAPIMessage.schema.execute(this, connection)

object EnrollCourseAPIMessage:
  val inputDecoder: Decoder[EnrollCourseAPIMessage] = deriveDecoder[EnrollCourseAPIMessage]
  val outputEncoder: Encoder[EnrollmentMessageResponse] = deriveEncoder[EnrollmentMessageResponse]
  val schema: ConnectionApiMessageSchema[EnrollCourseAPIMessage, EnrollmentMessageResponse] = ConnectionApiMessageSchema(
    name = "EnrollCourseAPIMessage",
    inputDecoder = inputDecoder,
    outputEncoder = outputEncoder,
    execute = (input, connection) =>
          for
            resolvedCourseId <- IO.fromOption(input.courseId)(
              new IllegalArgumentException("input.courseId is required for EnrollCourseAPIMessage")
            )
            currentUser <- RequireSessionUserAPIMessage(input.sessionToken).plan(connection)
            response <- enrollForUser(
              connection = connection,
              currentUser = currentUser,
              request = EnrollCourseData(
                courseId = resolvedCourseId,
                inviteCode = input.inviteCode,
                paymentMethod = input.paymentMethod
              )
            )
          yield response
  )

  private def enrollForUser(
    connection: Connection,
    currentUser: microservices.auth.objects.UserProfile,
    request: EnrollCourseData
  ): IO[EnrollmentMessageResponse] =
    for
      _ <-
        if currentUser.role == UserRole.Student then IO.unit
        else IO.raiseError(new IllegalArgumentException("Only students can enroll in courses."))
      course <- FindCourseByIdAPIMessage(request.courseId, currentUser).plan(connection)
      targetCourse <- IO.fromOption(course)(new IllegalArgumentException("Course does not exist."))
      _ <- ensureCourseOpenForEnrollment(targetCourse)
      _ <- validateEnrollmentInviteCode(targetCourse, request.inviteCode)
      existingEnrollment <- EnrollmentTable.findEnrollment(connection, currentUser.id, targetCourse.id)
      _ <-
        existingEnrollment match
          case Some(enrollment) if enrollment.status == "enrolled" =>
            IO.raiseError(new IllegalArgumentException("You are already enrolled in this course."))
          case Some(enrollment) if enrollment.status == "pending" =>
            IO.raiseError(new IllegalArgumentException("This enrollment is pending approval."))
          case _ => IO.unit
      enrolledCount <- EnrollmentTable.countActiveCourseEnrollments(connection, targetCourse.id)
      message <-
        if enrolledCount >= targetCourse.capacity && targetCourse.enrollmentPolicy.waitlistEnabled then
          EnrollmentTable.enqueueWaitlist(connection, currentUser.id, targetCourse.id).map(_ =>
            EnrollmentMessageResponse(s"You have joined the waitlist for ${targetCourse.title}.")
          )
        else if enrolledCount >= targetCourse.capacity then
          IO.raiseError(new IllegalArgumentException("This course is full."))
        else
          val enrollmentStatus =
            if targetCourse.enrollmentPolicy.requiresApproval then "pending" else "enrolled"
          for
            _ <- EnrollmentTable.upsertEnrollment(connection, currentUser.id, targetCourse.id, enrollmentStatus)
            _ <-
              if enrollmentStatus == "enrolled" then
                SyncLearningArtifactsForEnrollmentAPIMessage(currentUser.id, targetCourse.id).plan(connection)
              else IO.unit
            _ <-
              if enrollmentStatus == "enrolled" then
                EnrollmentTable.insertPaidOrder(
                  connection,
                  s"ORD-${UUID.randomUUID().toString.take(8).toUpperCase}",
                  currentUser.name,
                  targetCourse.title,
                  BigDecimal(targetCourse.price),
                  request.paymentMethod
                )
              else IO.unit
          yield
            if enrollmentStatus == "pending" then EnrollmentMessageResponse(s"${targetCourse.title} enrollment request submitted.")
            else EnrollmentMessageResponse(s"Enrolled in ${targetCourse.title}.")
    yield message

  private def ensureCourseOpenForEnrollment(course: Course): IO[Unit] =
    for
      _ <-
        if course.status == CourseStatus.Published then IO.unit
        else IO.raiseError(new IllegalArgumentException("Only published courses can be enrolled in."))
      _ <- ensureEnrollmentWindow(course)
    yield ()

  private def ensureEnrollmentWindow(course: Course): IO[Unit] =
    val now = Instant.now()
    val openCheck =
      course.enrollmentPolicy.openAt
        .flatMap(parseInstant)
        .forall(openAt => !now.isBefore(openAt))
    val closeCheck =
      course.enrollmentPolicy.closeAt
        .flatMap(parseInstant)
        .forall(closeAt => !now.isAfter(closeAt))
    if openCheck && closeCheck then IO.unit
    else IO.raiseError(new IllegalArgumentException("Enrollment is not open for this course right now."))

  private def validateEnrollmentInviteCode(course: Course, inviteCode: Option[String]): IO[Unit] =
    course.enrollmentPolicy.inviteCode match
      case Some(expectedCode) =>
        if inviteCode.map(_.trim).filter(_.nonEmpty).contains(expectedCode) then IO.unit
        else IO.raiseError(new IllegalArgumentException("A valid invite code is required for this course."))
      case None => IO.unit

  private def parseInstant(value: String): Option[Instant] =
    try Some(Instant.parse(value))
    catch
      case _: Throwable => None

  given Decoder[EnrollCourseAPIMessage] = inputDecoder
  given Encoder[EnrollCourseAPIMessage] = deriveEncoder[EnrollCourseAPIMessage]
