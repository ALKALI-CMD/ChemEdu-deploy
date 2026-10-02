// 文件说明：后端看板接口实现，用于处理Get看板基础数据请求并返回类型安全响应。
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
import microservices.admin.tables.OrganizationTable
import microservices.auth.api.{ListAuthUsersAPIMessage, RequireSessionUserAPIMessage}
import microservices.auth.objects.UserProfile
import microservices.course.catalog.api.ListCoursesForUserAPIMessage
import microservices.course.catalog.objects.{Course, CourseRecommendation, LearningPathRecommendation}
import microservices.course.discussion.api.{ListDiscussionsAPIMessage, ListNotificationSettingsAPIMessage, ListNotificationsAPIMessage, ListPlatformReportsAPIMessage}
import microservices.course.discussion.objects.DiscussionTopic
import microservices.course.enrollment.api.{ListEnrollmentsAPIMessage, ListWaitlistEntriesAPIMessage}
import microservices.course.enrollment.objects.CourseEnrollment
import microservices.course.review.api.ListCourseReviewsAPIMessage
import microservices.dashboard.objects.apiTypes.DashboardBaseResponse
import microservices.dashboard.tables.DashboardQueryTable
import system.api.{ConnectionAPIMessage, ConnectionApiMessageSchema}

import java.sql.Connection

final case class GetDashboardBaseAPIMessage(
  sessionToken: String
) extends ConnectionAPIMessage[DashboardBaseResponse]:
  override def plan(connection: Connection): IO[DashboardBaseResponse] =
    GetDashboardBaseAPIMessage.schema.execute(this, connection)

