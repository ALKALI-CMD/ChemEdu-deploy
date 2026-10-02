// 文件说明：后端看板接口实现，用于处理Get教学Insights请求并返回类型安全响应。
package microservices.dashboard.api

import microservices.admin.objects.apiTypes.*
import microservices.auth.objects.apiTypes.*
import microservices.course.catalog.objects.apiTypes.*
import microservices.course.discussion.objects.apiTypes.*
import microservices.course.learning.objects.apiTypes.*
import microservices.course.review.objects.apiTypes.*
import microservices.dashboard.objects.apiTypes.*
import cats.effect.IO
import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}
import microservices.auth.api.{ListAuthUsersAPIMessage, RequireSessionUserAPIMessage}
import microservices.auth.objects.*
import microservices.course.catalog.api.ListCoursesForUserAPIMessage
import microservices.course.catalog.objects.*
import microservices.course.enrollment.objects.*
import microservices.course.learning.objects.*
import microservices.dashboard.objects.*
import microservices.course.enrollment.api.ListEnrollmentsAPIMessage
import microservices.dashboard.tables.DashboardQueryTable
import system.api.{ConnectionAPIMessage, ConnectionApiMessageSchema}

import java.sql.Connection
import scala.collection.mutable.ListBuffer

final case class GetTeachingInsightsAPIMessage(
  sessionToken: String
) extends ConnectionAPIMessage[TeachingInsightSnapshot]:
  override def plan(connection: Connection): IO[TeachingInsightSnapshot] =
    GetTeachingInsightsAPIMessage.schema.execute(this, connection)

