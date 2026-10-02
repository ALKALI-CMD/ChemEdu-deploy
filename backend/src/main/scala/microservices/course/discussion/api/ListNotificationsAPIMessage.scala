// 文件说明：后端课程讨论接口实现，用于处理列表查询Notifications请求并返回类型安全响应。
package microservices.course.discussion.api

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
import microservices.auth.api.RequireSessionUserAPIMessage
import microservices.auth.objects.{UserProfile, UserRole}
import microservices.course.discussion.objects.*
import microservices.admin.tables.BusinessOpsTable
import microservices.course.catalog.api.ListCoursesForUserAPIMessage
import microservices.course.catalog.objects.{CourseAuditStatus}
import microservices.course.catalog.objects.apiTypes.{MessageResponse}
import microservices.course.discussion.tables.DiscussionTable
import microservices.course.learning.api.ListAssignmentsAPIMessage
import microservices.course.learning.objects.SubmissionStatus

import java.time.Instant
import system.api.{ConnectionAPIMessage, ConnectionApiMessageSchema}

import java.sql.Connection

final case class ListNotificationsAPIMessage(
  sessionToken: String
) extends ConnectionAPIMessage[List[NotificationItem]]:
  override def plan(connection: Connection): IO[List[NotificationItem]] =
    ListNotificationsAPIMessage.schema.execute(this, connection)

