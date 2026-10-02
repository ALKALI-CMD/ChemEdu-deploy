// 文件说明：后端学习接口实现，用于处理提交测验请求并返回类型安全响应。
package microservices.course.learning.api

import microservices.admin.objects.apiTypes.*
import microservices.auth.objects.apiTypes.*
import microservices.course.catalog.objects.apiTypes.*
import microservices.course.discussion.objects.apiTypes.*
import microservices.course.learning.objects.apiTypes.*
import microservices.course.review.objects.apiTypes.*
import microservices.dashboard.objects.apiTypes.*
import microservices.course.learning.tables.{CourseLessonTable, QuizAnswerKeyTable, QuizTable}


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
import scala.util.Random

final case class SubmitQuizAPIMessage(
  sessionToken: String,
  quizId: Option[String],
  objectiveAnswers: List[QuizOption],
  subjectiveAnswer: Option[String],
  fillBlankAnswers: List[String],
  answerRecords: List[QuizAnswerRecord]
) extends ConnectionAPIMessage[QuizMutationResponse]:
  override def plan(connection: Connection): IO[QuizMutationResponse] =
    SubmitQuizAPIMessage.schema.execute(this, connection)



object SubmitQuizAPIMessage:
  val inputDecoder: Decoder[SubmitQuizAPIMessage] = deriveDecoder[SubmitQuizAPIMessage]
  val outputEncoder: Encoder[QuizMutationResponse] = deriveEncoder[QuizMutationResponse]
  val schema: ConnectionApiMessageSchema[SubmitQuizAPIMessage, QuizMutationResponse] = ConnectionApiMessageSchema(
    name = "SubmitQuizAPIMessage",
    inputDecoder = inputDecoder,
    outputEncoder = outputEncoder,
    execute = (input, connection) =>
          for
            resolvedQuizId <- IO.fromOption(input.quizId)(
              new IllegalArgumentException("input.quizId is required for SubmitQuizAPIMessage")
            )
            currentUser <- RequireSessionUserAPIMessage(input.sessionToken).plan(connection)
            response <- submitQuizForUser(
              connection,
              currentUser,
              SubmitQuizInput(
                quizId = resolvedQuizId,
                objectiveAnswers = input.objectiveAnswers,
                subjectiveAnswer = input.subjectiveAnswer,
                fillBlankAnswers = input.fillBlankAnswers,
                answerRecords = input.answerRecords
              )
            )
          yield response
  )

  given Decoder[SubmitQuizAPIMessage] = inputDecoder
  given Encoder[SubmitQuizAPIMessage] = deriveEncoder[SubmitQuizAPIMessage]

  private def questionDefaultPoints(questionType: QuizQuestionType): Int =
    questionType match
      case QuizQuestionType.Subjective => 20
      case QuizQuestionType.FillBlank => 12
      case QuizQuestionType.MultipleChoice => 15
      case _ => 10

  private def normalizeQuestion(question: QuizQuestion, index: Int): QuizQuestion =
    question.copy(
      id = Option(question.id).filter(_.trim.nonEmpty).getOrElse(s"question-${index + 1}"),
      options =
        question.options.zipWithIndex.map { case (option, optionIndex) =>
          option.copy(
            key = (65 + optionIndex).toChar.toString,
            label = option.label.trim
          )
        },
      correctAnswers = question.correctAnswers.map(_.trim).filter(_.nonEmpty),
      points = if question.points > 0 then question.points else questionDefaultPoints(question.questionType)
    )

  private def shuffleQuestionOptions(question: QuizQuestion): QuizQuestion =
    if question.options.isEmpty then question
    else
      val correctLabels = question.options.filter(option => question.correctAnswers.contains(option.key)).map(_.label).toSet
      val shuffledOptions = Random.shuffle(question.options.map(_.label)).zipWithIndex.map { case (label, index) =>
        QuizQuestionOption(
          key = (65 + index).toChar.toString,
          label = label
        )
      }
      question.copy(
        options = shuffledOptions,
        correctAnswers = shuffledOptions.filter(option => correctLabels.contains(option.label)).map(_.key)
      )

  private def deriveAnswerKeysFromQuestionBank(questionBank: List[QuizQuestion]): List[QuizOption] =
    questionBank
      .filter(_.questionType != QuizQuestionType.Subjective)
      .flatMap(_.correctAnswers.headOption)
      .flatMap(QuizOption.fromString)

  private def buildStudentQuestionBank(
    questionBank: List[QuizQuestion],
    drawCount: Option[Int],
    shuffleQuestions: Boolean,
    shuffleOptions: Boolean
  ): List[QuizQuestion] =
    val normalized = questionBank.zipWithIndex.map(normalizeQuestion)
    val drawn =
      drawCount
        .filter(_ > 0)
        .filter(_ < normalized.size)
        .map(count => Random.shuffle(normalized).take(count))
        .getOrElse(normalized)
    val reordered = if shuffleQuestions then Random.shuffle(drawn) else drawn
    reordered.map(question => if shuffleOptions then shuffleQuestionOptions(question) else question)

  private def countQuestions(questionBank: List[QuizQuestion]): (Int, Int) =
    val objective = questionBank.count(_.questionType != QuizQuestionType.Subjective)
    val subjective = questionBank.count(_.questionType == QuizQuestionType.Subjective)
    (objective, subjective)

  private def ensureStudent(user: UserProfile): IO[Unit] =
    if user.role == UserRole.Student then IO.unit
    else IO.raiseError(new IllegalArgumentException("Only students can perform this action."))

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

  private def buildDefaultQuestionBank(
    title: String,
    objectiveQuestionCount: Int,
    subjectiveQuestionCount: Int,
    answerKeys: List[QuizOption]
  ): List[QuizQuestion] =
    val objectiveQuestions = (0 until objectiveQuestionCount).toList.map { index =>
      val answerKey = answerKeys.lift(index).getOrElse(QuizOption.A)
      QuizQuestion(
        id = s"question-${index + 1}",
        questionType = QuizQuestionType.SingleChoice,
        prompt = s"$title Question ${index + 1}",
        options = List(
          QuizQuestionOption("A", "Option A"),
          QuizQuestionOption("B", "Option B"),
          QuizQuestionOption("C", "Option C"),
          QuizQuestionOption("D", "Option D")
        ),
        correctAnswers = List(QuizOption.toString(answerKey)),
        explanation = None,
        points = 10
      )
    }

    val subjectiveQuestions = (0 until subjectiveQuestionCount).toList.map { index =>
      QuizQuestion(
        id = s"subjective-${index + 1}",
        questionType = QuizQuestionType.Subjective,
        prompt = s"$title Subjective Question ${index + 1}",
        options = Nil,
        correctAnswers = Nil,
        explanation = None,
        points = 20
      )
    }

    objectiveQuestions ++ subjectiveQuestions

  private def normalizeAnswer(value: String): String =
    Option(value).map(_.trim.toLowerCase).getOrElse("")

  private def normalizeAnswers(values: List[String]): List[String] =
    values.map(normalizeAnswer).filter(_.nonEmpty)

  private def buildQuizAnswerRecords(currentQuiz: Quiz, submitted: List[QuizAnswerRecord]): List[QuizAnswerRecord] =
    val submittedById = submitted.map(record => record.questionId -> record).toMap
    currentQuiz.questionBank.map { question =>
      val answers = normalizeAnswers(submittedById.get(question.id).map(_.submittedAnswers).getOrElse(Nil))
      val expectedAnswers = normalizeAnswers(question.correctAnswers)
      val correct =
        question.questionType match
          case QuizQuestionType.Subjective => false
          case QuizQuestionType.MultipleChoice =>
            answers.sorted == expectedAnswers.sorted
          case QuizQuestionType.FillBlank =>
            answers == expectedAnswers
          case _ =>
            answers.headOption.exists(answer => expectedAnswers.headOption.contains(answer))

      QuizAnswerRecord(
        questionId = question.id,
        submittedAnswers = answers,
        correct = correct
      )
    }

  def cloneQuizzesForStudent(
    connection: Connection,
    studentId: String,
    courseId: String
  ): IO[Unit] =
    for
      existingCount <- QuizTable.countStudentCourseQuizzes(connection, studentId, courseId)
      _ <-
        if existingCount > 0 then IO.unit
        else
          QuizTable.listQuizTemplatesForClone(connection, courseId).flatMap { templates =>
            templates.foldLeft(IO.unit) {
              case (acc, template) =>
                acc.flatMap { _ =>
                  val studentQuestionBank = buildStudentQuestionBank(template.questionBank, template.drawCount, template.shuffleQuestions, template.shuffleOptions)
                  val (objectiveCount, subjectiveCount) = countQuestions(studentQuestionBank)
                  val studentAnswerKeys = deriveAnswerKeysFromQuestionBank(studentQuestionBank)
                  val clonedQuizId = s"quiz-${UUID.randomUUID().toString.take(8)}"
                  for
                    _ <- QuizTable.insertQuizForStudent(
                      connection,
                      clonedQuizId,
                      courseId,
                      Some(studentId),
                      template.title,
                      template.durationMinutes,
                      objectiveCount,
                      subjectiveCount,
                      template.drawCount,
                      template.shuffleQuestions,
                      template.shuffleOptions,
                      studentQuestionBank
                    )
                    _ <- QuizAnswerKeyTable.insertQuizAnswerKeys(connection, clonedQuizId, studentAnswerKeys)
                  yield ()
                }
            }
          }
    yield ()

  def submitQuizForUser(
    connection: Connection,
    currentUser: UserProfile,
    request: SubmitQuizInput
  ): IO[QuizMutationResponse] =
    for
      _ <- ensureStudent(currentUser)
      quiz <- QuizTable.findStudentQuiz(connection, request.quizId, currentUser.id)
      currentQuiz <- IO.fromOption(quiz)(
        new IllegalArgumentException("Quiz does not exist for the current student.")
      )
      correctAnswers <- QuizAnswerKeyTable.listQuizAnswerKeys(connection, request.quizId)
      answerRecord <-
        if request.answerRecords.nonEmpty then
          IO.pure(buildQuizAnswerRecords(currentQuiz, request.answerRecords))
        else if currentQuiz.questionBank.isEmpty && request.objectiveAnswers.isEmpty then
          IO.pure(Nil)
        else
          for
            _ <-
              if correctAnswers.size == currentQuiz.objectiveQuestionCount then IO.unit
              else IO.raiseError(new IllegalStateException("Quiz answer key does not match the configured question count."))
            _ <-
              if request.objectiveAnswers.size == currentQuiz.objectiveQuestionCount then IO.unit
              else IO.raiseError(new IllegalArgumentException("Objective answer count does not match the quiz configuration."))
          yield correctAnswers.zip(request.objectiveAnswers).zipWithIndex.map { case ((expected, actual), index) =>
            QuizAnswerRecord(
              questionId = s"${request.quizId}-objective-${index + 1}",
              submittedAnswers = List(QuizOption.toString(actual)),
              correct = expected == actual
            )
          }
      autoGradableQuestions = currentQuiz.questionBank.filter(_.questionType != QuizQuestionType.Subjective)
      totalObjectivePoints = autoGradableQuestions.map(_.points).sum
      earnedObjectivePoints =
        autoGradableQuestions.map { question =>
          val isCorrect = answerRecord.find(_.questionId == question.id).exists(_.correct)
          if isCorrect then question.points else 0
        }.sum
      wrongQuestionIds = answerRecord.filterNot(_.correct).map(_.questionId)
      computedScore =
        if totalObjectivePoints <= 0 then 0
        else Math.round(earnedObjectivePoints.toDouble / totalObjectivePoints * 100).toInt
      normalizedSubjectiveAnswer =
        request.subjectiveAnswer.orElse(
          currentQuiz.questionBank
            .filter(_.questionType == QuizQuestionType.Subjective)
            .flatMap(question =>
              answerRecord.find(_.questionId == question.id).flatMap(_.submittedAnswers.headOption).filter(_.trim.nonEmpty).map(
                answer => s"${question.prompt}\n${answer.trim}"
              )
            )
            .reduceOption((left, right) => s"${left}\n\n${right}")
        )
      _ <- QuizTable.submitQuiz(connection, request.quizId, computedScore, normalizedSubjectiveAnswer, Instant.now().toString, answerRecord, wrongQuestionIds)
      updated <- QuizTable.findQuizById(connection, request.quizId)
      result <- IO.fromOption(updated)(
        new IllegalStateException("Quiz submitted successfully but could not be reloaded.")
      )
    yield QuizMutationResponse(
      message = s"Quiz ${currentQuiz.title} submitted. Auto score: ${computedScore}.",
      quiz = result
    )

  def reviewQuizForUser(
    connection: Connection,
    reviewer: UserProfile,
    request: ReviewQuizInput
  ): IO[QuizMutationResponse] =
    for
      currentQuizOption <- QuizTable.findQuizById(connection, request.quizId)
      currentQuiz <- IO.fromOption(currentQuizOption)(
        new IllegalArgumentException("Quiz does not exist.")
      )
      _ <- authorizeReviewer(connection, reviewer, currentQuiz.courseId)
      _ <-
        if request.subjectiveScore >= 0 && request.subjectiveScore <= 100 then IO.unit
        else IO.raiseError(new IllegalArgumentException("Subjective score must be between 0 and 100."))
      _ <-
        if currentQuiz.subjectiveQuestionCount > 0 then IO.unit
        else IO.raiseError(new IllegalArgumentException("This quiz does not contain subjective questions."))
      objectiveScore = currentQuiz.objectiveScore.orElse(currentQuiz.score).getOrElse(0)
      objectivePoints = currentQuiz.questionBank.filter(_.questionType != QuizQuestionType.Subjective).map(_.points).sum
      subjectivePoints = currentQuiz.questionBank.filter(_.questionType == QuizQuestionType.Subjective).map(_.points).sum
      totalPoints = Math.max(1, objectivePoints + subjectivePoints)
      finalScore =
        if objectivePoints == 0 then request.subjectiveScore
        else Math.round((objectiveScore.toDouble * objectivePoints + request.subjectiveScore.toDouble * subjectivePoints) / totalPoints).toInt
      _ <- QuizTable.reviewQuiz(connection, request.quizId, finalScore, request.subjectiveScore, request.feedback, reviewer.name, Instant.now().toString)
      updated <- QuizTable.findQuizById(connection, request.quizId)
      result <- IO.fromOption(updated)(
        new IllegalStateException("Quiz reviewed successfully but could not be reloaded.")
      )
    yield QuizMutationResponse(
      message = s"Quiz ${currentQuiz.title} reviewed successfully.",
      quiz = result
    )

  def publishQuizForUser(
    connection: Connection,
    publisher: UserProfile,
    request: PublishQuizInput
  ): IO[QuizMutationResponse] =
    for
      _ <- authorizePublisher(connection, publisher, request.courseId)
      title <- requireNonEmpty(request.title, "Quiz title cannot be empty.")
      _ <-
        if request.durationMinutes > 0 then IO.unit
        else IO.raiseError(new IllegalArgumentException("Quiz duration must be greater than 0."))
      _ <-
        if request.objectiveQuestionCount >= 0 && request.subjectiveQuestionCount >= 0 then IO.unit
        else IO.raiseError(new IllegalArgumentException("Quiz question counts cannot be negative."))
      normalizedQuestionBank =
        if request.questionBank.nonEmpty then request.questionBank.zipWithIndex.map(normalizeQuestion)
        else
          buildDefaultQuestionBank(
            title = title,
            objectiveQuestionCount = request.objectiveQuestionCount,
            subjectiveQuestionCount = request.subjectiveQuestionCount,
            answerKeys = request.answerKeys
          )
      _ <-
        if normalizedQuestionBank.nonEmpty then IO.unit
        else IO.raiseError(new IllegalArgumentException("Question bank cannot be empty."))
      _ <-
        if normalizedQuestionBank.forall(question => question.questionType == QuizQuestionType.Subjective || question.correctAnswers.nonEmpty) then IO.unit
        else IO.raiseError(new IllegalArgumentException("Each auto-gradable question must define at least one correct answer."))
      drawCount = request.drawCount.filter(_ > 0)
      _ <-
        if drawCount.forall(_ <= normalizedQuestionBank.size) then IO.unit
        else IO.raiseError(new IllegalArgumentException("Draw count cannot exceed the number of available questions."))
      effectiveAnswerKeys = deriveAnswerKeysFromQuestionBank(normalizedQuestionBank)
      counts = countQuestions(normalizedQuestionBank)
      objectiveQuestionCount = counts._1
      subjectiveQuestionCount = counts._2
      _ <-
        if request.questionBank.nonEmpty || effectiveAnswerKeys.size == objectiveQuestionCount then IO.unit
        else IO.raiseError(new IllegalArgumentException("Objective answer key count must match the number of auto-gradable questions."))
      templateQuizId = s"quiz-template-${UUID.randomUUID().toString.take(8)}"
      _ <- QuizTable.insertQuizForStudent(
        connection,
        templateQuizId,
        request.courseId,
        None,
        title,
        request.durationMinutes,
        objectiveQuestionCount,
        subjectiveQuestionCount,
        drawCount,
        request.shuffleQuestions,
        request.shuffleOptions,
        normalizedQuestionBank
      )
      studentIds <- CourseLessonTable.listEnrolledStudentIds(connection, request.courseId)
      _ <- studentIds.foldLeft(IO.unit) { case (acc, studentId) =>
        acc.flatMap { _ =>
          val studentQuestionBank =
            buildStudentQuestionBank(
              normalizedQuestionBank,
              drawCount,
              request.shuffleQuestions,
              request.shuffleOptions
            )
          val counts = countQuestions(studentQuestionBank)
          val studentObjectiveCount = counts._1
          val studentSubjectiveCount = counts._2
          val studentAnswerKeys = deriveAnswerKeysFromQuestionBank(studentQuestionBank)
          val studentQuizId = s"quiz-${UUID.randomUUID().toString.take(8)}"
          QuizTable
            .insertQuizForStudent(
              connection,
              studentQuizId,
              request.courseId,
              Some(studentId),
              title,
              request.durationMinutes,
              studentObjectiveCount,
              studentSubjectiveCount,
              drawCount,
              request.shuffleQuestions,
              request.shuffleOptions,
              studentQuestionBank
            )
            .flatMap(_ => QuizAnswerKeyTable.insertQuizAnswerKeys(connection, studentQuizId, studentAnswerKeys))
        }
      }
      _ <- QuizAnswerKeyTable.insertQuizAnswerKeys(connection, templateQuizId, effectiveAnswerKeys)
      quiz <- QuizTable.findQuizById(connection, templateQuizId)
      result <- IO.fromOption(quiz)(
        new IllegalStateException("Quiz published successfully but could not be reloaded.")
      )
    yield QuizMutationResponse(
      message = s"Quiz ${title} published to ${studentIds.size} enrolled students.",
      quiz = result
    )