object GetDashboardBaseAPIMessage:
  val inputDecoder: Decoder[GetDashboardBaseAPIMessage] = deriveDecoder[GetDashboardBaseAPIMessage]
  val outputEncoder: Encoder[DashboardBaseResponse] = deriveEncoder[DashboardBaseResponse]
  val schema: ConnectionApiMessageSchema[GetDashboardBaseAPIMessage, DashboardBaseResponse] = ConnectionApiMessageSchema(
    name = "GetDashboardBaseAPIMessage",
    inputDecoder = inputDecoder,
    outputEncoder = outputEncoder,
    execute = (input, connection) =>
      for
        currentUser <- RequireSessionUserAPIMessage(input.sessionToken).plan(connection)
        usersResponse <- ListAuthUsersAPIMessage().plan(connection)
        departments <- OrganizationTable.listDepartments(connection)
        majors <- OrganizationTable.listMajors(connection)
        academicClasses <- OrganizationTable.listAcademicClasses(connection)
        semesters <- OrganizationTable.listSemesters(connection)
        courses <- ListCoursesForUserAPIMessage(currentUser).plan(connection)
        courseReviews <- ListCourseReviewsAPIMessage(input.sessionToken).plan(connection)
        enrollments <- ListEnrollmentsAPIMessage(input.sessionToken).plan(connection)
        waitlistEntries <- ListWaitlistEntriesAPIMessage(input.sessionToken).plan(connection)
        discussions <- ListDiscussionsAPIMessage.listDiscussions(connection, currentUser)
        reports <- ListPlatformReportsAPIMessage.listPlatformReports(connection, currentUser)
        notifications <- ListNotificationsAPIMessage.listNotifications(connection, currentUser)
        notificationSettings <- ListNotificationSettingsAPIMessage.listNotificationSettings(connection, currentUser)
        teacherTasks <- DashboardQueryTable.listTeacherTasks(connection, currentUser)
        recommendations = buildRecommendations(courses, enrollments, discussions, currentUser)
        learningPaths = buildLearningPaths(courses, enrollments, currentUser)
      yield DashboardBaseResponse(
        currentUser = currentUser,
        users = usersResponse.users,
        departments = departments,
        majors = majors,
        academicClasses = academicClasses,
        semesters = semesters,
        courses = courses,
        courseReviews = courseReviews,
        discussions = discussions,
        reports = reports,
        recommendations = recommendations,
        learningPaths = learningPaths,
        teacherTasks = teacherTasks,
        enrollments = enrollments,
        waitlistEntries = waitlistEntries,
        notifications = notifications,
        notificationSettings = notificationSettings
      )
  )

  private def buildRecommendations(
    courses: List[Course],
    enrollments: List[CourseEnrollment],
    discussions: List[DiscussionTopic],
    currentUser: UserProfile
  ): List[CourseRecommendation] =
    val enrolledCourseIds = enrollments.filter(_.userId == currentUser.id).map(_.courseId).toSet
    val discussionHeatByCourse = discussions.groupBy(_.courseId).view.mapValues(_.map(_.heatScore).sum).toMap
    val popular =
      courses
        .sortBy(course => -(course.enrolledCount * 2 + discussionHeatByCourse.getOrElse(course.id, 0) + (course.rating * 10).toInt))
        .take(4)
        .map(course =>
          CourseRecommendation(
            courseId = course.id,
            reason = s"Popular course with ${course.enrolledCount} enrollments and rating ${course.rating}",
            score = BigDecimal(course.enrolledCount + course.rating * 10).setScale(1, BigDecimal.RoundingMode.HALF_UP).toDouble,
            recommendationType = "popular"
          )
        )
    val learnedCategories = courses.filter(course => enrolledCourseIds.contains(course.id)).map(_.category).toSet
    val learningBased =
      courses
        .filter(course => !enrolledCourseIds.contains(course.id) && learnedCategories.contains(course.category))
        .take(4)
        .map(course =>
          CourseRecommendation(
            courseId = course.id,
            reason = s"Related to your learned ${course.category} courses",
            score = BigDecimal(course.rating * 20).setScale(1, BigDecimal.RoundingMode.HALF_UP).toDouble,
            recommendationType = "learning_record"
          )
        )
    val similar =
      courses
        .groupBy(_.category)
        .values
        .flatMap(_.sortBy(course => -course.rating).take(2))
        .toList
        .map(course =>
          CourseRecommendation(
            courseId = course.id,
            reason = s"Highly rated ${course.category} course",
            score = BigDecimal(course.rating * 18 + course.completionRate.toDouble / 10).setScale(1, BigDecimal.RoundingMode.HALF_UP).toDouble,
            recommendationType = "similar"
          )
        )
    (popular ++ learningBased ++ similar)
      .groupBy(_.courseId)
      .values
      .map(_.maxBy(_.score))
      .toList
      .sortBy(recommendation => -recommendation.score)
      .take(8)

  private def buildLearningPaths(
    courses: List[Course],
    enrollments: List[CourseEnrollment],
    currentUser: UserProfile
  ): List[LearningPathRecommendation] =
    val enrolledCourseIds = enrollments.filter(_.userId == currentUser.id).map(_.courseId).toSet
    courses
      .filterNot(course => enrolledCourseIds.contains(course.id))
      .groupBy(_.category)
      .toList
      .sortBy((category, groupedCourses) => (-groupedCourses.map(_.rating).sum, category))
      .take(4)
      .map { (category, groupedCourses) =>
        val pathCourses = groupedCourses.sortBy(course => -course.rating).take(3)
        LearningPathRecommendation(
          id = s"path-${category.toLowerCase.replaceAll("[^a-z0-9]+", "-")}",
          title = s"$category learning path",
          courseIds = pathCourses.map(_.id),
          reason = s"Combines ${pathCourses.size} courses by rating, enrollment, and progress",
          estimatedHours = pathCourses.map(course => math.max(course.lessonsCount, 1) * 2).sum
        )
      }

  given Decoder[GetDashboardBaseAPIMessage] = inputDecoder
  given Encoder[GetDashboardBaseAPIMessage] = deriveEncoder[GetDashboardBaseAPIMessage]
