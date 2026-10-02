// 文件说明：后端看板接口实现，用于处理Get看板经营请求并返回类型安全响应。
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
import microservices.admin.objects.{BusinessDashboardSnapshot, Invoice, Order, Refund}
import microservices.admin.tables.BusinessOpsTable
import microservices.auth.api.RequireSessionUserAPIMessage
import microservices.course.catalog.api.ListCoursesForUserAPIMessage
import microservices.course.catalog.objects.{Course, CourseStatus}
import microservices.course.discussion.api.ListDiscussionsAPIMessage
import microservices.course.discussion.objects.DiscussionTopic
import microservices.course.enrollment.api.ListEnrollmentsAPIMessage
import microservices.course.enrollment.objects.CourseEnrollment
import microservices.course.learning.api.{BuildLearningSummariesAPIMessage, ListAssignmentsAPIMessage, ListQuizzesAPIMessage}
import microservices.course.learning.objects.{Assignment, GradebookEntry, Quiz, QuizStatus, SubmissionStatus}
import microservices.dashboard.objects.apiTypes.DashboardBusinessResponse
import system.api.{ConnectionAPIMessage, ConnectionApiMessageSchema}

import java.sql.Connection

final case class GetDashboardBusinessAPIMessage(
  sessionToken: String
) extends ConnectionAPIMessage[DashboardBusinessResponse]:
  override def plan(connection: Connection): IO[DashboardBusinessResponse] =
    GetDashboardBusinessAPIMessage.schema.execute(this, connection)

object GetDashboardBusinessAPIMessage:
  val inputDecoder: Decoder[GetDashboardBusinessAPIMessage] = deriveDecoder[GetDashboardBusinessAPIMessage]
  val outputEncoder: Encoder[DashboardBusinessResponse] = deriveEncoder[DashboardBusinessResponse]
  val schema: ConnectionApiMessageSchema[GetDashboardBusinessAPIMessage, DashboardBusinessResponse] = ConnectionApiMessageSchema(
    name = "GetDashboardBusinessAPIMessage",
    inputDecoder = inputDecoder,
    outputEncoder = outputEncoder,
    execute = (input, connection) =>
      for
        currentUser <- RequireSessionUserAPIMessage(input.sessionToken).plan(connection)
        courses <- ListCoursesForUserAPIMessage(currentUser).plan(connection)
        assignments <- ListAssignmentsAPIMessage(currentUser).plan(connection)
        quizzes <- ListQuizzesAPIMessage(currentUser).plan(connection)
        discussions <- ListDiscussionsAPIMessage.listDiscussions(connection, currentUser)
        enrollments <- ListEnrollmentsAPIMessage(input.sessionToken).plan(connection)
        messages <- BusinessOpsTable.listMessages(connection, currentUser)
        orders <- BusinessOpsTable.listOrders(connection, currentUser)
        coupons <- BusinessOpsTable.listCoupons(connection)
        promotions <- BusinessOpsTable.listPromotions(connection)
        invoices <- BusinessOpsTable.listInvoices(connection, currentUser)
        refunds <- BusinessOpsTable.listRefunds(connection, currentUser)
        resourceAssets <- BusinessOpsTable.listResourceAssets(connection, currentUser)
        courseProgress = BuildLearningSummariesAPIMessage.buildCourseProgress(courses)
        gradebook = BuildLearningSummariesAPIMessage.buildGradebook(courses, assignments, quizzes, courseProgress)
        businessDashboard = buildBusinessDashboard(courses, assignments, quizzes, discussions, orders, enrollments, invoices, refunds, gradebook)
      yield DashboardBusinessResponse(
        messages = messages,
        orders = orders,
        coupons = coupons,
        promotions = promotions,
        invoices = invoices,
        refunds = refunds,
        resourceAssets = resourceAssets,
        businessDashboard = businessDashboard
      )
  )

  private def buildBusinessDashboard(
    courses: List[Course],
    assignments: List[Assignment],
    quizzes: List[Quiz],
    discussions: List[DiscussionTopic],
    orders: List[Order],
    enrollments: List[CourseEnrollment],
    invoices: List[Invoice],
    refunds: List[Refund],
    gradebook: List[GradebookEntry]
  ): BusinessDashboardSnapshot =
    val publishedCourses = courses.count(_.status == CourseStatus.Published)
    val conversionRate =
      if publishedCourses == 0 then "0.0%"
      else f"${enrollments.map(_.courseId).distinct.size.toDouble / publishedCourses * 100}%.1f%%"
    val totalTasks = assignments.size + quizzes.size
    val completedTasks =
      assignments.count(_.submissionStatus == SubmissionStatus.Reviewed) +
        quizzes.count(_.status == QuizStatus.Finished)
    val taskCompletionRate =
      if totalTasks == 0 then "0%"
      else f"${completedTasks.toDouble / totalTasks * 100}%.0f%%"
    val discussionActivityScore =
      discussions.map(topic => topic.heatScore + topic.replyCount + topic.likeCount + topic.favoriteCount).sum
    val paidOrders = orders.filter(_.status.entryName == "paid")
    val refundTotal = refunds.map(_.amount).sum + orders.map(_.refundAmount).sum

    BusinessDashboardSnapshot(
      courseConversionRate = conversionRate,
      enrollmentCount = enrollments.size,
      activeLearnerCount = enrollments.map(_.userId).distinct.size,
      taskCompletionRate = taskCompletionRate,
      discussionActivityScore = discussionActivityScore,
      revenue = paidOrders.map(_.amount).sum,
      refundAmount = refundTotal,
      couponUsageCount = orders.count(_.couponCode.exists(_.nonEmpty)),
      invoicePendingCount = invoices.count(_.status != "issued")
    )

  given Decoder[GetDashboardBusinessAPIMessage] = inputDecoder
  given Encoder[GetDashboardBusinessAPIMessage] = deriveEncoder[GetDashboardBusinessAPIMessage]
