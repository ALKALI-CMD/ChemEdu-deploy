package system.routes

import cats.effect.IO
import cats.syntax.semigroupk.*
import microservices.admin.routes.AdminRoutes
import microservices.auth.routes.AuthRoutes
import microservices.course.catalog.routes.CatalogRoutes
import microservices.course.discussion.routes.{DiscussionRoutes, NotificationRoutes, PlatformReportRoutes}
import microservices.course.enrollment.routes.EnrollmentRoutes
import microservices.course.learning.routes.{AssignmentRoutes, ProgressRoutes, QuizRoutes}
import microservices.course.review.routes.ReviewRoutes
import microservices.dashboard.routes.DashboardRoutes
import microservices.exam.routes.ExamRoutes
import org.http4s.HttpApp
import org.http4s.HttpRoutes
import org.http4s.implicits.*

/** 聚合全部 HTTP 路由，并导出最终的 HttpApp */
object ApiRouter:

  private val allRoutes: HttpRoutes[IO] =
    HealthRouter.routes <+>
      AuthRoutes.routes <+>
      AdminRoutes.routes <+>
      DashboardRoutes.routes <+>
      CatalogRoutes.routes <+>
      EnrollmentRoutes.routes <+>
      AssignmentRoutes.routes <+>
      QuizRoutes.routes <+>
      ProgressRoutes.routes <+>
      DiscussionRoutes.routes <+>
      PlatformReportRoutes.routes <+>
      NotificationRoutes.routes <+>
      ReviewRoutes.routes <+>
      ExamRoutes.routes <+>
      PlannerRouter.routes

  val httpApp: HttpApp[IO] = MonitoringMiddleware(allRoutes.orNotFound)