object GetTeachingInsightsAPIMessage:
  val inputDecoder: Decoder[GetTeachingInsightsAPIMessage] = deriveDecoder[GetTeachingInsightsAPIMessage]
  val outputEncoder: Encoder[TeachingInsightSnapshot] = deriveEncoder[TeachingInsightSnapshot]
  val schema: ConnectionApiMessageSchema[GetTeachingInsightsAPIMessage, TeachingInsightSnapshot] = ConnectionApiMessageSchema(
    name = "GetTeachingInsightsAPIMessage",
    inputDecoder = inputDecoder,
    outputEncoder = outputEncoder,
    execute = (input, connection) =>
      for
        currentUser <- RequireSessionUserAPIMessage(input.sessionToken).plan(connection)
        usersResponse <- ListAuthUsersAPIMessage().plan(connection)
        courses <- ListCoursesForUserAPIMessage(currentUser).plan(connection)
        enrollments <- ListEnrollmentsAPIMessage(input.sessionToken).plan(connection)
        teachingInsightSnapshots <-
          if currentUser.role == UserRole.Teacher || currentUser.role == UserRole.Admin then
            DashboardQueryTable.listTeachingInsightSnapshots(connection, courses.map(_.id))
          else IO.pure((Nil, Nil, Nil))
        teachingInsights = buildTeachingInsights(currentUser, usersResponse.users, courses, enrollments, teachingInsightSnapshots)
      yield teachingInsights
  )

  private def buildTeachingInsights(
    currentUser: UserProfile,
    users: List[UserProfile],
    courses: List[Course],
    enrollments: List[CourseEnrollment],
    teachingInsightSnapshots: (List[StudentAssignmentSnapshot], List[StudentQuizSnapshot], List[StudentLessonProgressSnapshot])
  ): TeachingInsightSnapshot =
    if currentUser.role != UserRole.Teacher && currentUser.role != UserRole.Admin then
      TeachingInsightSnapshot(
        atRiskStudents = Nil,
        questionHotspots = Nil,
        lessonBottlenecks = Nil,
        completionDistributions = Nil,
        courseGradeDistributions = Nil,
        classGradeDistributions = Nil,
        interventionQueueCount = 0
      )
    else
      val (assignmentSnapshots, quizSnapshots, lessonProgressSnapshots) = teachingInsightSnapshots
      val userNameById = users.map(user => user.id -> user.name).toMap
      val courseById = courses.map(course => course.id -> course).toMap
      val enrolledStudentIdsByCourse =
        enrollments
          .filter(_.status == "enrolled")
          .groupBy(_.courseId)
          .view
          .mapValues(_.map(_.userId).distinct)
          .toMap
      val lessonsByCourse = courses.map(course => course.id -> course.modules.flatMap(_.lessons)).toMap

      val atRiskStudents = buildAtRiskStudents(
        userNameById = userNameById,
        courseById = courseById,
        enrolledStudentIdsByCourse = enrolledStudentIdsByCourse,
        lessonsByCourse = lessonsByCourse,
        assignmentSnapshots = assignmentSnapshots,
        quizSnapshots = quizSnapshots,
        lessonProgressSnapshots = lessonProgressSnapshots
      )
      val questionHotspots = buildQuestionHotspots(courseById, quizSnapshots)
      val lessonBottlenecks = buildLessonBottlenecks(courseById, enrolledStudentIdsByCourse, lessonProgressSnapshots)
      val completionDistributions =
        buildCompletionDistributions(courseById, enrolledStudentIdsByCourse, lessonsByCourse, lessonProgressSnapshots)
      val courseGradeDistributions =
        buildCourseGradeDistributions(courseById, enrolledStudentIdsByCourse, lessonsByCourse, assignmentSnapshots, quizSnapshots, lessonProgressSnapshots)
      val classGradeDistributions =
        buildClassGradeDistributions(users, courseById, enrolledStudentIdsByCourse, lessonsByCourse, assignmentSnapshots, quizSnapshots, lessonProgressSnapshots)

      TeachingInsightSnapshot(
        atRiskStudents = atRiskStudents,
        questionHotspots = questionHotspots,
        lessonBottlenecks = lessonBottlenecks,
        completionDistributions = completionDistributions,
        courseGradeDistributions = courseGradeDistributions,
        classGradeDistributions = classGradeDistributions,
        interventionQueueCount = atRiskStudents.size
      )

  private def buildAtRiskStudents(
    userNameById: Map[String, String],
    courseById: Map[String, Course],
    enrolledStudentIdsByCourse: Map[String, List[String]],
    lessonsByCourse: Map[String, List[Lesson]],
    assignmentSnapshots: List[StudentAssignmentSnapshot],
    quizSnapshots: List[StudentQuizSnapshot],
    lessonProgressSnapshots: List[StudentLessonProgressSnapshot]
  ): List[AtRiskStudent] =
    val assignmentsByCourseStudent = assignmentSnapshots.groupBy(item => (item.courseId, item.studentId))
    val quizzesByCourseStudent = quizSnapshots.groupBy(item => (item.courseId, item.studentId))
    val lessonProgressByCourseStudent = lessonProgressSnapshots.groupBy(item => (item.courseId, item.studentId))

    enrolledStudentIdsByCourse.toList.flatMap { case (courseId, studentIds) =>
      val totalLessons = lessonsByCourse.getOrElse(courseId, Nil).size
      courseById.get(courseId).toList.flatMap { course =>
        studentIds.flatMap { studentId =>
          val studentAssignments = assignmentsByCourseStudent.getOrElse((courseId, studentId), Nil)
          val studentQuizzes = quizzesByCourseStudent.getOrElse((courseId, studentId), Nil)
          val studentProgress = lessonProgressByCourseStudent.getOrElse((courseId, studentId), Nil)

          val completedLessons = studentProgress.count(_.completed)
          val completionRate =
            if totalLessons == 0 then 0
            else Math.round(completedLessons.toDouble / totalLessons * 100).toInt
          val studyMinutes = studentProgress.map(_.studyMinutes).sum
          val pendingAssignmentCount = studentAssignments.count(_.submissionStatus == SubmissionStatus.Pending)
          val pendingQuizCount = studentQuizzes.count(_.status != QuizStatus.Finished)
          val lateSubmissionCount = studentAssignments.count(_.lateSubmitted)
          val scoredValues = studentAssignments.flatMap(_.score).map(_.toDouble) ++ studentQuizzes.flatMap(_.score).map(_.toDouble)
          val averageScore =
            if scoredValues.nonEmpty then BigDecimal(scoredValues.sum / scoredValues.size).setScale(1, BigDecimal.RoundingMode.HALF_UP).toDouble
            else 0.0

          val riskReasons = ListBuffer.empty[String]
          if completionRate < 40 then riskReasons += "Course completion below 40%"
          if pendingAssignmentCount + pendingQuizCount >= 2 then riskReasons += "Many pending learning tasks"
          if scoredValues.nonEmpty && averageScore < 60 then riskReasons += "Recent assessment average below 60"
          if lateSubmissionCount > 0 then riskReasons += "Late submission record"

          if riskReasons.nonEmpty then
            Some(
              AtRiskStudent(
                userId = studentId,
                studentName = userNameById.getOrElse(studentId, studentId),
                courseId = courseId,
                courseTitle = course.title,
                completionRate = completionRate,
                studyMinutes = studyMinutes,
                pendingAssignmentCount = pendingAssignmentCount,
                pendingQuizCount = pendingQuizCount,
                averageScore = averageScore,
                riskReasons = riskReasons.toList
              )
            )
          else None
        }
      }
    }.sortBy(student => (student.completionRate, -(student.pendingAssignmentCount + student.pendingQuizCount))).take(8)

  private def buildQuestionHotspots(
    courseById: Map[String, Course],
    quizSnapshots: List[StudentQuizSnapshot]
  ): List[QuestionHotspot] =
    quizSnapshots
      .filter(_.status == QuizStatus.Finished)
      .flatMap { quiz =>
        val wrongIds = quiz.wrongQuestionIds.toSet
        quiz.questionBank
          .filter(_.questionType != QuizQuestionType.Subjective)
          .map { question =>
            ((quiz.courseId, quiz.title, question.id, question.prompt, QuizQuestionType.toString(question.questionType)), (1, if wrongIds.contains(question.id) then 1 else 0))
          }
      }
      .groupBy(_._1)
      .toList
      .flatMap { case ((courseId, quizTitle, questionId, prompt, questionType), entries) =>
        courseById.get(courseId).map { course =>
          val attemptCount = entries.map(_._2._1).sum
          val wrongCount = entries.map(_._2._2).sum
          QuestionHotspot(
            courseId = courseId,
            courseTitle = course.title,
            quizTitle = quizTitle,
            questionId = questionId,
            questionPrompt = prompt,
            questionType = questionType,
            wrongCount = wrongCount,
            attemptCount = attemptCount,
            wrongRate = if attemptCount == 0 then 0 else Math.round(wrongCount.toDouble / attemptCount * 100).toInt
          )
        }
      }
      .sortBy(item => (-item.wrongRate, -item.attemptCount))
      .take(8)

  private def buildLessonBottlenecks(
    courseById: Map[String, Course],
    enrolledStudentIdsByCourse: Map[String, List[String]],
    lessonProgressSnapshots: List[StudentLessonProgressSnapshot]
  ): List[LessonBottleneck] =
    lessonProgressSnapshots
      .groupBy(progress => (progress.courseId, progress.lessonId, progress.lessonTitle, progress.moduleTitle, progress.requiredStudyMinutes))
      .toList
      .flatMap { case ((courseId, lessonId, lessonTitle, moduleTitle, requiredStudyMinutes), rows) =>
        courseById.get(courseId).map { course =>
          val enrolledCount = enrolledStudentIdsByCourse.getOrElse(courseId, Nil).distinct.size
          val completedStudents = rows.filter(_.completed).map(_.studentId).distinct.size
          val averageStudyMinutes =
            if rows.nonEmpty then Math.round(rows.map(_.studyMinutes).sum.toDouble / rows.size).toInt
            else 0
          LessonBottleneck(
            courseId = courseId,
            courseTitle = course.title,
            moduleTitle = moduleTitle,
            lessonId = lessonId,
            lessonTitle = lessonTitle,
            completionRate = if enrolledCount == 0 then 0 else Math.round(completedStudents.toDouble / enrolledCount * 100).toInt,
            completedStudentCount = completedStudents,
            enrolledStudentCount = enrolledCount,
            averageStudyMinutes = averageStudyMinutes,
            requiredStudyMinutes = requiredStudyMinutes
          )
        }
      }
      .sortBy(item => (item.completionRate, -item.requiredStudyMinutes))
      .take(8)

  private def buildCompletionDistributions(
    courseById: Map[String, Course],
    enrolledStudentIdsByCourse: Map[String, List[String]],
    lessonsByCourse: Map[String, List[Lesson]],
    lessonProgressSnapshots: List[StudentLessonProgressSnapshot]
  ): List[CourseCompletionDistribution] =
    val progressByCourseStudent = lessonProgressSnapshots.groupBy(progress => (progress.courseId, progress.studentId))

    enrolledStudentIdsByCourse.toList.flatMap { case (courseId, studentIds) =>
      courseById.get(courseId).map { course =>
        val totalLessons = lessonsByCourse.getOrElse(courseId, Nil).size
        val completionRates = studentIds.distinct.map { studentId =>
          val rows = progressByCourseStudent.getOrElse((courseId, studentId), Nil)
          val completedLessons = rows.count(_.completed)
          if totalLessons == 0 then 0
          else Math.round(completedLessons.toDouble / totalLessons * 100).toInt
        }

        CourseCompletionDistribution(
          courseId = courseId,
          courseTitle = course.title,
          excellentCount = completionRates.count(_ >= 85),
          steadyCount = completionRates.count(rate => rate >= 60 && rate < 85),
          warningCount = completionRates.count(rate => rate >= 30 && rate < 60),
          stuckCount = completionRates.count(_ < 30),
          averageCompletionRate =
            if completionRates.nonEmpty then Math.round(completionRates.sum.toDouble / completionRates.size).toInt
            else 0
        )
      }
    }.sortBy(_.courseTitle)

  private def computeStudentCourseTotals(
    enrolledStudentIdsByCourse: Map[String, List[String]],
    lessonsByCourse: Map[String, List[Lesson]],
    assignmentSnapshots: List[StudentAssignmentSnapshot],
    quizSnapshots: List[StudentQuizSnapshot],
    lessonProgressSnapshots: List[StudentLessonProgressSnapshot]
  ): List[(String, String, Double)] =
    val assignmentsByCourseStudent = assignmentSnapshots.groupBy(item => (item.courseId, item.studentId))
    val quizzesByCourseStudent = quizSnapshots.groupBy(item => (item.courseId, item.studentId))
    val progressByCourseStudent = lessonProgressSnapshots.groupBy(item => (item.courseId, item.studentId))

    enrolledStudentIdsByCourse.toList.flatMap { case (courseId, studentIds) =>
      val totalLessons = lessonsByCourse.getOrElse(courseId, Nil).size
      studentIds.distinct.map { studentId =>
        val assignmentAverage =
          assignmentsByCourseStudent
            .getOrElse((courseId, studentId), Nil)
            .flatMap(_.score)
            .map(_.toDouble) match
            case Nil => 0.0
            case scores => scores.sum / scores.size
        val quizAverage =
          quizzesByCourseStudent
            .getOrElse((courseId, studentId), Nil)
            .flatMap(_.score)
            .map(_.toDouble) match
            case Nil => 0.0
            case scores => scores.sum / scores.size
        val completedLessons = progressByCourseStudent.getOrElse((courseId, studentId), Nil).count(_.completed)
        val progressScore =
          if totalLessons == 0 then 0.0
          else completedLessons.toDouble / totalLessons * 100
        val totalScore = assignmentAverage * 0.4 + quizAverage * 0.4 + progressScore * 0.2
        (courseId, studentId, BigDecimal(totalScore).setScale(1, BigDecimal.RoundingMode.HALF_UP).toDouble)
      }
    }

  private def summarizeScoreBand(scores: List[Double]): (Double, String, String, Int, Int, Int, Int) =
    val average =
      if scores.nonEmpty then BigDecimal(scores.sum / scores.size).setScale(1, BigDecimal.RoundingMode.HALF_UP).toDouble
      else 0.0
    val failCount = scores.count(_ < 60)
    val passCount = scores.count(score => score >= 60 && score < 75)
    val goodCount = scores.count(score => score >= 75 && score < 90)
    val excellentCount = scores.count(_ >= 90)
    val passRate =
      if scores.isEmpty then "0%"
      else f"${scores.count(_ >= 60).toDouble / scores.size * 100}%.0f%%"
    val excellentRate =
      if scores.isEmpty then "0%"
      else f"${scores.count(_ >= 90).toDouble / scores.size * 100}%.0f%%"
    (average, passRate, excellentRate, failCount, passCount, goodCount, excellentCount)

  private def buildCourseGradeDistributions(
    courseById: Map[String, Course],
    enrolledStudentIdsByCourse: Map[String, List[String]],
    lessonsByCourse: Map[String, List[Lesson]],
    assignmentSnapshots: List[StudentAssignmentSnapshot],
    quizSnapshots: List[StudentQuizSnapshot],
    lessonProgressSnapshots: List[StudentLessonProgressSnapshot]
  ): List[CourseGradeDistribution] =
    computeStudentCourseTotals(
      enrolledStudentIdsByCourse,
      lessonsByCourse,
      assignmentSnapshots,
      quizSnapshots,
      lessonProgressSnapshots
    )
      .groupBy(_._1)
      .toList
      .flatMap { case (courseId, rows) =>
        courseById.get(courseId).map { course =>
          val scores = rows.map(_._3)
          val (average, passRate, excellentRate, failCount, passCount, goodCount, excellentCount) = summarizeScoreBand(scores)
          CourseGradeDistribution(
            courseId = courseId,
            courseTitle = course.title,
            studentCount = scores.size,
            averageScore = average,
            passRate = passRate,
            excellentRate = excellentRate,
            failCount = failCount,
            passCount = passCount,
            goodCount = goodCount,
            excellentCount = excellentCount
          )
        }
      }
      .sortBy(_.courseTitle)

  private def buildClassGradeDistributions(
    users: List[UserProfile],
    courseById: Map[String, Course],
    enrolledStudentIdsByCourse: Map[String, List[String]],
    lessonsByCourse: Map[String, List[Lesson]],
    assignmentSnapshots: List[StudentAssignmentSnapshot],
    quizSnapshots: List[StudentQuizSnapshot],
    lessonProgressSnapshots: List[StudentLessonProgressSnapshot]
  ): List[ClassGradeDistribution] =
    val classByStudentId =
      users.map { user =>
        user.id -> (
          user.academicClassId.getOrElse("unassigned"),
          user.academicClassName.getOrElse("unassigned")
        )
      }.toMap

    computeStudentCourseTotals(
      enrolledStudentIdsByCourse,
      lessonsByCourse,
      assignmentSnapshots,
      quizSnapshots,
      lessonProgressSnapshots
    )
      .groupBy { case (courseId, studentId, _) =>
        val (classId, className) = classByStudentId.getOrElse(studentId, ("unassigned", "unassigned"))
        (courseId, classId, className)
      }
      .toList
      .flatMap { case ((courseId, classId, className), rows) =>
        courseById.get(courseId).map { course =>
          val scores = rows.map(_._3)
          val (average, passRate, excellentRate, failCount, passCount, goodCount, excellentCount) = summarizeScoreBand(scores)
          ClassGradeDistribution(
            courseId = courseId,
            courseTitle = course.title,
            academicClassId = classId,
            academicClassName = className,
            studentCount = scores.size,
            averageScore = average,
            passRate = passRate,
            excellentRate = excellentRate,
            failCount = failCount,
            passCount = passCount,
            goodCount = goodCount,
            excellentCount = excellentCount
          )
        }
      }
      .sortBy(item => (item.courseTitle, item.academicClassName))

  given Decoder[GetTeachingInsightsAPIMessage] = inputDecoder
  given Encoder[GetTeachingInsightsAPIMessage] = deriveEncoder[GetTeachingInsightsAPIMessage]
