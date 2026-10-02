// 文件说明：后端课程讨论接口实现，用于处理列表查询Discussions请求并返回类型安全响应。
package microservices.course.discussion.api

import cats.effect.IO
import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}
import microservices.auth.api.RequireSessionUserAPIMessage
import microservices.auth.objects.{UserProfile, UserRole}
import microservices.course.discussion.objects.*
import microservices.course.catalog.api.AuthorizeCourseParticipantAPIMessage
import microservices.course.discussion.tables.DiscussionTable

import java.sql.Connection
import java.time.Instant
import java.util.UUID
import system.api.{ConnectionAPIMessage, ConnectionApiMessageSchema}


final case class ListDiscussionsAPIMessage(
  sessionToken: String
) extends ConnectionAPIMessage[List[DiscussionTopic]]:
  override def plan(connection: Connection): IO[List[DiscussionTopic]] =
    ListDiscussionsAPIMessage.schema.execute(this, connection)

object ListDiscussionsAPIMessage:
  private val sensitiveTerms = List("cheating", "proxy exam", "abuse", "violence", "spam")

  val inputDecoder: Decoder[ListDiscussionsAPIMessage] = deriveDecoder[ListDiscussionsAPIMessage]
  val outputEncoder: Encoder[List[DiscussionTopic]] = deriveEncoder[List[DiscussionTopic]]
  val schema: ConnectionApiMessageSchema[ListDiscussionsAPIMessage, List[DiscussionTopic]] = ConnectionApiMessageSchema(
    name = "ListDiscussionsAPIMessage",
    inputDecoder = inputDecoder,
    outputEncoder = outputEncoder,
    execute = (input, connection) =>
      for
        currentUser <- RequireSessionUserAPIMessage(input.sessionToken).plan(connection)
        discussions <- listDiscussions(connection, currentUser)
      yield discussions
  )

  def listDiscussions(connection: Connection, currentUser: UserProfile): IO[List[DiscussionTopic]] =
    for
      rows <- currentUser.role match
        case UserRole.Student =>
          DiscussionTable.selectPreparedList(connection, DiscussionTable.listStudentDiscussionsSql) { statement =>
            statement.setString(1, currentUser.id)
          }(DiscussionTable.readDiscussionRow)
        case UserRole.Teacher | UserRole.Assistant =>
          DiscussionTable.selectPreparedList(connection, DiscussionTable.listTeachingDiscussionsSql) { statement =>
            statement.setString(1, currentUser.id)
            statement.setString(2, s"%${currentUser.id}%")
          }(DiscussionTable.readDiscussionRow)
        case UserRole.Admin | UserRole.Analyst =>
          DiscussionTable.selectList(connection, DiscussionTable.listAllDiscussionsSql)(DiscussionTable.readDiscussionRow)
      reactionStats <- ListDiscussionsAPIMessage.listDiscussionReactions(ListDiscussionsAPIMessage, connection, rows.map(_.id), currentUser)
      rowsWithReactions = rows.map(row => ListDiscussionsAPIMessage.applyReactionStats(row, reactionStats))
      discussions <- rowsWithReactions.foldLeft(IO.pure(List.empty[DiscussionTopic])) { (acc, row) =>
        acc.flatMap(items => ListDiscussionsAPIMessage.buildDiscussionForViewer(ListDiscussionsAPIMessage, connection, row, currentUser).map(_.toList ::: items))
      }
    yield ListDiscussionsAPIMessage.sortDiscussions(ListDiscussionsAPIMessage, discussions)

  given Decoder[ListDiscussionsAPIMessage] = inputDecoder
  given Encoder[ListDiscussionsAPIMessage] = deriveEncoder[ListDiscussionsAPIMessage]

  private[discussion] def authorizeDiscussionParticipant(
    table: microservices.course.discussion.api.ListDiscussionsAPIMessage.type,
    connection: Connection,
    user: UserProfile,
    courseId: String
  ): IO[Unit] =
    table.authorizeDiscussionParticipant(connection, user, courseId)

  private[discussion] def findDiscussionById(
    table: microservices.course.discussion.api.ListDiscussionsAPIMessage.type,
    connection: Connection,
    topicId: String
  ): IO[Option[DiscussionTopic]] =
    DiscussionTable.findDiscussionRow(connection, topicId).flatMap {
      case Some(row) =>
        for
          reactions <- listDiscussionReactions(table, connection, List(row.id), UserProfile("", "", "", UserRole.Admin, None, None, None, None, None, None, None, None, None, "", None, None))
          replies <- listDiscussionReplies(table, connection, row.id)
        yield Some(toDiscussionTopic(applyReactionStats(row, reactions), replies))
      case None => IO.pure(None)
    }

  private[discussion] def listDiscussionReplies(
    table: microservices.course.discussion.api.ListDiscussionsAPIMessage.type,
    connection: Connection,
    topicId: String
  ): IO[List[DiscussionReply]] =
    DiscussionTable.listDiscussionReplies(connection, topicId)

  private[discussion] def buildDiscussionForViewer(
    table: microservices.course.discussion.api.ListDiscussionsAPIMessage.type,
    connection: Connection,
    row: DiscussionTopicRow,
    currentUser: UserProfile
  ): IO[Option[DiscussionTopic]] =
    if !canViewDiscussionTopic(row, currentUser) then IO.pure(None)
    else
      listDiscussionReplies(table, connection, row.id).map { replies =>
        val visibleReplies = replies.filter(reply => canViewDiscussionReply(reply, currentUser))
        Some(toDiscussionTopic(row, visibleReplies))
      }

  private[discussion] def sortDiscussions(
    table: microservices.course.discussion.api.ListDiscussionsAPIMessage.type,
    discussions: List[DiscussionTopic]
  ): List[DiscussionTopic] =
    discussions.sortBy(topic =>
      (
        if topic.pinState == DiscussionPinState.Pinned then 0 else 1,
        -parseDiscussionTimestamp(topic.lastReplyAt)
      )
    )

  private[discussion] def listDiscussionReactions(
    table: microservices.course.discussion.api.ListDiscussionsAPIMessage.type,
    connection: Connection,
    topicIds: List[String],
    currentUser: UserProfile
  ): IO[Map[String, DiscussionReactionStats]] =
    DiscussionTable.listDiscussionReactionStats(connection, topicIds, currentUser.id).map { rows =>
      rows.groupBy(_._1).view.mapValues { topicRows =>
        def count(kind: String) = topicRows.find(_._2 == kind).map(_._3).getOrElse(0)
        def mine(kind: String) = topicRows.find(_._2 == kind).exists(_._4)
        DiscussionReactionStats(
          likeCount = count("like"),
          favoriteCount = count("favorite"),
          reportCount = count("report"),
          likedByCurrentUser = mine("like"),
          favoritedByCurrentUser = mine("favorite"),
          reportedByCurrentUser = mine("report")
        )
      }.toMap
    }

  private[discussion] def applyReactionStats(
    row: DiscussionTopicRow,
    statsByTopicId: Map[String, DiscussionReactionStats]
  ): DiscussionTopicRow =
    val stats = statsByTopicId.getOrElse(row.id, DiscussionReactionStats(0, 0, 0, false, false, false))
    row.copy(
      likeCount = stats.likeCount,
      favoriteCount = stats.favoriteCount,
      reportCount = stats.reportCount,
      likedByCurrentUser = stats.likedByCurrentUser,
      favoritedByCurrentUser = stats.favoritedByCurrentUser,
      reportedByCurrentUser = stats.reportedByCurrentUser
    )

  private[discussion] def toDiscussionTopic(row: DiscussionTopicRow, replies: List[DiscussionReply]): DiscussionTopic =
    val teacherHighlights = buildTeacherHighlights(row, replies)
    DiscussionTopic(
      id = row.id,
      courseId = row.courseId,
      authorId = row.authorId,
      title = row.title,
      author = row.author,
      authorRole = row.authorRole,
      content = row.content,
      replyCount = replies.count(_.visibility == DiscussionVisibility.Visible),
      createdAt = row.createdAt,
      updatedAt = row.updatedAt,
      lastReplyAt = row.lastReplyAt,
      lessonId = row.lessonId,
      lessonTitle = row.lessonTitle,
      resolved = row.resolved,
      resolvedBy = row.resolvedBy,
      resolvedAt = row.resolvedAt,
      visibility = row.visibility,
      threadState = row.threadState,
      pinState = row.pinState,
      moderatedBy = row.moderatedBy,
      moderatedAt = row.moderatedAt,
      moderationNote = row.moderationNote,
      teacherHighlights = teacherHighlights,
      heatScore = computeHeatScore(row, replies, teacherHighlights),
      likeCount = row.likeCount,
      favoriteCount = row.favoriteCount,
      reportCount = row.reportCount,
      mentionUserIds = row.mentionUserIds,
      sensitiveHitCount = row.sensitiveHitCount,
      likedByCurrentUser = row.likedByCurrentUser,
      favoritedByCurrentUser = row.favoritedByCurrentUser,
      reportedByCurrentUser = row.reportedByCurrentUser,
      replies = replies
    )

  private[discussion] def buildTeacherHighlights(
    row: DiscussionTopicRow,
    replies: List[DiscussionReply]
  ): List[DiscussionTeacherHighlight] =
    val topicHighlight =
      Option.when(isInstructorRole(row.authorRole))(
        DiscussionTeacherHighlight(
          id = s"${row.id}:topic",
          author = row.author,
          authorRole = row.authorRole,
          content = row.content,
          createdAt = row.createdAt,
          sourceType = "topic"
        )
      )
    val moderationHighlight =
      for
        moderatedBy <- row.moderatedBy
        note <- row.moderationNote
        moderatedAt <- row.moderatedAt.orElse(row.updatedAt)
      yield DiscussionTeacherHighlight(
        id = s"${row.id}:moderation",
        author = moderatedBy,
        authorRole = UserRole.Teacher,
        content = note,
        createdAt = moderatedAt,
        sourceType = "moderation"
      )
    val replyHighlights = replies.collect {
      case reply if isInstructorRole(reply.authorRole) =>
        DiscussionTeacherHighlight(
          id = reply.id,
          author = reply.author,
          authorRole = reply.authorRole,
          content = reply.content,
          createdAt = reply.createdAt,
          sourceType = "reply"
        )
    }
    (topicHighlight.toList ++ moderationHighlight.toList ++ replyHighlights).sortBy(_.createdAt)

  private[discussion] def computeHeatScore(
    row: DiscussionTopicRow,
    replies: List[DiscussionReply],
    teacherHighlights: List[DiscussionTeacherHighlight]
  ): Int =
    val recencyBonus = math.max(0, 72 - ((System.currentTimeMillis() - parseDiscussionTimestamp(row.lastReplyAt)) / (1000L * 60L * 60L)).toInt)
    replies.size * 8 + teacherHighlights.size * 10 + row.likeCount * 4 + row.favoriteCount * 6 + recencyBonus + (if row.resolved then 0 else 12) - row.reportCount * 3

  private[discussion] def extractMentionNames(content: String): List[String] =
    "@([\\p{L}\\p{N}_\\-\\u4e00-\\u9fa5]+)".r.findAllMatchIn(content).map(_.group(1)).toList.distinct

  private[discussion] def countSensitiveHits(content: String): Int =
    val normalized = content.toLowerCase
    sensitiveTerms.count(term => normalized.contains(term.toLowerCase))

  private[discussion] def isInstructorRole(role: UserRole): Boolean =
    role == UserRole.Teacher || role == UserRole.Admin || role == UserRole.Assistant

  private[discussion] def canViewDiscussionTopic(row: DiscussionTopicRow, viewer: UserProfile): Boolean =
    row.visibility == DiscussionVisibility.Visible || row.authorId == viewer.id || isDiscussionModeratorByRole(viewer)

  private[discussion] def canViewDiscussionReply(row: DiscussionReply, viewer: UserProfile): Boolean =
    row.visibility == DiscussionVisibility.Visible || row.authorId == viewer.id || isDiscussionModeratorByRole(viewer)

  private[discussion] def isDiscussionModeratorByRole(user: UserProfile): Boolean =
    user.role == UserRole.Admin || user.role == UserRole.Teacher

  private[discussion] def resolveMentionUserIds(
    table: microservices.course.discussion.api.ListDiscussionsAPIMessage.type,
    connection: Connection,
    content: String
  ): IO[List[String]] =
    val names = extractMentionNames(content)
    names.foldLeft(IO.pure(List.empty[String])) { (acc, name) =>
      for
        current <- acc
        userId <- DiscussionTable.findUserIdByName(connection, name)
      yield userId.map(current :+ _).getOrElse(current)
    }.map(_.distinct)

  private[discussion] def mergeTopicModerationSignals(
    table: microservices.course.discussion.api.ListDiscussionsAPIMessage.type,
    connection: Connection,
    topicId: String,
    mentionUserIds: List[String],
    sensitiveHitCount: Int
  ): IO[Unit] =
    DiscussionTable.mergeTopicModerationSignals(connection, topicId, mentionUserIds, sensitiveHitCount)

  private[discussion] def parseDiscussionTimestamp(value: String): Long =
    try Instant.parse(value).toEpochMilli
    catch
      case _: Throwable => 0L

  private[discussion] def ensureDiscussionReplyAllowed(
    table: microservices.course.discussion.api.ListDiscussionsAPIMessage.type,
    connection: Connection,
    user: UserProfile,
    topic: DiscussionTopic
  ): IO[Unit] =
    for
      moderator <- canModerateDiscussion(table, connection, user, topic.courseId)
      _ <-
        if topic.visibility == DiscussionVisibility.Hidden && !moderator && topic.authorId != user.id then
          IO.raiseError(new IllegalArgumentException("This discussion is hidden and cannot receive new replies."))
        else IO.unit
      _ <-
        if topic.threadState == DiscussionThreadState.Locked && !moderator then
          IO.raiseError(new IllegalArgumentException("This discussion is locked."))
        else IO.unit
    yield ()

  private[discussion] def authorizeDiscussionAuthorOrModerator(
    table: microservices.course.discussion.api.ListDiscussionsAPIMessage.type,
    connection: Connection,
    actor: UserProfile,
    courseId: String,
    authorId: String
  ): IO[Unit] =
    if actor.id == authorId then IO.unit
    else requireDiscussionModerator(table, connection, actor, courseId)

  private[discussion] def requireDiscussionModerator(
    table: microservices.course.discussion.api.ListDiscussionsAPIMessage.type,
    connection: Connection,
    actor: UserProfile,
    courseId: String
  ): IO[Unit] =
    canModerateDiscussion(table, connection, actor, courseId).flatMap { allowed =>
      if allowed then IO.unit
      else IO.raiseError(new IllegalArgumentException("Only the course teacher or an admin can moderate this discussion."))
    }

  private[discussion] def canModerateDiscussion(
    table: microservices.course.discussion.api.ListDiscussionsAPIMessage.type,
    connection: Connection,
    actor: UserProfile,
    courseId: String
  ): IO[Boolean] =
    actor.role match
      case UserRole.Admin => IO.pure(true)
      case UserRole.Teacher =>
        DiscussionTable.findCourseTeacherId(connection, courseId).map(_.contains(actor.id))
      case _ => IO.pure(false)

  private[discussion] def requireDiscussionTopic(
    table: microservices.course.discussion.api.ListDiscussionsAPIMessage.type,
    connection: Connection,
    topicId: String
  ): IO[DiscussionTopic] =
    findDiscussionById(table, connection, topicId).flatMap(topic =>
      IO.fromOption(topic)(new IllegalArgumentException("Discussion topic does not exist."))
    )

  private[discussion] def validateDiscussionLesson(
    table: microservices.course.discussion.api.ListDiscussionsAPIMessage.type,
    connection: Connection,
    courseId: String,
    lessonId: Option[String]
  ): IO[Option[String]] =
    lessonId match
      case None => IO.pure(None)
      case Some(value) =>
        DiscussionTable.validateDiscussionLesson(connection, courseId, value).flatMap {
          case Some(validLessonId) => IO.pure(Some(validLessonId))
          case None => IO.raiseError(new IllegalArgumentException("The selected lesson does not belong to this course."))
        }

  private[discussion] def requireDiscussionReply(
    table: microservices.course.discussion.api.ListDiscussionsAPIMessage.type,
    connection: Connection,
    replyId: String
  ): IO[DiscussionReplyRow] =
    findDiscussionReplyById(table, connection, replyId).flatMap(reply =>
      IO.fromOption(reply)(new IllegalArgumentException("Discussion reply does not exist."))
    )

  private[discussion] def findDiscussionReplyById(
    table: microservices.course.discussion.api.ListDiscussionsAPIMessage.type,
    connection: Connection,
    replyId: String
  ): IO[Option[DiscussionReplyRow]] =
    DiscussionTable.findDiscussionReplyRow(connection, replyId)

  private[discussion] def refreshDiscussionReplyStats(
    table: microservices.course.discussion.api.ListDiscussionsAPIMessage.type,
    connection: Connection,
    topicId: String
  ): IO[Unit] =
    DiscussionTable.refreshDiscussionReplyStats(connection, topicId)

  private[discussion] def authorizeDiscussionParticipant(connection: Connection, user: UserProfile, courseId: String): IO[Unit] =
    AuthorizeCourseParticipantAPIMessage(user, courseId).plan(connection).void

  private[discussion] def hasOpenReport(
    table: microservices.course.discussion.api.ListDiscussionsAPIMessage.type,
    connection: Connection,
    reporterId: String,
    targetType: String,
    targetId: String
  ): IO[Boolean] =
    DiscussionTable.hasOpenPlatformReport(connection, reporterId, targetType, targetId)

  private[discussion] def requirePlatformReport(
    table: microservices.course.discussion.api.ListDiscussionsAPIMessage.type,
    connection: Connection,
    reportId: String
  ): IO[PlatformReport] =
    DiscussionTable.findPlatformReport(connection, reportId).flatMap(report =>
      IO.fromOption(report)(new IllegalArgumentException("Report not found."))
    )

  private[discussion] def isBanAppeal(report: PlatformReport): Boolean =
    report.targetType == "user" && (
      report.reason.toLowerCase.contains("appeal") ||
        report.targetLabel.toLowerCase.contains("appeal")
    )

  private[discussion] def isUserReport(report: PlatformReport): Boolean =
    report.targetType == "user" && !isBanAppeal(report)

  private[discussion] def unbanAppealUser(
    table: microservices.course.discussion.api.ListDiscussionsAPIMessage.type,
    connection: Connection,
    report: PlatformReport
  ): IO[Unit] =
    val candidateUserIds = List(report.reporterId, report.targetId).map(_.trim).filter(_.nonEmpty).distinct
    candidateUserIds.foldLeft(IO.unit) { (effect, userId) =>
      effect >> setUserBannedIfExists(table, connection, userId, banned = false).void
    }

  private[discussion] def setUserBanned(
    table: microservices.course.discussion.api.ListDiscussionsAPIMessage.type,
    connection: Connection,
    userId: String,
    banned: Boolean
  ): IO[Unit] =
    setUserBannedIfExists(table, connection, userId, banned).flatMap(updated =>
      if updated then IO.unit else IO.raiseError(new IllegalArgumentException("Target user does not exist."))
    )

  private[discussion] def setUserBannedIfExists(
    table: microservices.course.discussion.api.ListDiscussionsAPIMessage.type,
    connection: Connection,
    userId: String,
    banned: Boolean
  ): IO[Boolean] =
    for
      currentPermissions <- DiscussionTable.findUserPermissions(connection, userId)
      updated <- currentPermissions match
        case Some(permissions) =>
          val withoutBan = permissions.filterNot(_ == "user:banned")
          val nextPermissions = if banned then "user:banned" :: withoutBan else withoutBan
          DiscussionTable.updateUserPermissions(connection, userId, nextPermissions)
        case None => IO.pure(false)
    yield updated

  private[discussion] def ensureNonEmpty(value: String, message: String): IO[Unit] =
    if value.nonEmpty then IO.unit else IO.raiseError(new IllegalArgumentException(message))

  private[discussion] def generateId(prefix: String): String =
    s"$prefix-${UUID.randomUUID().toString.take(8)}"

