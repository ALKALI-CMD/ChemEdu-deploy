package microservices.course.discussion.tables

import cats.effect.IO
import microservices.auth.objects.UserRole
import microservices.course.discussion.objects.*

import java.sql.{Connection, PreparedStatement, ResultSet, Types}
import java.time.Instant
import scala.collection.mutable

private[discussion] object DiscussionTable:

  val schemaStatements: List[String] = List(
    """
      |create table if not exists edu_discussions (
      |  id varchar(64) primary key,
      |  course_id varchar(64) not null references edu_courses(id) on delete cascade,
      |  title varchar(200) not null,
      |  author_id varchar(64) not null default '',
      |  author varchar(120) not null,
      |  content text not null default '',
      |  reply_count integer not null,
      |  created_at varchar(80) not null default now()::text,
      |  updated_at varchar(80),
      |  last_reply_at varchar(80) not null,
      |  lesson_id varchar(64) references edu_course_lessons(id) on delete set null,
      |  resolved boolean not null default false,
      |  resolved_by varchar(120),
      |  resolved_at varchar(80),
      |  visibility varchar(32) not null default 'visible',
      |  thread_state varchar(32) not null default 'open',
      |  pin_state varchar(32) not null default 'normal',
      |  moderated_by varchar(120),
      |  moderated_at varchar(80),
      |  moderation_note text
      |);
      |""".stripMargin,
    """
      |create table if not exists edu_discussion_replies (
      |  id varchar(64) primary key,
      |  topic_id varchar(64) not null references edu_discussions(id) on delete cascade,
      |  author_id varchar(64) not null default '',
      |  author varchar(120) not null,
      |  content text not null,
      |  created_at varchar(80) not null,
      |  updated_at varchar(80),
      |  visibility varchar(32) not null default 'visible',
      |  moderated_by varchar(120),
      |  moderated_at varchar(80),
      |  moderation_note text
      |);
      |""".stripMargin
    ,
    """
      |create table if not exists edu_discussion_reactions (
      |  user_id varchar(64) not null references edu_users(id) on delete cascade,
      |  topic_id varchar(64) not null references edu_discussions(id) on delete cascade,
      |  reaction_type varchar(32) not null,
      |  created_at varchar(80) not null,
      |  primary key (user_id, topic_id, reaction_type)
      |);
      |""".stripMargin
    ,
    """
      |create table if not exists edu_platform_reports (
      |  id varchar(64) primary key,
      |  reporter_id varchar(64) not null references edu_users(id) on delete cascade,
      |  reporter_name varchar(120) not null,
      |  target_type varchar(32) not null,
      |  target_id varchar(64) not null,
      |  target_label varchar(240) not null,
      |  reason varchar(80) not null,
      |  detail text,
      |  status varchar(32) not null default 'open',
      |  created_at varchar(80) not null,
      |  resolved_by varchar(120),
      |  resolved_at varchar(80),
      |  resolution_note text
      |);
      |""".stripMargin,
    "alter table edu_discussions add column if not exists content text not null default ''",
    "alter table edu_discussions add column if not exists author_id varchar(64) not null default ''",
    "alter table edu_discussions add column if not exists created_at varchar(80) not null default now()::text",
    "alter table edu_discussions add column if not exists updated_at varchar(80)",
    "alter table edu_discussions add column if not exists lesson_id varchar(64) references edu_course_lessons(id) on delete set null",
    "alter table edu_discussions add column if not exists resolved boolean not null default false",
    "alter table edu_discussions add column if not exists resolved_by varchar(120)",
    "alter table edu_discussions add column if not exists resolved_at varchar(80)",
    "alter table edu_discussions add column if not exists visibility varchar(32) not null default 'visible'",
    "alter table edu_discussions add column if not exists thread_state varchar(32) not null default 'open'",
    "alter table edu_discussions add column if not exists pin_state varchar(32) not null default 'normal'",
    "alter table edu_discussions add column if not exists moderated_by varchar(120)",
    "alter table edu_discussions add column if not exists moderated_at varchar(80)",
    "alter table edu_discussions add column if not exists moderation_note text",
    "alter table edu_discussions add column if not exists mention_user_ids text not null default ''",
    "alter table edu_discussions add column if not exists sensitive_hit_count integer not null default 0",
    "alter table edu_discussion_replies add column if not exists author_id varchar(64) not null default ''",
    "alter table edu_discussion_replies add column if not exists updated_at varchar(80)",
    "alter table edu_discussion_replies add column if not exists visibility varchar(32) not null default 'visible'",
    "alter table edu_discussion_replies add column if not exists moderated_by varchar(120)",
    "alter table edu_discussion_replies add column if not exists moderated_at varchar(80)",
    "alter table edu_discussion_replies add column if not exists moderation_note text",
    "alter table edu_platform_reports add column if not exists target_label varchar(240) not null default ''",
    "alter table edu_platform_reports add column if not exists resolution_note text",
    """
      |update edu_discussions d
      |set author_id = u.id
      |from edu_users u
      |where d.author_id = '' and d.author = u.name
      |""".stripMargin,
    """
      |update edu_discussion_replies r
      |set author_id = u.id
      |from edu_users u
      |where r.author_id = '' and r.author = u.name
      |""".stripMargin
  )

  val createPlatformReportSql: String =
    """
      |insert into edu_platform_reports (
      |  id, reporter_id, reporter_name, target_type, target_id, target_label, reason, detail, status, created_at
      |) values (?, ?, ?, ?, ?, ?, ?, ?, 'open', now()::text)
      |""".stripMargin

  val resolvePlatformReportSql: String =
    """
      |update edu_platform_reports
      |set status = ?, resolved_by = ?, resolved_at = now()::text, resolution_note = ?
      |where id = ?
      |""".stripMargin

  val findUserPermissionsSql: String =
    "select permissions from edu_users where id = ?"

  val updateUserPermissionsSql: String =
    "update edu_users set permissions = ? where id = ?"

  val listAllPlatformReportsSql: String =
    """
      |select id, reporter_id, reporter_name, target_type, target_id, target_label, reason, detail, status,
      |created_at, resolved_by, resolved_at, resolution_note
      |from edu_platform_reports
      |order by created_at desc
      |""".stripMargin

  val listReporterPlatformReportsSql: String =
    """
      |select id, reporter_id, reporter_name, target_type, target_id, target_label, reason, detail, status,
      |created_at, resolved_by, resolved_at, resolution_note
      |from edu_platform_reports
      |where reporter_id = ?
      |order by created_at desc
      |""".stripMargin

  val hasOpenPlatformReportSql: String =
    """
      |select 1 from edu_platform_reports
      |where reporter_id = ? and target_type = ? and target_id = ? and status in ('open', 'reviewing')
      |limit 1
      |""".stripMargin

  val findPlatformReportSql: String =
    """
      |select id, reporter_id, reporter_name, target_type, target_id, target_label, reason, detail, status,
      |created_at, resolved_by, resolved_at, resolution_note
      |from edu_platform_reports
      |where id = ?
      |""".stripMargin

  val listStudentDiscussionsSql: String =
    """
      |select d.id, d.course_id, d.title, d.author_id, d.author, coalesce(u.role, 'student') as author_role, d.content, d.reply_count,
      |d.created_at, d.updated_at, d.last_reply_at, d.lesson_id, l.title as lesson_title, d.resolved, d.resolved_by, d.resolved_at, d.visibility, d.thread_state, d.pin_state,
      |d.moderated_by, d.moderated_at, d.moderation_note, d.mention_user_ids, d.sensitive_hit_count,
      |0 as like_count, 0 as favorite_count, 0 as report_count,
      |false as liked_by_current_user, false as favorited_by_current_user, false as reported_by_current_user
      |from edu_discussions d
      |join edu_enrollments e on e.course_id = d.course_id
      |left join edu_users u on u.id = d.author_id
      |left join edu_course_lessons l on l.id = d.lesson_id
      |where e.user_id = ? and e.status = 'enrolled'
      |""".stripMargin

  val listTeachingDiscussionsSql: String =
    """
      |select d.id, d.course_id, d.title, d.author_id, d.author, coalesce(u.role, 'student') as author_role, d.content, d.reply_count,
      |d.created_at, d.updated_at, d.last_reply_at, d.lesson_id, l.title as lesson_title, d.resolved, d.resolved_by, d.resolved_at, d.visibility, d.thread_state, d.pin_state,
      |d.moderated_by, d.moderated_at, d.moderation_note, d.mention_user_ids, d.sensitive_hit_count,
      |0 as like_count, 0 as favorite_count, 0 as report_count,
      |false as liked_by_current_user, false as favorited_by_current_user, false as reported_by_current_user
      |from edu_discussions d
      |join edu_courses c on c.id = d.course_id
      |left join edu_users u on u.id = d.author_id
      |left join edu_course_lessons l on l.id = d.lesson_id
      |where c.teacher_id = ? or c.assistants like ?
      |""".stripMargin

  val listAllDiscussionsSql: String =
    """
      |select d.id, d.course_id, d.title, d.author_id, d.author, coalesce(u.role, 'student') as author_role, d.content, d.reply_count,
      |d.created_at, d.updated_at, d.last_reply_at, d.lesson_id, l.title as lesson_title, d.resolved, d.resolved_by, d.resolved_at, d.visibility, d.thread_state, d.pin_state,
      |d.moderated_by, d.moderated_at, d.moderation_note, d.mention_user_ids, d.sensitive_hit_count,
      |0 as like_count, 0 as favorite_count, 0 as report_count,
      |false as liked_by_current_user, false as favorited_by_current_user, false as reported_by_current_user
      |from edu_discussions d
      |left join edu_users u on u.id = d.author_id
      |left join edu_course_lessons l on l.id = d.lesson_id
      |""".stripMargin

  val listNotificationSettingsSql: String =
    "select user_id, category, enabled from edu_notification_settings where user_id = ?"

  val listPersistedNotificationsSql: String =
    """
      |select id, user_id, course_id, category, title, content, read, created_at, action_url
      |from edu_notifications
      |where user_id = ? or user_id = '*'
      |""".stripMargin

  val updateMessageReadSql: String =
    "update edu_messages set read = ? where id = ? and recipient_name = ?"

  val updateNotificationReadSql: String =
    "update edu_notifications set read = ? where id = ? and (user_id = ? or user_id = '*')"

  val updateAllMessagesReadSql: String =
    "update edu_messages set read = ? where recipient_name = ?"

  val updateAllNotificationsReadSql: String =
    "update edu_notifications set read = ? where user_id = ? or user_id = '*'"

  val upsertNotificationSettingSql: String =
    """
      |insert into edu_notification_settings (user_id, category, enabled)
      |values (?, ?, ?)
      |on conflict (user_id, category) do update set enabled = excluded.enabled
      |""".stripMargin

  val insertDiscussionTopicSql: String =
    """
      |insert into edu_discussions (
      |  id, course_id, title, author_id, author, content, reply_count,
      |  created_at, last_reply_at, lesson_id, visibility, thread_state, pin_state, resolved, mention_user_ids, sensitive_hit_count
      |)
      |values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      |""".stripMargin

  val insertDiscussionReplySql: String =
    """
      |insert into edu_discussion_replies (id, topic_id, author_id, author, content, created_at, visibility)
      |values (?, ?, ?, ?, ?, ?, ?)
      |""".stripMargin

  val updateDiscussionTopicSql: String =
    """
      |update edu_discussions
      |set title = ?, content = ?, updated_at = ?, last_reply_at = ?, mention_user_ids = ?, sensitive_hit_count = ?
      |where id = ?
      |""".stripMargin

  val deleteDiscussionTopicSql: String =
    "delete from edu_discussions where id = ?"

  val updateDiscussionReplySql: String =
    """
      |update edu_discussion_replies
      |set content = ?, updated_at = ?
      |where id = ?
      |""".stripMargin

  val deleteDiscussionReplySql: String =
    "delete from edu_discussion_replies where id = ?"

  val moderateDiscussionTopicSql: String =
    """
      |update edu_discussions
      |set visibility = ?, thread_state = ?, pin_state = ?, resolved = ?, resolved_by = ?, resolved_at = ?, moderated_by = ?, moderated_at = ?, moderation_note = ?
      |where id = ?
      |""".stripMargin

  val moderateDiscussionReplySql: String =
    """
      |update edu_discussion_replies
      |set visibility = ?, moderated_by = ?, moderated_at = ?, moderation_note = ?
      |where id = ?
      |""".stripMargin

  val findDiscussionReactionSql: String =
    "select 1 from edu_discussion_reactions where user_id = ? and topic_id = ? and reaction_type = ?"

  val deleteDiscussionReactionSql: String =
    "delete from edu_discussion_reactions where user_id = ? and topic_id = ? and reaction_type = ?"

  val insertDiscussionReactionSql: String =
    """
      |insert into edu_discussion_reactions (user_id, topic_id, reaction_type, created_at)
      |values (?, ?, ?, ?)
      |on conflict (user_id, topic_id, reaction_type) do nothing
      |""".stripMargin

  val appendDiscussionReportNoteSql: String =
    "update edu_discussions set moderation_note = coalesce(moderation_note, '') || ? where id = ?"

  val findDiscussionTopicSql: String =
    """
      |select d.id, d.course_id, d.title, d.author_id, d.author, coalesce(u.role, 'student') as author_role, d.content, d.reply_count,
      |d.created_at, d.updated_at, d.last_reply_at, d.lesson_id, l.title as lesson_title, d.resolved, d.resolved_by, d.resolved_at, d.visibility, d.thread_state, d.pin_state,
      |d.moderated_by, d.moderated_at, d.moderation_note, d.mention_user_ids, d.sensitive_hit_count,
      |0 as like_count, 0 as favorite_count, 0 as report_count,
      |false as liked_by_current_user, false as favorited_by_current_user, false as reported_by_current_user
      |from edu_discussions d
      |left join edu_users u on u.id = d.author_id
      |left join edu_course_lessons l on l.id = d.lesson_id
      |where d.id = ?
      |""".stripMargin

  val listDiscussionRepliesSql: String =
    """
      |select r.id, r.topic_id, d.course_id, r.author_id, r.author, coalesce(u.role, 'student') as author_role, r.content, r.created_at,
      |r.updated_at, r.visibility, r.moderated_by, r.moderated_at, r.moderation_note
      |from edu_discussion_replies r
      |join edu_discussions d on d.id = r.topic_id
      |left join edu_users u on u.id = r.author_id
      |where r.topic_id = ?
      |order by r.created_at asc, r.id asc
      |""".stripMargin

  val listDiscussionReactionStatsSqlTemplate: String =
    """
      |select topic_id, reaction_type, count(*) as reaction_count,
      |sum(case when user_id = ? then 1 else 0 end) as current_user_count
      |from edu_discussion_reactions
      |where topic_id in (%s)
      |group by topic_id, reaction_type
      |""".stripMargin

  val findUserIdByNameSql: String =
    "select id from edu_users where name = ? limit 1"

  val mergeTopicModerationSignalsSql: String =
    """
      |update edu_discussions
      |set mention_user_ids = concat_ws(',', nullif(mention_user_ids, ''), ?),
      |    sensitive_hit_count = sensitive_hit_count + ?
      |where id = ?
      |""".stripMargin

  val findCourseTeacherSql: String =
    "select teacher_id from edu_courses where id = ?"

  val validateDiscussionLessonSql: String =
    """
      |select id
      |from edu_course_lessons
      |where id = ?
      |and module_id in (
      |  select id from edu_course_modules where course_id = ?
      |)
      |""".stripMargin

  val findDiscussionReplySql: String =
    """
      |select r.id, r.topic_id, d.course_id, r.author_id, r.author, r.content, r.created_at,
      |r.updated_at, r.visibility, r.moderated_by, r.moderated_at, r.moderation_note
      |from edu_discussion_replies r
      |join edu_discussions d on d.id = r.topic_id
      |where r.id = ?
      |""".stripMargin

  val findLatestReplyCreatedAtSql: String =
    "select created_at from edu_discussion_replies where topic_id = ? order by created_at desc, id desc limit 1"

  val findTopicCreatedAtSql: String =
    "select created_at from edu_discussions where id = ?"

  val refreshDiscussionReplyStatsSql: String =
    """
      |update edu_discussions
      |set reply_count = (select count(*) from edu_discussion_replies where topic_id = ?),
      |    last_reply_at = ?,
      |    updated_at = ?
      |where id = ?
      |""".stripMargin

  private[discussion] def insertDiscussionTopic(
    connection: Connection,
    topicId: String,
    courseId: String,
    title: String,
    authorId: String,
    authorName: String,
    content: String,
    createdAt: String,
    lessonId: Option[String],
    mentionUserIds: List[String],
    sensitiveHitCount: Int
  ): IO[Unit] =
    using(connection.prepareStatement(insertDiscussionTopicSql)) { statement =>
      IO.blocking {
        statement.setObject(1, topicId)
        statement.setObject(2, courseId)
        statement.setObject(3, title)
        statement.setObject(4, authorId)
        statement.setObject(5, authorName)
        statement.setObject(6, content)
        statement.setObject(7, 0)
        statement.setObject(8, createdAt)
        statement.setObject(9, createdAt)
        statement.setObject(10, lessonId.orNull)
        statement.setObject(11, DiscussionVisibility.Visible.entryName)
        statement.setObject(12, DiscussionThreadState.Open.entryName)
        statement.setObject(13, DiscussionPinState.Normal.entryName)
        statement.setBoolean(14, false)
        statement.setObject(15, mentionUserIds.mkString(","))
        statement.setObject(16, sensitiveHitCount)
        statement.executeUpdate()
      }
    }.void

  private[discussion] def createPlatformReport(
    connection: Connection,
    reportId: String,
    reporterId: String,
    reporterName: String,
    targetType: String,
    targetId: String,
    targetLabel: String,
    reason: String,
    detail: Option[String]
  ): IO[Unit] =
    using(connection.prepareStatement(createPlatformReportSql)) { statement =>
      IO.blocking {
        statement.setString(1, reportId)
        statement.setString(2, reporterId)
        statement.setString(3, reporterName)
        statement.setString(4, targetType)
        statement.setString(5, targetId)
        statement.setString(6, targetLabel)
        statement.setString(7, reason)
        detail match
          case Some(value) => statement.setString(8, value)
          case None => statement.setNull(8, Types.VARCHAR)
        statement.executeUpdate()
      }
    }.void

  private[discussion] def updateDiscussionTopic(
    connection: Connection,
    topicId: String,
    title: String,
    content: String,
    updatedAt: String,
    mentionUserIds: List[String],
    sensitiveHitCount: Int
  ): IO[Unit] =
    using(connection.prepareStatement(updateDiscussionTopicSql)) { statement =>
      IO.blocking {
        statement.setObject(1, title)
        statement.setObject(2, content)
        statement.setObject(3, updatedAt)
        statement.setObject(4, updatedAt)
        statement.setObject(5, mentionUserIds.mkString(","))
        statement.setObject(6, sensitiveHitCount)
        statement.setObject(7, topicId)
        statement.executeUpdate()
      }
    }.void

  private[discussion] def insertDiscussionReply(
    connection: Connection,
    replyId: String,
    topicId: String,
    authorId: String,
    authorName: String,
    content: String,
    createdAt: String
  ): IO[Unit] =
    using(connection.prepareStatement(insertDiscussionReplySql)) { statement =>
      IO.blocking {
        statement.setObject(1, replyId)
        statement.setObject(2, topicId)
        statement.setObject(3, authorId)
        statement.setObject(4, authorName)
        statement.setObject(5, content)
        statement.setObject(6, createdAt)
        statement.setObject(7, DiscussionVisibility.Visible.entryName)
        statement.executeUpdate()
      }
    }.void

  private[discussion] def findDiscussionReaction(connection: Connection, userId: String, topicId: String, reactionType: String): IO[Boolean] =
    using(connection.prepareStatement(findDiscussionReactionSql)) { statement =>
      IO.blocking {
        statement.setObject(1, userId)
        statement.setObject(2, topicId)
        statement.setObject(3, reactionType)
        val resultSet = statement.executeQuery()
        try resultSet.next()
        finally resultSet.close()
      }
    }

  private[discussion] def deleteDiscussionReaction(connection: Connection, userId: String, topicId: String, reactionType: String): IO[Unit] =
    using(connection.prepareStatement(deleteDiscussionReactionSql)) { statement =>
      IO.blocking {
        statement.setObject(1, userId)
        statement.setObject(2, topicId)
        statement.setObject(3, reactionType)
        statement.executeUpdate()
      }
    }.void

  private[discussion] def insertDiscussionReaction(connection: Connection, userId: String, topicId: String, reactionType: String, createdAt: String): IO[Unit] =
    using(connection.prepareStatement(insertDiscussionReactionSql)) { statement =>
      IO.blocking {
        statement.setObject(1, userId)
        statement.setObject(2, topicId)
        statement.setObject(3, reactionType)
        statement.setObject(4, createdAt)
        statement.executeUpdate()
      }
    }.void

  private[discussion] def appendDiscussionReportNote(connection: Connection, topicId: String, note: String): IO[Unit] =
    using(connection.prepareStatement(appendDiscussionReportNoteSql)) { statement =>
      IO.blocking {
        statement.setObject(1, note)
        statement.setObject(2, topicId)
        statement.executeUpdate()
      }
    }.void

  private[discussion] def moderateDiscussionTopic(
    connection: Connection,
    topicId: String,
    visibility: DiscussionVisibility,
    threadState: DiscussionThreadState,
    pinState: DiscussionPinState,
    resolved: Boolean,
    moderatorName: String,
    moderatedAt: String,
    moderationNote: Option[String]
  ): IO[Unit] =
    using(connection.prepareStatement(moderateDiscussionTopicSql)) { statement =>
      IO.blocking {
        statement.setObject(1, visibility.entryName)
        statement.setObject(2, threadState.entryName)
        statement.setObject(3, pinState.entryName)
        statement.setBoolean(4, resolved)
        statement.setObject(5, if resolved then moderatorName else null)
        statement.setObject(6, if resolved then moderatedAt else null)
        statement.setObject(7, moderatorName)
        statement.setObject(8, moderatedAt)
        statement.setObject(9, moderationNote.orNull)
        statement.setObject(10, topicId)
        statement.executeUpdate()
      }
    }.void

  private[discussion] def moderateDiscussionReply(
    connection: Connection,
    replyId: String,
    visibility: DiscussionVisibility,
    moderatorName: String,
    moderatedAt: String,
    moderationNote: Option[String]
  ): IO[Unit] =
    using(connection.prepareStatement(moderateDiscussionReplySql)) { statement =>
      IO.blocking {
        statement.setObject(1, visibility.entryName)
        statement.setObject(2, moderatorName)
        statement.setObject(3, moderatedAt)
        statement.setObject(4, moderationNote.orNull)
        statement.setObject(5, replyId)
        statement.executeUpdate()
      }
    }.void

  private[discussion] def resolvePlatformReport(
    connection: Connection,
    reportId: String,
    status: String,
    resolvedBy: String,
    resolutionNote: Option[String]
  ): IO[Boolean] =
    using(connection.prepareStatement(resolvePlatformReportSql)) { statement =>
      IO.blocking {
        statement.setString(1, status)
        statement.setString(2, resolvedBy)
        resolutionNote match
          case Some(value) => statement.setString(3, value)
          case None => statement.setNull(3, Types.VARCHAR)
        statement.setString(4, reportId)
        statement.executeUpdate() > 0
      }
    }

  private[discussion] def updateDiscussionReply(connection: Connection, replyId: String, content: String, updatedAt: String): IO[Unit] =
    using(connection.prepareStatement(updateDiscussionReplySql)) { statement =>
      IO.blocking {
        statement.setObject(1, content)
        statement.setObject(2, updatedAt)
        statement.setObject(3, replyId)
        statement.executeUpdate()
      }
    }.void

  private[discussion] def deleteDiscussionReply(connection: Connection, replyId: String): IO[Unit] =
    using(connection.prepareStatement(deleteDiscussionReplySql)) { statement =>
      IO.blocking {
        statement.setObject(1, replyId)
        statement.executeUpdate()
      }
    }.void

  private[discussion] def deleteDiscussionTopic(connection: Connection, topicId: String): IO[Unit] =
    using(connection.prepareStatement(deleteDiscussionTopicSql)) { statement =>
      IO.blocking {
        statement.setObject(1, topicId)
        statement.executeUpdate()
      }
    }.void

  private[discussion] def updateMessageRead(connection: Connection, messageId: String, recipientName: String, read: Boolean): IO[Unit] =
    using(connection.prepareStatement(updateMessageReadSql)) { statement =>
      IO.blocking {
        statement.setBoolean(1, read)
        statement.setObject(2, messageId)
        statement.setObject(3, recipientName)
        statement.executeUpdate()
      }
    }.void

  private[discussion] def updateNotificationRead(connection: Connection, notificationId: String, userId: String, read: Boolean): IO[Unit] =
    using(connection.prepareStatement(updateNotificationReadSql)) { statement =>
      IO.blocking {
        statement.setBoolean(1, read)
        statement.setObject(2, notificationId)
        statement.setObject(3, userId)
        statement.executeUpdate()
      }
    }.void

  private[discussion] def updateAllMessagesRead(connection: Connection, recipientName: String, read: Boolean): IO[Unit] =
    using(connection.prepareStatement(updateAllMessagesReadSql)) { statement =>
      IO.blocking {
        statement.setBoolean(1, read)
        statement.setObject(2, recipientName)
        statement.executeUpdate()
      }
    }.void

  private[discussion] def updateAllNotificationsRead(connection: Connection, userId: String, read: Boolean): IO[Unit] =
    using(connection.prepareStatement(updateAllNotificationsReadSql)) { statement =>
      IO.blocking {
        statement.setBoolean(1, read)
        statement.setObject(2, userId)
        statement.executeUpdate()
      }
    }.void

  private[discussion] def upsertNotificationSetting(connection: Connection, userId: String, category: String, enabled: Boolean): IO[Unit] =
    using(connection.prepareStatement(upsertNotificationSettingSql)) { statement =>
      IO.blocking {
        statement.setObject(1, userId)
        statement.setObject(2, category)
        statement.setBoolean(3, enabled)
        statement.executeUpdate()
      }
    }.void

  private[discussion] def findDiscussionRow(connection: Connection, topicId: String): IO[Option[DiscussionTopicRow]] =
    using(connection.prepareStatement(findDiscussionTopicSql)) { statement =>
      IO.blocking {
        statement.setObject(1, topicId)
        val resultSet = statement.executeQuery()
        try if resultSet.next() then Some(readDiscussionRow(resultSet)) else None
        finally resultSet.close()
      }
    }

  private[discussion] def listDiscussionReplies(connection: Connection, topicId: String): IO[List[DiscussionReply]] =
    using(connection.prepareStatement(listDiscussionRepliesSql)) { statement =>
      IO.blocking {
        statement.setObject(1, topicId)
        val resultSet = statement.executeQuery()
        val buffer = mutable.ListBuffer.empty[DiscussionReply]
        try
          while resultSet.next() do buffer += readDiscussionReply(resultSet)
          buffer.toList
        finally resultSet.close()
      }
    }

  private[discussion] def listDiscussionReactionStats(
    connection: Connection,
    topicIds: List[String],
    currentUserId: String
  ): IO[List[(String, String, Int, Boolean)]] =
    if topicIds.isEmpty then IO.pure(List.empty)
    else
      val distinctTopicIds = topicIds.distinct
      val placeholders = List.fill(distinctTopicIds.size)("?").mkString(",")
      selectPreparedList(
        connection,
        listDiscussionReactionStatsSqlTemplate.format(placeholders)
      ) { statement =>
        statement.setString(1, currentUserId)
        distinctTopicIds.zipWithIndex.foreach { case (topicId, index) =>
          statement.setString(index + 2, topicId)
        }
      }(resultSet =>
        (
          resultSet.getString("topic_id"),
          resultSet.getString("reaction_type"),
          resultSet.getInt("reaction_count"),
          resultSet.getInt("current_user_count") > 0
        )
      )

  private[discussion] def findUserIdByName(connection: Connection, name: String): IO[Option[String]] =
    using(connection.prepareStatement(findUserIdByNameSql)) { statement =>
      IO.blocking {
        statement.setObject(1, name)
        val resultSet = statement.executeQuery()
        try Option.when(resultSet.next())(resultSet.getString("id"))
        finally resultSet.close()
      }
    }

  private[discussion] def mergeTopicModerationSignals(
    connection: Connection,
    topicId: String,
    mentionUserIds: List[String],
    sensitiveHitCount: Int
  ): IO[Unit] =
    using(connection.prepareStatement(mergeTopicModerationSignalsSql)) { statement =>
      IO.blocking {
        statement.setObject(1, mentionUserIds.mkString(","))
        statement.setObject(2, sensitiveHitCount)
        statement.setObject(3, topicId)
        statement.executeUpdate()
      }
    }

  private[discussion] def findCourseTeacherId(connection: Connection, courseId: String): IO[Option[String]] =
    using(connection.prepareStatement(findCourseTeacherSql)) { statement =>
      IO.blocking {
        statement.setObject(1, courseId)
        val resultSet = statement.executeQuery()
        try Option.when(resultSet.next())(resultSet.getString("teacher_id"))
        finally resultSet.close()
      }
    }

  private[discussion] def validateDiscussionLesson(connection: Connection, courseId: String, lessonId: String): IO[Option[String]] =
    using(connection.prepareStatement(validateDiscussionLessonSql)) { statement =>
      IO.blocking {
        statement.setObject(1, lessonId)
        statement.setObject(2, courseId)
        val resultSet = statement.executeQuery()
        try if resultSet.next() then Some(resultSet.getString("id")) else None
        finally resultSet.close()
      }
    }

  private[discussion] def findDiscussionReplyRow(connection: Connection, replyId: String): IO[Option[DiscussionReplyRow]] =
    using(connection.prepareStatement(findDiscussionReplySql)) { statement =>
      IO.blocking {
        statement.setObject(1, replyId)
        val resultSet = statement.executeQuery()
        try if resultSet.next() then Some(readDiscussionReplyRow(resultSet)) else None
        finally resultSet.close()
      }
    }

  private[discussion] def refreshDiscussionReplyStats(connection: Connection, topicId: String): IO[Unit] =
    for
      latestReplyAt <- using(connection.prepareStatement(findLatestReplyCreatedAtSql)) { statement =>
        IO.blocking {
          statement.setObject(1, topicId)
          val resultSet = statement.executeQuery()
          try Option.when(resultSet.next())(resultSet.getString("created_at"))
          finally resultSet.close()
        }
      }
      topicCreatedAt <- using(connection.prepareStatement(findTopicCreatedAtSql)) { statement =>
        IO.blocking {
          statement.setObject(1, topicId)
          val resultSet = statement.executeQuery()
          try if resultSet.next() then resultSet.getString("created_at") else Instant.now().toString
          finally resultSet.close()
        }
      }
      _ <- using(connection.prepareStatement(refreshDiscussionReplyStatsSql)) { statement =>
        val lastReplyAt = latestReplyAt.getOrElse(topicCreatedAt)
        IO.blocking {
          statement.setObject(1, topicId)
          statement.setObject(2, lastReplyAt)
          statement.setObject(3, Instant.now().toString)
          statement.setObject(4, topicId)
          statement.executeUpdate()
        }
      }
    yield ()

  private[discussion] def hasOpenPlatformReport(
    connection: Connection,
    reporterId: String,
    targetType: String,
    targetId: String
  ): IO[Boolean] =
    using(connection.prepareStatement(hasOpenPlatformReportSql)) { statement =>
      IO.blocking {
        statement.setString(1, reporterId)
        statement.setString(2, targetType)
        statement.setString(3, targetId)
        val resultSet = statement.executeQuery()
        try resultSet.next()
        finally resultSet.close()
      }
    }

  private[discussion] def findPlatformReport(connection: Connection, reportId: String): IO[Option[PlatformReport]] =
    using(connection.prepareStatement(findPlatformReportSql)) { statement =>
      IO.blocking {
        statement.setString(1, reportId)
        val resultSet = statement.executeQuery()
        try if resultSet.next() then Some(readPlatformReport(resultSet)) else None
        finally resultSet.close()
      }
    }

  private[discussion] def findUserPermissions(connection: Connection, userId: String): IO[Option[List[String]]] =
    using(connection.prepareStatement(findUserPermissionsSql)) { statement =>
      IO.blocking {
        statement.setString(1, userId)
        val resultSet = statement.executeQuery()
        try
          if resultSet.next() then Some(decodeCsv(resultSet.getString("permissions")))
          else None
        finally resultSet.close()
      }
    }

  private[discussion] def updateUserPermissions(connection: Connection, userId: String, permissions: List[String]): IO[Boolean] =
    using(connection.prepareStatement(updateUserPermissionsSql)) { statement =>
      IO.blocking {
        statement.setString(1, encodeCsv(permissions))
        statement.setString(2, userId)
        statement.executeUpdate() > 0
      }
    }

  private[discussion] def selectList[A](connection: Connection, sql: String)(reader: ResultSet => A): IO[List[A]] =
    using(connection.createStatement()) { statement =>
      IO.blocking {
        val resultSet = statement.executeQuery(sql)
        val buffer = mutable.ListBuffer.empty[A]
        try
          while resultSet.next() do buffer += reader(resultSet)
          buffer.toList
        finally resultSet.close()
      }
    }

  private[discussion] def selectPreparedList[A](
    connection: Connection,
    sql: String
  )(bind: PreparedStatement => Unit)(reader: ResultSet => A): IO[List[A]] =
    using(connection.prepareStatement(sql)) { statement =>
      IO.blocking {
        bind(statement)
        val resultSet = statement.executeQuery()
        val buffer = mutable.ListBuffer.empty[A]
        try
          while resultSet.next() do buffer += reader(resultSet)
          buffer.toList
        finally resultSet.close()
      }
    }

  private[discussion] def using[A <: AutoCloseable, B](resource: A)(use: A => IO[B]): IO[B] =
    use(resource).guarantee(IO.blocking(resource.close()).handleErrorWith(_ => IO.unit))

  private def decodeCsv(value: String): List[String] =
    Option(value).toList.flatMap(_.split(",")).map(_.trim).filter(_.nonEmpty)

  private def encodeCsv(values: List[String]): String =
    values.distinct.filter(_.nonEmpty).mkString(",")

  private[discussion] def readDiscussionRow(resultSet: ResultSet): DiscussionTopicRow =
    DiscussionTopicRow(
      id = resultSet.getString("id"),
      courseId = resultSet.getString("course_id"),
      title = resultSet.getString("title"),
      authorId = resultSet.getString("author_id"),
      author = resultSet.getString("author"),
      authorRole = parseUserRole(resultSet.getString("author_role")),
      content = resultSet.getString("content"),
      replyCount = resultSet.getInt("reply_count"),
      createdAt = resultSet.getString("created_at"),
      updatedAt = Option(resultSet.getString("updated_at")).filter(_.nonEmpty),
      lastReplyAt = resultSet.getString("last_reply_at"),
      lessonId = Option(resultSet.getString("lesson_id")).filter(_.nonEmpty),
      lessonTitle = Option(resultSet.getString("lesson_title")).filter(_.nonEmpty),
      resolved = resultSet.getBoolean("resolved"),
      resolvedBy = Option(resultSet.getString("resolved_by")).filter(_.nonEmpty),
      resolvedAt = Option(resultSet.getString("resolved_at")).filter(_.nonEmpty),
      visibility = DiscussionVisibility.values.find(_.entryName == resultSet.getString("visibility")).getOrElse(DiscussionVisibility.Visible),
      threadState = DiscussionThreadState.values.find(_.entryName == resultSet.getString("thread_state")).getOrElse(DiscussionThreadState.Open),
      pinState = DiscussionPinState.values.find(_.entryName == resultSet.getString("pin_state")).getOrElse(DiscussionPinState.Normal),
      moderatedBy = Option(resultSet.getString("moderated_by")).filter(_.nonEmpty),
      moderatedAt = Option(resultSet.getString("moderated_at")).filter(_.nonEmpty),
      moderationNote = Option(resultSet.getString("moderation_note")).filter(_.nonEmpty),
      likeCount = optionalInt(resultSet, "like_count", 0),
      favoriteCount = optionalInt(resultSet, "favorite_count", 0),
      reportCount = optionalInt(resultSet, "report_count", 0),
      mentionUserIds = decodeCsv(optionalString(resultSet, "mention_user_ids").getOrElse("")),
      sensitiveHitCount = optionalInt(resultSet, "sensitive_hit_count", 0),
      likedByCurrentUser = optionalBoolean(resultSet, "liked_by_current_user", false),
      favoritedByCurrentUser = optionalBoolean(resultSet, "favorited_by_current_user", false),
      reportedByCurrentUser = optionalBoolean(resultSet, "reported_by_current_user", false)
    )

  private[discussion] def readDiscussionReply(resultSet: ResultSet): DiscussionReply =
    toDiscussionReply(readDiscussionReplyRow(resultSet))

  private[discussion] def readDiscussionReplyRow(resultSet: ResultSet): DiscussionReplyRow =
    DiscussionReplyRow(
      id = resultSet.getString("id"),
      topicId = resultSet.getString("topic_id"),
      courseId = resultSet.getString("course_id"),
      authorId = resultSet.getString("author_id"),
      author = resultSet.getString("author"),
      authorRole = parseUserRole(resultSet.getString("author_role")),
      content = resultSet.getString("content"),
      createdAt = resultSet.getString("created_at"),
      updatedAt = Option(resultSet.getString("updated_at")).filter(_.nonEmpty),
      visibility = DiscussionVisibility.values.find(_.entryName == resultSet.getString("visibility")).getOrElse(DiscussionVisibility.Visible),
      moderatedBy = Option(resultSet.getString("moderated_by")).filter(_.nonEmpty),
      moderatedAt = Option(resultSet.getString("moderated_at")).filter(_.nonEmpty),
      moderationNote = Option(resultSet.getString("moderation_note")).filter(_.nonEmpty)
    )

  private[discussion] def readPlatformReport(resultSet: ResultSet): PlatformReport =
    PlatformReport(
      id = resultSet.getString("id"),
      reporterId = resultSet.getString("reporter_id"),
      reporterName = resultSet.getString("reporter_name"),
      targetType = resultSet.getString("target_type"),
      targetId = resultSet.getString("target_id"),
      targetLabel = resultSet.getString("target_label"),
      reason = resultSet.getString("reason"),
      detail = optionalString(resultSet, "detail"),
      status = resultSet.getString("status"),
      createdAt = resultSet.getString("created_at"),
      resolvedBy = optionalString(resultSet, "resolved_by"),
      resolvedAt = optionalString(resultSet, "resolved_at"),
      resolutionNote = optionalString(resultSet, "resolution_note")
    )

  private def toDiscussionReply(row: DiscussionReplyRow): DiscussionReply =
    DiscussionReply(
      id = row.id,
      topicId = row.topicId,
      authorId = row.authorId,
      author = row.author,
      authorRole = row.authorRole,
      content = row.content,
      createdAt = row.createdAt,
      updatedAt = row.updatedAt,
      visibility = row.visibility,
      moderatedBy = row.moderatedBy,
      moderatedAt = row.moderatedAt,
      moderationNote = row.moderationNote
    )

  private def parseUserRole(value: String): UserRole =
    UserRole.fromString(value).getOrElse(UserRole.Student)

  private def optionalString(resultSet: ResultSet, column: String): Option[String] =
    try Option(resultSet.getString(column)).filter(_.nonEmpty)
    catch
      case _: Throwable => None

  private def optionalInt(resultSet: ResultSet, column: String, default: Int): Int =
    try Option(resultSet.getObject(column)).map(_.toString.toInt).getOrElse(default)
    catch
      case _: Throwable => default

  private def optionalBoolean(resultSet: ResultSet, column: String, default: Boolean): Boolean =
    try resultSet.getBoolean(column)
    catch
      case _: Throwable => default
