// 文件说明：后端学习接口实现，用于处理构建学习Summaries请求并返回类型安全响应。
package microservices.course.learning.api

import cats.effect.IO
import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}
import microservices.course.catalog.objects.Course
import microservices.course.learning.objects.{Assignment, CourseProgressStats, GradebookEntry, Quiz, QuizStatus, SubmissionStatus}
import system.api.{ConnectionAPIMessage, ConnectionApiMessageSchema}

import java.sql.Connection

final case class BuildLearningSummariesAPIMessage(
  courses: List[Course],
  assignments: List[Assignment],
  quizzes: List[Quiz]
) extends ConnectionAPIMessage[(List[CourseProgressStats], List[GradebookEntry])]:
  override def plan(connection: Connection): IO[(List[CourseProgressStats], List[GradebookEntry])] =
    BuildLearningSummariesAPIMessage.schema.execute(this, connection)

object BuildLearningSummariesAPIMessage:
  val inputDecoder: Decoder[BuildLearningSummariesAPIMessage] = deriveDecoder[BuildLearningSummariesAPIMessage]
  val outputEncoder: Encoder[(List[CourseProgressStats], List[GradebookEntry])] =
    Encoder.forProduct2("courseProgress", "gradebook")(identity)
  val schema: ConnectionApiMessageSchema[BuildLearningSummariesAPIMessage, (List[CourseProgressStats], List[GradebookEntry])] = ConnectionApiMessageSchema(
    name = "BuildLearningSummariesAPIMessage",
    inputDecoder = inputDecoder,
    outputEncoder = outputEncoder,
    execute = (input, _) => IO.pure(build(input.courses, input.assignments, input.quizzes))
  )

  def buildCourseProgress(courses: List[Course]): List[CourseProgressStats] =
    courses.map { course =>
      val lessons = course.modules.flatMap(_.lessons)
      val completedLessons = lessons.count(_.completed)
      val totalLessons = lessons.size
      val studyMinutes = lessons.flatMap(_.studyRecord.map(_.studyMinutes)).sum
      CourseProgressStats(
        courseId = course.id,
        completedLessons = completedLessons,
        totalLessons = totalLessons,
        studyMinutes = studyMinutes,
        completionRate =
          if totalLessons == 0 then 0
          else Math.round(completedLessons.toDouble / totalLessons * 100).toInt
      )
    }

  def buildGradebook(
    courses: List[Course],
    assignments: List[Assignment],
    quizzes: List[Quiz],
    courseProgress: List[CourseProgressStats]
  ): List[GradebookEntry] =
    val assignmentWeight = 40
    val quizWeight = 40
    val progressWeight = 20
    val progressByCourseId = courseProgress.map(entry => entry.courseId -> entry).toMap

    courses.map { course =>
      val courseAssignments = assignments.filter(_.courseId == course.id)
      val courseQuizzes = quizzes.filter(_.courseId == course.id)
      val progressScore = progressByCourseId.get(course.id).map(_.completionRate.toDouble).getOrElse(course.completionRate.toDouble)
      val assignmentScores = courseAssignments.flatMap(_.score).map(_.toDouble)
      val quizScores = courseQuizzes.flatMap(_.score).map(_.toDouble)
      val assignmentAverage =
        if assignmentScores.nonEmpty then assignmentScores.sum / assignmentScores.size else 0.0
      val quizAverage =
        if quizScores.nonEmpty then quizScores.sum / quizScores.size else 0.0
      val totalTaskCount = courseAssignments.size + courseQuizzes.size
      val completedTaskCount =
        courseAssignments.count(_.submissionStatus == SubmissionStatus.Reviewed) +
          courseQuizzes.count(_.status == QuizStatus.Finished)
      val totalScore =
        assignmentAverage * assignmentWeight.toDouble / 100 +
          quizAverage * quizWeight.toDouble / 100 +
          progressScore * progressWeight.toDouble / 100
      GradebookEntry(
        courseId = course.id,
        courseTitle = course.title,
        assignmentAverage = BigDecimal(assignmentAverage).setScale(1, BigDecimal.RoundingMode.HALF_UP).toDouble,
        quizAverage = BigDecimal(quizAverage).setScale(1, BigDecimal.RoundingMode.HALF_UP).toDouble,
        progressScore = BigDecimal(progressScore).setScale(1, BigDecimal.RoundingMode.HALF_UP).toDouble,
        totalScore = BigDecimal(totalScore).setScale(1, BigDecimal.RoundingMode.HALF_UP).toDouble,
        assignmentWeight = assignmentWeight,
        quizWeight = quizWeight,
        progressWeight = progressWeight,
        completedTaskRate =
          if totalTaskCount == 0 then "0%"
          else f"${completedTaskCount.toDouble / totalTaskCount * 100}%.0f%%"
      )
    }

  private def build(
    courses: List[Course],
    assignments: List[Assignment],
    quizzes: List[Quiz]
  ): (List[CourseProgressStats], List[GradebookEntry]) =
    val courseProgress = buildCourseProgress(courses)
    val gradebook = buildGradebook(courses, assignments, quizzes, courseProgress)
    (courseProgress, gradebook)

  given Decoder[BuildLearningSummariesAPIMessage] = inputDecoder
  given Encoder[BuildLearningSummariesAPIMessage] = deriveEncoder[BuildLearningSummariesAPIMessage]
