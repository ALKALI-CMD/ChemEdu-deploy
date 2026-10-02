// 文件说明：后端看板接口实现，用于处理Get看板学习请求并返回类型安全响应。
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
import microservices.admin.objects.{AnalyticsSnapshot, Order, OrderStatus}
import microservices.admin.tables.BusinessOpsTable
import microservices.auth.api.{ListAuthUsersAPIMessage, RequireSessionUserAPIMessage}
import microservices.course.catalog.api.ListCoursesForUserAPIMessage
import microservices.course.enrollment.api.ListEnrollmentsAPIMessage
import microservices.course.enrollment.objects.CourseEnrollment
import microservices.course.learning.api.{BuildLearningSummariesAPIMessage, ListAssignmentsAPIMessage, ListQuizzesAPIMessage}
import microservices.course.learning.objects.{Assignment, GradebookEntry, Quiz, QuizStatus, SubmissionStatus}
import microservices.dashboard.objects.apiTypes.DashboardLearningResponse
import system.api.{ConnectionAPIMessage, ConnectionApiMessageSchema}

import java.sql.Connection

final case class GetDashboardLearningAPIMessage(
  sessionToken: String
) extends ConnectionAPIMessage[DashboardLearningResponse]:
  override def plan(connection: Connection): IO[DashboardLearningResponse] =
    GetDashboardLearningAPIMessage.schema.execute(this, connection)

object GetDashboardLearningAPIMessage:
  val inputDecoder: Decoder[GetDashboardLearningAPIMessage] = deriveDecoder[GetDashboardLearningAPIMessage]
  val outputEncoder: Encoder[DashboardLearningResponse] = deriveEncoder[DashboardLearningResponse]
  val schema: ConnectionApiMessageSchema[GetDashboardLearningAPIMessage, DashboardLearningResponse] = ConnectionApiMessageSchema(
    name = "GetDashboardLearningAPIMessage",
    inputDecoder = inputDecoder,
    outputEncoder = outputEncoder,
    execute = (input, connection) =>
      for
        currentUser <- RequireSessionUserAPIMessage(input.sessionToken).plan(connection)
        usersResponse <- ListAuthUsersAPIMessage().plan(connection)
        courses <- ListCoursesForUserAPIMessage(currentUser).plan(connection)
        assignments <- ListAssignmentsAPIMessage(currentUser).plan(connection)
        quizzes <- ListQuizzesAPIMessage(currentUser).plan(connection)
        enrollments <- ListEnrollmentsAPIMessage(input.sessionToken).plan(connection)
        orders <- BusinessOpsTable.listOrders(connection, currentUser)
        courseProgress = BuildLearningSummariesAPIMessage.buildCourseProgress(courses)
        gradebook = BuildLearningSummariesAPIMessage.buildGradebook(courses, assignments, quizzes, courseProgress)
        analytics = buildAnalytics(usersResponse.users.size, assignments, quizzes, orders, enrollments, gradebook)
      yield DashboardLearningResponse(
        assignments = assignments,
        quizzes = quizzes,
        analytics = analytics,
        gradebook = gradebook,
        courseProgress = courseProgress
      )
  )

  private def buildAnalytics(
    registeredUsers: Int,
    assignments: List[Assignment],
    quizzes: List[Quiz],
    orders: List[Order],
    enrollments: List[CourseEnrollment],
    gradebook: List[GradebookEntry]
  ): AnalyticsSnapshot =
    val paidOrders = orders.filter(_.status == OrderStatus.Paid)
    val scoredAssignments = assignments.flatMap(_.score).map(_.toDouble)
    val scoredQuizzes = quizzes.flatMap(_.score).map(_.toDouble)
    val averageAssignmentScore =
      if scoredAssignments.nonEmpty then scoredAssignments.sum.toDouble / scoredAssignments.size
      else 0.0
    val passRate =
      if scoredQuizzes.nonEmpty then
        val passCount = scoredQuizzes.count(_ >= 60)
        f"${passCount.toDouble / scoredQuizzes.size * 100}%.0f%%"
      else "0%"
    val conversionRate =
      if enrollments.nonEmpty then
        val paidBuyers = paidOrders.map(_.buyer).distinct.size
        val enrolledUsers = enrollments.map(_.userId).distinct.size
        if enrolledUsers == 0 then "0.0%"
        else f"${paidBuyers.toDouble / enrolledUsers * 100}%.1f%%"
      else "0.0%"
    val completedTaskRate =
      val totalTasks = assignments.size + quizzes.size
      val completedTasks =
        assignments.count(_.submissionStatus == SubmissionStatus.Reviewed) +
          quizzes.count(_.status == QuizStatus.Finished)
      if totalTasks == 0 then "0%"
      else f"${completedTasks.toDouble / totalTasks * 100}%.0f%%"
    val gradebookAverage =
      if gradebook.nonEmpty then gradebook.map(_.totalScore.toDouble).sum / gradebook.size
      else 0.0

    AnalyticsSnapshot(
      registeredUsers = registeredUsers,
      paidConversionRate = conversionRate,
      totalRevenue = paidOrders.map(_.amount).sum,
      averageAssignmentScore = BigDecimal(averageAssignmentScore).setScale(1, BigDecimal.RoundingMode.HALF_UP).toDouble,
      quizPassRate = passRate,
      weeklyLearningHours = enrollments.size * 12,
      gradebookAverage = BigDecimal(gradebookAverage).setScale(1, BigDecimal.RoundingMode.HALF_UP).toDouble,
      completedTaskRate = completedTaskRate
    )

  given Decoder[GetDashboardLearningAPIMessage] = inputDecoder
  given Encoder[GetDashboardLearningAPIMessage] = deriveEncoder[GetDashboardLearningAPIMessage]
