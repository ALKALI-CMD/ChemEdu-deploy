// 文件说明：后端学习接口实现，用于处理提交作业请求并返回类型安全响应。
package microservices.course.learning.api

import microservices.admin.objects.apiTypes.*
import microservices.auth.objects.apiTypes.*
import microservices.course.catalog.objects.apiTypes.*
import microservices.course.discussion.objects.apiTypes.*
import microservices.course.learning.objects.apiTypes.*
import microservices.course.review.objects.apiTypes.*
import microservices.dashboard.objects.apiTypes.*
import microservices.course.learning.tables.{AssignmentTable, CourseLessonTable}


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
import java.time.Instant
import java.util.UUID

final case class SubmitAssignmentAPIMessage(
  sessionToken: String,
  assignmentId: Option[String],
  submissionContent: String,
  submissionAttachments: List[AssignmentAttachment],
  submissionNote: Option[String]
) extends ConnectionAPIMessage[AssignmentMutationResponse]:
  override def plan(connection: Connection): IO[AssignmentMutationResponse] =
    SubmitAssignmentAPIMessage.schema.execute(this, connection)



object SubmitAssignmentAPIMessage:
  val inputDecoder: Decoder[SubmitAssignmentAPIMessage] = deriveDecoder[SubmitAssignmentAPIMessage]
  val outputEncoder: Encoder[AssignmentMutationResponse] = deriveEncoder[AssignmentMutationResponse]
  val schema: ConnectionApiMessageSchema[SubmitAssignmentAPIMessage, AssignmentMutationResponse] = ConnectionApiMessageSchema(
    name = "SubmitAssignmentAPIMessage",
    inputDecoder = inputDecoder,
    outputEncoder = outputEncoder,
    execute = (input, connection) =>
          for
            resolvedAssignmentId <- IO.fromOption(input.assignmentId)(
              new IllegalArgumentException("input.assignmentId is required for SubmitAssignmentAPIMessage")
            )
            currentUser <- RequireSessionUserAPIMessage(input.sessionToken).plan(connection)
            response <- submitAssignmentForUser(
              connection,
              currentUser,
              SubmitAssignmentInput(
                assignmentId = resolvedAssignmentId,
                submissionContent = input.submissionContent,
                submissionAttachments = input.submissionAttachments,
                submissionNote = input.submissionNote
              )
            )
          yield response
  )

  given Decoder[SubmitAssignmentAPIMessage] = inputDecoder
  given Encoder[SubmitAssignmentAPIMessage] = deriveEncoder[SubmitAssignmentAPIMessage]

  private def parseInstant(value: String): Option[Instant] =
    Option(value).filter(_.trim.nonEmpty).flatMap(raw => scala.util.Try(Instant.parse(raw)).toOption)

  private def computeLatePenaltyPercent(assignment: Assignment, submittedAt: Instant): Int =
    if !assignment.lateSubmitted then 0
    else
      val deadline = parseInstant(assignment.deadline)
      val overdueDays = deadline.map(value => Math.max(0L, java.time.Duration.between(value, submittedAt).toDays)).getOrElse(0L)
      val calculated = (overdueDays * assignment.latePenaltyPercentPerDay).toInt
      Math.max(0, Math.min(assignment.latePenaltyCapPercent, calculated))

  private def ensureStudent(user: UserProfile): IO[Unit] =
    if user.role == UserRole.Student then IO.unit
    else IO.raiseError(new IllegalArgumentException("Only students can perform this action."))

  private def isLateSubmission(deadline: String): Boolean =
    parseInstant(deadline).exists(_.isBefore(Instant.now()))

  private def requireNonEmpty(value: String, message: String): IO[String] =
    val trimmed = value.trim
    if trimmed.nonEmpty then IO.pure(trimmed)
    else IO.raiseError(new IllegalArgumentException(message))

  private def authorizeReviewer(connection: Connection, user: UserProfile, courseId: String): IO[Unit] =
    user.role match
      case UserRole.Admin => IO.unit
      case UserRole.Teacher | UserRole.Assistant =>
        CourseLessonTable.findCourseTeachingMembers(connection, courseId).flatMap {
          case Some((teacherId, assistants)) if teacherId == user.id || assistants.contains(user.id) => IO.unit
          case Some(_) => IO.raiseError(new IllegalArgumentException("The current user cannot review this assignment."))
          case None => IO.raiseError(new IllegalArgumentException("Course does not exist."))
        }
      case _ =>
        IO.raiseError(new IllegalArgumentException("Only teachers, assistants, or admins can review assignments."))

  private def authorizePublisher(connection: Connection, user: UserProfile, courseId: String): IO[Unit] =
    user.role match
      case UserRole.Admin =>
        CourseLessonTable.courseExists(connection, courseId).flatMap {
          case true => IO.unit
          case false => IO.raiseError(new IllegalArgumentException("Course does not exist."))
        }
      case UserRole.Teacher =>
        CourseLessonTable.findCourseTeacherId(connection, courseId).flatMap {
          case Some(teacherId) if teacherId == user.id => IO.unit
          case Some(_) => IO.raiseError(new IllegalArgumentException("Teachers can only publish learning tasks for their own courses."))
          case None => IO.raiseError(new IllegalArgumentException("Course does not exist."))
        }
      case _ =>
        IO.raiseError(new IllegalArgumentException("Only teachers or admins can publish learning tasks."))

  private def buildSubmissionRecord(
    attemptNumber: Int,
    submittedAt: Instant,
    lateSubmitted: Boolean,
    submissionContent: String,
    submissionAttachments: List[AssignmentAttachment],
    submissionNote: Option[String]
  ): AssignmentSubmissionRecord =
    AssignmentSubmissionRecord(
      attemptNumber = attemptNumber,
      submittedAt = submittedAt.toString,
      lateSubmitted = lateSubmitted,
      submissionContentPreview = Option(submissionContent.trim).filter(_.nonEmpty).map(_.take(160)),
      attachmentCount = submissionAttachments.size,
      submissionNote = submissionNote.map(_.trim).filter(_.nonEmpty)
    )

  private def buildReviewRecord(
    reviewNumber: Int,
    rawScore: Int,
    finalScore: Int,
    latePenaltyAppliedPercent: Int,
    feedback: String,
    reviewerName: String,
    reviewedAt: Instant,
    rubricScores: List[AssignmentRubricScore],
    teacherAnnotations: List[TeacherAnnotation]
  ): AssignmentReviewRecord =
    AssignmentReviewRecord(
      reviewNumber = reviewNumber,
      rawScore = rawScore,
      finalScore = finalScore,
      latePenaltyAppliedPercent = latePenaltyAppliedPercent,
      latePenaltyAppliedPoints = Math.max(0, rawScore - finalScore),
      feedback = feedback,
      reviewerName = reviewerName,
      reviewedAt = reviewedAt.toString,
      rubricScores = rubricScores,
      teacherAnnotations = teacherAnnotations
    )

  def cloneAssignmentsForStudent(
    connection: Connection,
    studentId: String,
    courseId: String
  ): IO[Unit] =
    for
      existingCount <- AssignmentTable.countStudentCourseAssignments(connection, studentId, courseId)
      _ <-
        if existingCount > 0 then IO.unit
        else
          AssignmentTable.listAssignmentTemplatesForClone(connection, courseId).flatMap { templates =>
            templates.foldLeft(IO.unit) {
              case (acc, template) =>
              acc.flatMap(_ =>
                AssignmentTable.insertAssignmentForStudent(
                  connection,
                  s"assignment-${UUID.randomUUID().toString.take(8)}",
                  courseId,
                  Some(studentId),
                  template.title,
                  template.description,
                  template.deadline,
                  template.attachmentLabel,
                  template.maxAttempts,
                  template.allowLateSubmission,
                  template.allowResubmission,
                  template.allowMakeUpSubmission,
                  template.lateSubmissionDeadline,
                  template.latePenaltyPercentPerDay,
                  template.latePenaltyCapPercent,
                  template.rubric
                )
              )
            }
          }
    yield ()

  def submitAssignmentForUser(
    connection: Connection,
    currentUser: UserProfile,
    request: SubmitAssignmentInput
  ): IO[AssignmentMutationResponse] =
    for
      _ <- ensureStudent(currentUser)
      _ <-
        if request.submissionContent.trim.nonEmpty || request.submissionAttachments.nonEmpty then IO.unit
        else IO.raiseError(new IllegalArgumentException("Assignment submission must contain text content or at least one attachment."))
      assignment <- AssignmentTable.findStudentAssignment(connection, request.assignmentId, currentUser.id)
      currentAssignment <- IO.fromOption(assignment)(
        new IllegalArgumentException("Assignment does not exist for the current student.")
      )
      _ <-
        if currentAssignment.attemptCount < currentAssignment.maxAttempts then IO.unit
        else IO.raiseError(new IllegalArgumentException("The maximum number of assignment submissions has been reached."))
      _ <-
        if currentAssignment.allowResubmission || currentAssignment.allowMakeUpSubmission || currentAssignment.attemptCount == 0 then IO.unit
        else IO.raiseError(new IllegalArgumentException("This assignment does not allow resubmission."))
      lateSubmitted = isLateSubmission(currentAssignment.deadline)
      _ <-
        if !lateSubmitted || currentAssignment.allowLateSubmission then IO.unit
        else IO.raiseError(new IllegalArgumentException("This assignment does not allow late submission."))
      _ <-
        if !lateSubmitted then IO.unit
        else
          currentAssignment.lateSubmissionDeadline.flatMap(parseInstant) match
            case Some(deadline) if deadline.isBefore(Instant.now()) =>
              IO.raiseError(new IllegalArgumentException("The late submission window has closed for this assignment."))
            case _ => IO.unit
      submittedAt = Instant.now()
      submissionHistory = currentAssignment.submissionHistory :+ buildSubmissionRecord(
        attemptNumber = currentAssignment.attemptCount + 1,
        submittedAt = submittedAt,
        lateSubmitted = lateSubmitted,
        submissionContent = request.submissionContent,
        submissionAttachments = request.submissionAttachments,
        submissionNote = request.submissionNote
      )
      _ <- AssignmentTable.submitAssignment(connection, request.assignmentId, request.submissionContent, request.submissionNote, submittedAt.toString, request.submissionAttachments, currentAssignment.attemptCount + 1, lateSubmitted, submissionHistory)
      updated <- AssignmentTable.findAssignmentById(connection, request.assignmentId)
      result <- IO.fromOption(updated)(
        new IllegalStateException("Assignment submitted successfully but could not be reloaded.")
      )
    yield AssignmentMutationResponse(
      message = s"Assignment ${currentAssignment.title} submitted.",
      assignment = result
    )

  def reviewAssignmentForUser(
    connection: Connection,
    reviewer: UserProfile,
    request: ReviewAssignmentInput
  ): IO[AssignmentMutationResponse] =
    for
      assignment <- AssignmentTable.findAssignmentWithStudent(connection, request.assignmentId)
      assignmentRow <- IO.fromOption(assignment)(
        new IllegalArgumentException("Assignment does not exist.")
      )
      _ <- authorizeReviewer(connection, reviewer, assignmentRow.courseId)
      currentAssignmentOption <- AssignmentTable.findAssignmentById(connection, request.assignmentId)
      currentAssignment <- IO.fromOption(currentAssignmentOption)(
        new IllegalArgumentException("Assignment does not exist.")
      )
      reviewedAt = Instant.now()
      latePenaltyAppliedPercent = computeLatePenaltyPercent(currentAssignment, currentAssignment.submittedAt.flatMap(parseInstant).getOrElse(reviewedAt))
      finalScore = Math.max(0, request.score - Math.round(request.score.toDouble * latePenaltyAppliedPercent / 100.0).toInt)
      reviewHistory = currentAssignment.reviewHistory :+ buildReviewRecord(
        reviewNumber = currentAssignment.reviewHistory.size + 1,
        rawScore = request.score,
        finalScore = finalScore,
        latePenaltyAppliedPercent = latePenaltyAppliedPercent,
        feedback = request.feedback,
        reviewerName = reviewer.name,
        reviewedAt = reviewedAt,
        rubricScores = request.rubricScores,
        teacherAnnotations = request.teacherAnnotations
      )
      _ <- AssignmentTable.reviewAssignment(connection, request.assignmentId, finalScore, request.score, latePenaltyAppliedPercent, request.feedback, reviewer.name, reviewedAt.toString, request.reviewAttachments, request.rubricScores, request.teacherAnnotations, reviewHistory)
      updated <- AssignmentTable.findAssignmentById(connection, request.assignmentId)
      result <- IO.fromOption(updated)(
        new IllegalStateException("Assignment reviewed successfully but could not be reloaded.")
      )
    yield AssignmentMutationResponse(
      message = s"Assignment ${assignmentRow.title} reviewed.",
      assignment = result
    )

  def publishAssignmentForUser(
    connection: Connection,
    publisher: UserProfile,
    request: PublishAssignmentInput
  ): IO[AssignmentMutationResponse] =
    for
      _ <- authorizePublisher(connection, publisher, request.courseId)
      title <- requireNonEmpty(request.title, "Assignment title cannot be empty.")
      description <- requireNonEmpty(request.description, "Assignment description cannot be empty.")
      deadline <- requireNonEmpty(request.deadline, "Assignment deadline cannot be empty.")
            attachmentLabel = Option(request.attachmentLabel).map(_.trim).filter(_.nonEmpty).getOrElse("No attachment")
      maxAttempts = request.maxAttempts.map(value => Math.max(1, value)).getOrElse(2)
      allowLateSubmission = request.allowLateSubmission.getOrElse(true)
      allowResubmission = request.allowResubmission.getOrElse(true)
      allowMakeUpSubmission = request.allowMakeUpSubmission.getOrElse(false)
      lateSubmissionDeadline = request.lateSubmissionDeadline.map(_.trim).filter(_.nonEmpty)
      latePenaltyPercentPerDay = request.latePenaltyPercentPerDay.map(value => Math.max(0, value)).getOrElse(0)
      latePenaltyCapPercent = request.latePenaltyCapPercent.map(value => Math.max(0, Math.min(100, value))).getOrElse(0)
      normalizedRubric =
        if request.rubric.nonEmpty then request.rubric
        else List(
                    AssignmentRubricCriterion("accuracy", "Accuracy", "Check whether the core requirements are met.", 40),
                    AssignmentRubricCriterion("structure", "Structure", "Check structure, expression, and argument completeness.", 30),
                    AssignmentRubricCriterion("evidence", "Evidence", "Check examples, data, and supporting evidence.", 30)
        )
      templateAssignmentId = s"assignment-template-${UUID.randomUUID().toString.take(8)}"
      _ <- AssignmentTable.insertAssignmentForStudent(
        connection,
        templateAssignmentId,
        request.courseId,
        None,
        title,
        description,
        deadline,
        attachmentLabel,
        maxAttempts,
        allowLateSubmission,
        allowResubmission,
        allowMakeUpSubmission,
        lateSubmissionDeadline,
        latePenaltyPercentPerDay,
        latePenaltyCapPercent,
        normalizedRubric
      )
      studentIds <- CourseLessonTable.listEnrolledStudentIds(connection, request.courseId)
      _ <- studentIds.foldLeft(IO.unit) { case (acc, studentId) =>
        acc.flatMap(_ =>
          AssignmentTable.insertAssignmentForStudent(
            connection,
            s"assignment-${UUID.randomUUID().toString.take(8)}",
            request.courseId,
            Some(studentId),
            title,
            description,
            deadline,
            attachmentLabel,
            maxAttempts,
            allowLateSubmission,
            allowResubmission,
            allowMakeUpSubmission,
            lateSubmissionDeadline,
            latePenaltyPercentPerDay,
            latePenaltyCapPercent,
            normalizedRubric
          )
        )
      }
      assignment <- AssignmentTable.findAssignmentById(connection, templateAssignmentId)
      result <- IO.fromOption(assignment)(
        new IllegalStateException("Assignment published successfully but could not be reloaded.")
      )
    yield AssignmentMutationResponse(
      message = s"Assignment ${title} published to ${studentIds.size} enrolled students.",
      assignment = result
    )