object ListNotificationsAPIMessage:
  val inputDecoder: Decoder[ListNotificationsAPIMessage] = deriveDecoder[ListNotificationsAPIMessage]
  val outputEncoder: Encoder[List[NotificationItem]] = deriveEncoder[List[NotificationItem]]
  val schema: ConnectionApiMessageSchema[ListNotificationsAPIMessage, List[NotificationItem]] = ConnectionApiMessageSchema(
    name = "ListNotificationsAPIMessage",
    inputDecoder = inputDecoder,
    outputEncoder = outputEncoder,
    execute = (input, connection) =>
      for
        currentUser <- RequireSessionUserAPIMessage(input.sessionToken).plan(connection)
        notifications <- listNotifications(connection, currentUser)
      yield notifications
  )

  def listNotifications(connection: Connection, currentUser: UserProfile): IO[List[NotificationItem]] =
    ListNotificationsAPIMessage.listNotifications(ListDiscussionsAPIMessage, connection, currentUser)

  given Decoder[ListNotificationsAPIMessage] = inputDecoder
  given Encoder[ListNotificationsAPIMessage] = deriveEncoder[ListNotificationsAPIMessage]

  private val defaultCategories = List("message", "deadline", "audit", "grading", "announcement", "mention", "system")

  private[discussion] def listNotificationSettings(
    table: microservices.course.discussion.api.ListDiscussionsAPIMessage.type,
    connection: Connection,
    currentUser: UserProfile
  ): IO[List[NotificationSetting]] =
    for
      existing <- DiscussionTable.selectPreparedList(
        connection,
        DiscussionTable.listNotificationSettingsSql
      )(_.setString(1, currentUser.id))(resultSet =>
        NotificationSetting(
          userId = resultSet.getString("user_id"),
          category = resultSet.getString("category"),
          enabled = resultSet.getBoolean("enabled")
        )
      )
      existingByCategory = existing.map(item => item.category -> item).toMap
    yield defaultCategories.map(category => existingByCategory.getOrElse(category, NotificationSetting(currentUser.id, category, enabled = true)))

  private[discussion] def listNotifications(
    table: microservices.course.discussion.api.ListDiscussionsAPIMessage.type,
    connection: Connection,
    currentUser: UserProfile
  ): IO[List[NotificationItem]] =
    for
      settings <- listNotificationSettings(table, connection, currentUser)
      disabledCategories = settings.filterNot(_.enabled).map(_.category).toSet
      persisted <- listPersistedNotifications(table, connection, currentUser)
      generated <- buildGeneratedNotifications(table, connection, currentUser)
    yield (persisted ++ generated)
      .filterNot(item => disabledCategories.contains(item.category))
      .sortBy(item => -parseTimestamp(item.createdAt))

  private def listPersistedNotifications(
    table: microservices.course.discussion.api.ListDiscussionsAPIMessage.type,
    connection: Connection,
    currentUser: UserProfile
  ): IO[List[NotificationItem]] =
    DiscussionTable.selectPreparedList(
      connection,
      DiscussionTable.listPersistedNotificationsSql
    )(_.setString(1, currentUser.id))(resultSet =>
      NotificationItem(
        id = resultSet.getString("id"),
        userId = resultSet.getString("user_id"),
        courseId = Option(resultSet.getString("course_id")).filter(_.nonEmpty),
        category = resultSet.getString("category"),
        title = resultSet.getString("title"),
        content = resultSet.getString("content"),
        read = resultSet.getBoolean("read"),
        createdAt = resultSet.getString("created_at"),
        actionUrl = Option(resultSet.getString("action_url")).filter(_.nonEmpty)
      )
    )

  private def buildGeneratedNotifications(
    table: microservices.course.discussion.api.ListDiscussionsAPIMessage.type,
    connection: Connection,
    currentUser: UserProfile
  ): IO[List[NotificationItem]] =
    for
      courses <- ListCoursesForUserAPIMessage(currentUser).plan(connection)
      assignments <- ListAssignmentsAPIMessage(currentUser).plan(connection)
      messages <- BusinessOpsTable.listMessages(connection, currentUser)
      discussions <- ListDiscussionsAPIMessage.listDiscussions(connection, currentUser)
    yield
      val messageNotifications = messages.filter(message => message.to == currentUser.name && !message.read).map(message =>
        NotificationItem(
          id = s"message-${message.id}",
          userId = currentUser.id,
          courseId = message.courseId,
          category = message.category,
                    title = s"Message from ${message.from}",
          content = message.content,
          read = false,
          createdAt = message.sentAt,
          actionUrl = Some("/notifications")
        )
      )

      val deadlineNotifications =
        if currentUser.role == UserRole.Student then
          assignments.filter(_.submissionStatus == SubmissionStatus.Pending).take(12).map(assignment =>
            NotificationItem(
              id = s"deadline-${assignment.id}",
              userId = currentUser.id,
              courseId = Some(assignment.courseId),
              category = "deadline",
              title = s"Assignment submitted: ${assignment.title}",
              content = s"闂備浇顫夐幆灞剧濠靛鏁嗘繛鎴欏灩缁秹鏌涢锝嗙闁挎稓鍠栭弻?{assignment.deadline}",
              read = false,
              createdAt = Instant.now().toString,
              actionUrl = Some(s"/student/assignments?assignment=${assignment.id}")
            )
          )
        else Nil

      val gradingNotifications =
        currentUser.role match
          case UserRole.Student =>
            assignments.filter(_.submissionStatus == SubmissionStatus.Reviewed).flatMap { assignment =>
              assignment.reviewedAt.map(reviewedAt =>
                NotificationItem(
                  id = s"graded-${assignment.id}",
                  userId = currentUser.id,
                  courseId = Some(assignment.courseId),
                  category = "grading",
                  title = s"Assignment reviewed: ${assignment.title}",
                  content = assignment.feedback.getOrElse("Teacher review completed."),
                  read = false,
                  createdAt = reviewedAt,
                  actionUrl = Some(s"/student/assignments?assignment=${assignment.id}")
                )
              )
            }
          case UserRole.Teacher | UserRole.Assistant | UserRole.Analyst | UserRole.Admin =>
            assignments.filter(_.submissionStatus == SubmissionStatus.Submitted).take(12).map(assignment =>
              NotificationItem(
                id = s"review-${assignment.id}",
                userId = currentUser.id,
                courseId = Some(assignment.courseId),
                category = "grading",
                title = s"Assignment reviewed: ${assignment.title}",
                content = "Student submission needs review.",
                read = false,
                createdAt = assignment.submittedAt.getOrElse(Instant.now().toString),
                actionUrl = Some("/teacher/reviews")
              )
            )

      val auditNotifications =
        if currentUser.role == UserRole.Admin then
          courses.filter(_.auditStatus == CourseAuditStatus.Pending).map(course =>
            NotificationItem(
              id = s"audit-${course.id}",
              userId = currentUser.id,
              courseId = Some(course.id),
              category = "audit",
              title = s"Course audit pending: ${course.title}",
              content = course.auditComment.getOrElse("Course is waiting for admin audit."),
              read = false,
              createdAt = course.auditedAt.getOrElse(Instant.now().toString),
              actionUrl = Some("/admin/audits")
            )
          )
        else Nil

      val mentionNotifications = discussions.filter(_.mentionUserIds.contains(currentUser.id)).map(topic =>
        NotificationItem(
          id = s"mention-${topic.id}",
          userId = currentUser.id,
          courseId = Some(topic.courseId),
          category = "mention",
          title = s"闂佽崵濮抽梽宥夊礉韫囨侗鏁婇柟瀵稿仧閳绘梹銇勯幘璺烘瀻缂佹彃缍婇弻娑㈠箳濡ゅ﹥娈ョ紓浣靛妷閸撴繈骞忛崨瀛樺亼闁告侗鍨抽悰?{topic.title}",
          content = topic.content,
          read = false,
          createdAt = topic.lastReplyAt,
          actionUrl = Some(s"/courses/${topic.courseId}?tab=discussion")
        )
      )

      val announcement = NotificationItem(
        id = "system-announcement-current",
        userId = "*",
        courseId = None,
        category = "announcement",
        title = "System announcement",
        content = "Student submission needs review.",
        read = false,
        createdAt = "2026-05-24T00:00:00Z",
        actionUrl = Some("/notifications")
      )

      messageNotifications ++ deadlineNotifications ++ gradingNotifications ++ auditNotifications ++ mentionNotifications ++ List(announcement)

  private[discussion] def markNotificationReadForUser(
    table: microservices.course.discussion.api.ListDiscussionsAPIMessage.type,
    connection: Connection,
    currentUser: UserProfile,
    request: MarkNotificationReadData
  ): IO[MessageResponse] =
    request.notificationId match
      case Some(notificationId) if notificationId.startsWith("message-") =>
        val messageId = notificationId.stripPrefix("message-")
        DiscussionTable.updateMessageRead(connection, messageId, currentUser.name, request.read).as(MessageResponse("Notification read state updated."))
      case Some(notificationId) =>
        DiscussionTable.updateNotificationRead(connection, notificationId, currentUser.id, request.read).as(MessageResponse("Notification read state updated."))
      case None =>
        for
          _ <- DiscussionTable.updateAllMessagesRead(connection, currentUser.name, request.read)
          _ <- DiscussionTable.updateAllNotificationsRead(connection, currentUser.id, request.read)
        yield MessageResponse("All notifications updated.")

  private[discussion] def updateNotificationSettingForUser(
    table: microservices.course.discussion.api.ListDiscussionsAPIMessage.type,
    connection: Connection,
    currentUser: UserProfile,
    request: UpdateNotificationSettingData
  ): IO[MessageResponse] =
    val category = request.category.trim.toLowerCase
    for
      _ <-
        if defaultCategories.contains(category) then IO.unit
        else IO.raiseError(new IllegalArgumentException("Unsupported notification category."))
      _ <- DiscussionTable.upsertNotificationSetting(connection, currentUser.id, category, request.enabled)
    yield MessageResponse("Notification setting updated.")

  private def parseTimestamp(value: String): Long =
    try Instant.parse(value).toEpochMilli
    catch
      case _: Throwable => 0L


