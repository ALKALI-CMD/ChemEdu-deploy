package microservices.course.learning.tables

import cats.effect.IO
import io.circe.parser.decode
import io.circe.syntax.*
import microservices.course.learning.objects.*

import java.sql.{Connection, ResultSet}
import scala.collection.mutable.ListBuffer

private[learning] object AssignmentTable:

  val schemaStatements: List[String] = List(
    "alter table edu_assignments add column if not exists submission_content text",
    "alter table edu_assignments add column if not exists submitted_at varchar(80)",
    "alter table edu_assignments add column if not exists feedback text",
    "alter table edu_assignments add column if not exists reviewer_name varchar(120)",
    "alter table edu_assignments add column if not exists submission_attachments text",
    "alter table edu_assignments add column if not exists review_attachments text",
    "alter table edu_assignments add column if not exists reviewed_at varchar(80)",
    "alter table edu_assignments add column if not exists attempt_count integer not null default 0",
    "alter table edu_assignments add column if not exists max_attempts integer not null default 2",
    "alter table edu_assignments add column if not exists allow_late_submission boolean not null default true",
    "alter table edu_assignments add column if not exists allow_resubmission boolean not null default true",
    "alter table edu_assignments add column if not exists allow_make_up_submission boolean not null default false",
    "alter table edu_assignments add column if not exists late_submission_deadline varchar(80)",
    "alter table edu_assignments add column if not exists late_penalty_percent_per_day integer not null default 0",
    "alter table edu_assignments add column if not exists late_penalty_cap_percent integer not null default 0",
    "alter table edu_assignments add column if not exists late_penalty_applied_percent integer not null default 0",
    "alter table edu_assignments add column if not exists late_submitted boolean not null default false",
    "alter table edu_assignments add column if not exists raw_score integer",
    "alter table edu_assignments add column if not exists submission_note text",
    "alter table edu_assignments add column if not exists rubric_json text not null default '[]'",
    "alter table edu_assignments add column if not exists rubric_scores_json text not null default '[]'",
    "alter table edu_assignments add column if not exists teacher_annotations_json text not null default '[]'",
    "alter table edu_assignments add column if not exists submission_history_json text not null default '[]'",
    "alter table edu_assignments add column if not exists review_history_json text not null default '[]'"
  )

  val assignmentProjectionSql: String =
    """
      |select id, course_id, title, description, deadline, attachment_label, submission_status, score,
      |raw_score, submission_content, submission_note, submission_attachments, submitted_at, feedback, review_attachments, reviewer_name,
      |reviewed_at, attempt_count, max_attempts, allow_late_submission, allow_resubmission, allow_make_up_submission,
      |late_submission_deadline, late_penalty_percent_per_day, late_penalty_cap_percent, late_penalty_applied_percent, late_submitted,
      |rubric_json, rubric_scores_json, teacher_annotations_json, submission_history_json, review_history_json
      |from edu_assignments
      |""".stripMargin

  val listStudentAssignmentsSql: String =
    assignmentProjectionSql + "where student_id = ?"

  val listAllSubmittedAssignmentsSql: String =
    assignmentProjectionSql + "where student_id is not null"

  val countStudentCourseAssignmentsSql: String =
    "select count(*) from edu_assignments where student_id = ? and course_id = ?"

  val listAssignmentTemplatesForCloneSql: String =
    """
      |select distinct on (title)
      |title, description, deadline, attachment_label, max_attempts, allow_late_submission, allow_resubmission,
      |allow_make_up_submission, late_submission_deadline, late_penalty_percent_per_day, late_penalty_cap_percent, rubric_json
      |from edu_assignments
      |where course_id = ?
      |order by title, id
      |""".stripMargin

  val insertAssignmentSql: String =
    """
      |insert into edu_assignments (
      |  id, course_id, student_id, title, description, deadline, attachment_label,
      |  submission_status, score, raw_score, submission_note, submission_attachments, review_attachments, attempt_count, max_attempts,
      |  allow_late_submission, allow_resubmission, allow_make_up_submission, late_submission_deadline,
      |  late_penalty_percent_per_day, late_penalty_cap_percent, late_penalty_applied_percent,
      |  rubric_json, rubric_scores_json, teacher_annotations_json, submission_history_json, review_history_json
      |) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      |""".stripMargin

  val submitAssignmentSql: String =
    """
      |update edu_assignments
      |set submission_content = ?, submission_note = ?, submitted_at = ?, submission_status = ?, score = null, raw_score = null, feedback = null,
      |reviewer_name = null, submission_attachments = ?, review_attachments = '[]', reviewed_at = null,
      |attempt_count = ?, late_submitted = ?, late_penalty_applied_percent = 0, rubric_scores_json = '[]', teacher_annotations_json = '[]',
      |submission_history_json = ?, review_history_json = '[]'
      |where id = ?
      |""".stripMargin

  val reviewAssignmentSql: String =
    """
      |update edu_assignments
      |set score = ?, raw_score = ?, late_penalty_applied_percent = ?, feedback = ?, reviewer_name = ?, submission_status = ?, review_attachments = ?, reviewed_at = ?,
      |rubric_scores_json = ?, teacher_annotations_json = ?, review_history_json = ?
      |where id = ?
      |""".stripMargin

  val findStudentAssignmentSql: String =
    assignmentProjectionSql + "where id = ? and student_id = ?"

  val findAssignmentByIdSql: String =
    assignmentProjectionSql + "where id = ?"

  val findAssignmentWithStudentSql: String =
    """
      |select id, course_id, title, student_id
      |from edu_assignments
      |where id = ?
      |""".stripMargin

  private[learning] def insertAssignmentForStudent(
    connection: Connection,
    assignmentId: String,
    courseId: String,
    studentId: Option[String],
    title: String,
    description: String,
    deadline: String,
    attachmentLabel: String,
    maxAttempts: Int,
    allowLateSubmission: Boolean,
    allowResubmission: Boolean,
    allowMakeUpSubmission: Boolean,
    lateSubmissionDeadline: Option[String],
    latePenaltyPercentPerDay: Int,
    latePenaltyCapPercent: Int,
    rubric: List[AssignmentRubricCriterion]
  ): IO[Unit] =
    using(connection.prepareStatement(insertAssignmentSql)) { statement =>
      IO.blocking {
        statement.setObject(1, assignmentId)
        statement.setObject(2, courseId)
        statement.setObject(3, studentId.orNull)
        statement.setObject(4, title)
        statement.setObject(5, description)
        statement.setObject(6, deadline)
        statement.setObject(7, attachmentLabel)
        statement.setObject(8, SubmissionStatus.toString(SubmissionStatus.Pending))
        statement.setObject(9, null)
        statement.setObject(10, null)
        statement.setObject(11, null)
        statement.setObject(12, "[]")
        statement.setObject(13, "[]")
        statement.setObject(14, 0)
        statement.setObject(15, maxAttempts)
        statement.setObject(16, allowLateSubmission)
        statement.setObject(17, allowResubmission)
        statement.setObject(18, allowMakeUpSubmission)
        statement.setObject(19, lateSubmissionDeadline.orNull)
        statement.setObject(20, latePenaltyPercentPerDay)
        statement.setObject(21, latePenaltyCapPercent)
        statement.setObject(22, 0)
        statement.setObject(23, encodeRubric(rubric))
        statement.setObject(24, "[]")
        statement.setObject(25, "[]")
        statement.setObject(26, "[]")
        statement.setObject(27, "[]")
        statement.executeUpdate()
      }
    }

  private[learning] final case class AssignmentCourseRow(
    assignmentId: String,
    courseId: String,
    title: String,
    studentId: String
  )

  private[learning] final case class AssignmentTemplateRow(
    title: String,
    description: String,
    deadline: String,
    attachmentLabel: String,
    maxAttempts: Int,
    allowLateSubmission: Boolean,
    allowResubmission: Boolean,
    allowMakeUpSubmission: Boolean,
    lateSubmissionDeadline: Option[String],
    latePenaltyPercentPerDay: Int,
    latePenaltyCapPercent: Int,
    rubric: List[AssignmentRubricCriterion]
  )

  private[learning] def findStudentAssignment(connection: Connection, assignmentId: String, studentId: String): IO[Option[Assignment]] =
    using(connection.prepareStatement(findStudentAssignmentSql)) { statement =>
      IO.blocking {
        statement.setObject(1, assignmentId)
        statement.setObject(2, studentId)
        val resultSet = statement.executeQuery()
        try if resultSet.next() then Some(readAssignment(resultSet)) else None
        finally resultSet.close()
      }
    }

  private[learning] def listStudentAssignments(connection: Connection, studentId: String): IO[List[Assignment]] =
    selectPreparedList(connection, listStudentAssignmentsSql) { statement =>
      statement.setString(1, studentId)
    }(readAssignment)

  private[learning] def listAllSubmittedAssignments(connection: Connection): IO[List[Assignment]] =
    selectList(connection, listAllSubmittedAssignmentsSql)(readAssignment)

  private[learning] def countStudentCourseAssignments(connection: Connection, studentId: String, courseId: String): IO[Int] =
    using(connection.prepareStatement(countStudentCourseAssignmentsSql)) { statement =>
      IO.blocking {
        statement.setObject(1, studentId)
        statement.setObject(2, courseId)
        val resultSet = statement.executeQuery()
        try if resultSet.next() then resultSet.getInt(1) else 0
        finally resultSet.close()
      }
    }

  private[learning] def listAssignmentTemplatesForClone(connection: Connection, courseId: String): IO[List[AssignmentTemplateRow]] =
    using(connection.prepareStatement(listAssignmentTemplatesForCloneSql)) { statement =>
      IO.blocking {
        statement.setObject(1, courseId)
        val resultSet = statement.executeQuery()
        val templates = ListBuffer.empty[AssignmentTemplateRow]
        try
          while resultSet.next() do
            templates += AssignmentTemplateRow(
              title = resultSet.getString("title"),
              description = resultSet.getString("description"),
              deadline = resultSet.getString("deadline"),
              attachmentLabel = resultSet.getString("attachment_label"),
              maxAttempts = resultSet.getInt("max_attempts"),
              allowLateSubmission = resultSet.getBoolean("allow_late_submission"),
              allowResubmission = resultSet.getBoolean("allow_resubmission"),
              allowMakeUpSubmission = resultSet.getBoolean("allow_make_up_submission"),
              lateSubmissionDeadline = Option(resultSet.getString("late_submission_deadline")).filter(_.nonEmpty),
              latePenaltyPercentPerDay = resultSet.getInt("late_penalty_percent_per_day"),
              latePenaltyCapPercent = resultSet.getInt("late_penalty_cap_percent"),
              rubric = decodeRubric(resultSet.getString("rubric_json"))
            )
          templates.toList
        finally resultSet.close()
      }
    }

  private[learning] def findAssignmentById(connection: Connection, assignmentId: String): IO[Option[Assignment]] =
    using(connection.prepareStatement(findAssignmentByIdSql)) { statement =>
      IO.blocking {
        statement.setObject(1, assignmentId)
        val resultSet = statement.executeQuery()
        try if resultSet.next() then Some(readAssignment(resultSet)) else None
        finally resultSet.close()
      }
    }

  private[learning] def submitAssignment(
    connection: Connection,
    assignmentId: String,
    submissionContent: String,
    submissionNote: Option[String],
    submittedAt: String,
    submissionAttachments: List[AssignmentAttachment],
    nextAttemptCount: Int,
    lateSubmitted: Boolean,
    submissionHistory: List[AssignmentSubmissionRecord]
  ): IO[Unit] =
    using(connection.prepareStatement(submitAssignmentSql)) { statement =>
      IO.blocking {
        statement.setObject(1, submissionContent)
        statement.setObject(2, submissionNote.map(_.trim).filter(_.nonEmpty).orNull)
        statement.setObject(3, submittedAt)
        statement.setObject(4, SubmissionStatus.toString(SubmissionStatus.Submitted))
        statement.setObject(5, encodeAttachments(submissionAttachments, AssignmentAttachmentType.Submission))
        statement.setObject(6, nextAttemptCount)
        statement.setObject(7, lateSubmitted)
        statement.setObject(8, encodeSubmissionHistory(submissionHistory))
        statement.setObject(9, assignmentId)
        statement.executeUpdate()
      }
    }

  private[learning] def reviewAssignment(
    connection: Connection,
    assignmentId: String,
    finalScore: Int,
    rawScore: Int,
    latePenaltyAppliedPercent: Int,
    feedback: String,
    reviewerName: String,
    reviewedAt: String,
    reviewAttachments: List[AssignmentAttachment],
    rubricScores: List[AssignmentRubricScore],
    teacherAnnotations: List[TeacherAnnotation],
    reviewHistory: List[AssignmentReviewRecord]
  ): IO[Unit] =
    using(connection.prepareStatement(reviewAssignmentSql)) { statement =>
      IO.blocking {
        statement.setObject(1, finalScore)
        statement.setObject(2, rawScore)
        statement.setObject(3, latePenaltyAppliedPercent)
        statement.setObject(4, feedback)
        statement.setObject(5, reviewerName)
        statement.setObject(6, SubmissionStatus.toString(SubmissionStatus.Reviewed))
        statement.setObject(7, encodeAttachments(reviewAttachments, AssignmentAttachmentType.Review))
        statement.setObject(8, reviewedAt)
        statement.setObject(9, encodeRubricScores(rubricScores))
        statement.setObject(10, encodeTeacherAnnotations(teacherAnnotations))
        statement.setObject(11, encodeReviewHistory(reviewHistory))
        statement.setObject(12, assignmentId)
        statement.executeUpdate()
      }
    }

  private[learning] def readAssignment(resultSet: ResultSet): Assignment =
    val attemptCount = resultSet.getInt("attempt_count")
    val maxAttempts = resultSet.getInt("max_attempts")
    val allowResubmission = resultSet.getBoolean("allow_resubmission")
    val allowMakeUpSubmission = resultSet.getBoolean("allow_make_up_submission")
    val reviewHistory = decodeReviewHistory(resultSet.getString("review_history_json"))
    Assignment(
      id = resultSet.getString("id"),
      courseId = resultSet.getString("course_id"),
      title = resultSet.getString("title"),
      description = resultSet.getString("description"),
      deadline = resultSet.getString("deadline"),
      attachmentLabel = resultSet.getString("attachment_label"),
      referenceAttachments = buildReferenceAttachments(resultSet.getString("attachment_label")),
      submissionStatus = SubmissionStatus.fromString(resultSet.getString("submission_status")).getOrElse(SubmissionStatus.Pending),
      score = Option(resultSet.getObject("score")).map(_.toString.toInt),
      rawScore = Option(resultSet.getObject("raw_score")).map(_.toString.toInt),
      submissionContent = Option(resultSet.getString("submission_content")).filter(_.nonEmpty),
      submissionNote = Option(resultSet.getString("submission_note")).filter(_.nonEmpty),
      submissionAttachments = decodeAttachments(resultSet.getString("submission_attachments")),
      submittedAt = Option(resultSet.getString("submitted_at")).filter(_.nonEmpty),
      feedback = Option(resultSet.getString("feedback")).filter(_.nonEmpty),
      reviewAttachments = decodeAttachments(resultSet.getString("review_attachments")),
      reviewerName = Option(resultSet.getString("reviewer_name")).filter(_.nonEmpty),
      reviewedAt = Option(resultSet.getString("reviewed_at")).filter(_.nonEmpty),
      attemptCount = attemptCount,
      resubmissionCount = Math.max(0, attemptCount - 1),
      maxAttempts = maxAttempts,
      allowLateSubmission = resultSet.getBoolean("allow_late_submission"),
      allowResubmission = allowResubmission,
      allowMakeUpSubmission = allowMakeUpSubmission,
      lateSubmissionDeadline = Option(resultSet.getString("late_submission_deadline")).filter(_.nonEmpty),
      latePenaltyPercentPerDay = resultSet.getInt("late_penalty_percent_per_day"),
      latePenaltyCapPercent = resultSet.getInt("late_penalty_cap_percent"),
      latePenaltyAppliedPercent = resultSet.getInt("late_penalty_applied_percent"),
      lateSubmitted = resultSet.getBoolean("late_submitted"),
      reviewCount = reviewHistory.size,
      canResubmit = attemptCount < maxAttempts && (allowResubmission || allowMakeUpSubmission || attemptCount == 0),
      rubric = decodeRubric(resultSet.getString("rubric_json")),
      rubricScores = decodeRubricScores(resultSet.getString("rubric_scores_json")),
      teacherAnnotations = decodeTeacherAnnotations(resultSet.getString("teacher_annotations_json")),
      submissionHistory = decodeSubmissionHistory(resultSet.getString("submission_history_json")),
      reviewHistory = reviewHistory
    )

  private[learning] def encodeAttachments(
    attachments: List[AssignmentAttachment],
    targetType: AssignmentAttachmentType
  ): String =
    attachments
      .map(attachment => attachment.copy(attachmentType = targetType))
      .asJson
      .noSpaces

  private[learning] def decodeRubric(value: String): List[AssignmentRubricCriterion] =
    decodeJsonList[AssignmentRubricCriterion](value)

  private[learning] def encodeRubric(value: List[AssignmentRubricCriterion]): String =
    value.asJson.noSpaces

  private[learning] def encodeRubricScores(value: List[AssignmentRubricScore]): String =
    value.asJson.noSpaces

  private[learning] def encodeTeacherAnnotations(value: List[TeacherAnnotation]): String =
    value.asJson.noSpaces

  private[learning] def encodeSubmissionHistory(value: List[AssignmentSubmissionRecord]): String =
    value.asJson.noSpaces

  private[learning] def encodeReviewHistory(value: List[AssignmentReviewRecord]): String =
    value.asJson.noSpaces

  private def buildReferenceAttachments(attachmentLabel: String): List[AssignmentAttachment] =
    Option(attachmentLabel).filter(_.trim.nonEmpty).toList.map(label =>
      AssignmentAttachment(
        label = label,
        url = "",
        attachmentType = AssignmentAttachmentType.Reference,
        sizeBytes = None,
        uploadedAt = None
      )
    )

  private def decodeAttachments(value: String): List[AssignmentAttachment] =
    decodeJsonList[AssignmentAttachment](value)

  private def decodeRubricScores(value: String): List[AssignmentRubricScore] =
    decodeJsonList[AssignmentRubricScore](value)

  private def decodeTeacherAnnotations(value: String): List[TeacherAnnotation] =
    decodeJsonList[TeacherAnnotation](value)

  private def decodeSubmissionHistory(value: String): List[AssignmentSubmissionRecord] =
    decodeJsonList[AssignmentSubmissionRecord](value)

  private def decodeReviewHistory(value: String): List[AssignmentReviewRecord] =
    decodeJsonList[AssignmentReviewRecord](value)

  private def decodeJsonList[A: io.circe.Decoder](value: String): List[A] =
    Option(value)
      .filter(_.trim.nonEmpty)
      .flatMap(raw => decode[List[A]](raw).toOption)
      .getOrElse(Nil)

  private[learning] def findAssignmentWithStudent(connection: Connection, assignmentId: String): IO[Option[AssignmentCourseRow]] =
    using(connection.prepareStatement(findAssignmentWithStudentSql)) { statement =>
      IO.blocking {
        statement.setObject(1, assignmentId)
        val resultSet = statement.executeQuery()
        try
          if resultSet.next() then
            Some(
              AssignmentCourseRow(
                assignmentId = resultSet.getString("id"),
                courseId = resultSet.getString("course_id"),
                title = resultSet.getString("title"),
                studentId = resultSet.getString("student_id")
              )
            )
          else None
        finally resultSet.close()
      }
    }

  private[learning] def selectList[A](connection: Connection, sql: String)(reader: ResultSet => A): IO[List[A]] =
    using(connection.createStatement()) { statement =>
      IO.blocking {
        val resultSet = statement.executeQuery(sql)
        val buffer = ListBuffer.empty[A]
        try
          while resultSet.next() do buffer += reader(resultSet)
          buffer.toList
        finally resultSet.close()
      }
    }

  private[learning] def selectPreparedList[A](
    connection: Connection,
    sql: String
  )(bind: java.sql.PreparedStatement => Unit)(reader: ResultSet => A): IO[List[A]] =
    using(connection.prepareStatement(sql)) { statement =>
      IO.blocking {
        bind(statement)
        val resultSet = statement.executeQuery()
        val buffer = ListBuffer.empty[A]
        try
          while resultSet.next() do buffer += reader(resultSet)
          buffer.toList
        finally resultSet.close()
      }
    }

  private[learning] def using[A <: AutoCloseable, B](resource: A)(use: A => IO[B]): IO[B] =
    use(resource).guarantee(IO.blocking(resource.close()).handleErrorWith(_ => IO.unit))
