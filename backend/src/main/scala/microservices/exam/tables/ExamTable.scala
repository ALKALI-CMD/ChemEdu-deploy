// 文件说明：考试评定域数据访问对象，封装期次、考试、答题卡、判分、争分、分析与线索的全部 SQL。
package microservices.exam.tables

import cats.effect.IO
import io.circe.parser.decode
import io.circe.syntax.*
import microservices.exam.objects.*

import java.sql.{Connection, PreparedStatement, ResultSet}
import scala.collection.mutable

private[exam] object ExamTable:

  // ---------- 期次 ----------

  private val insertCohortSql: String =
    """
      |insert into edu_training_cohorts (id, name, season, start_date, end_date, description, member_ids, status, created_by, created_at)
      |values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      |""".stripMargin

  private val updateCohortSql: String =
    """
      |update edu_training_cohorts
      |set name = ?, season = ?, start_date = ?, end_date = ?, description = ?, member_ids = ?, status = ?
      |where id = ?
      |""".stripMargin

  private val listCohortsSql: String =
    """
      |select id, name, season, start_date, end_date, description, member_ids, status, created_by, created_at
      |from edu_training_cohorts order by created_at asc
      |""".stripMargin

  private val findCohortByIdSql: String =
    """
      |select id, name, season, start_date, end_date, description, member_ids, status, created_by, created_at
      |from edu_training_cohorts where id = ?
      |""".stripMargin

  def insertCohort(connection: Connection, cohort: TrainingCohort): IO[Unit] =
    IO.blocking {
      val statement = connection.prepareStatement(insertCohortSql)
      try
        bindCohort(statement, cohort, includeId = true)
        statement.executeUpdate()
        ()
      finally statement.close()
    }

  def updateCohort(connection: Connection, cohort: TrainingCohort): IO[Unit] =
    IO.blocking {
      val statement = connection.prepareStatement(updateCohortSql)
      try
        bindCohort(statement, cohort, includeId = false)
        statement.setString(8, cohort.id)
        statement.executeUpdate()
        ()
      finally statement.close()
    }

  def listCohorts(connection: Connection): IO[List[TrainingCohort]] =
    selectList(connection, listCohortsSql)(readCohort)

  def findCohortById(connection: Connection, id: String): IO[Option[TrainingCohort]] =
    queryOne(connection.prepareStatement(findCohortByIdSql))(_.setString(1, id))(readCohort)

  private def bindCohort(statement: PreparedStatement, cohort: TrainingCohort, includeId: Boolean): Unit =
    var index = 1
    if includeId then
      statement.setString(index, cohort.id)
      index += 1
    statement.setString(index, cohort.name); index += 1
    statement.setString(index, cohort.season); index += 1
    statement.setString(index, cohort.startDate); index += 1
    statement.setString(index, cohort.endDate); index += 1
    statement.setString(index, cohort.description); index += 1
    statement.setString(index, cohort.memberIds.mkString(",")); index += 1
    statement.setString(index, cohort.status); index += 1
    statement.setString(index, cohort.createdBy.orNull); index += 1
    statement.setString(index, cohort.createdAt)

  private def readCohort(resultSet: ResultSet): TrainingCohort =
    TrainingCohort(
      id = resultSet.getString("id"),
      name = resultSet.getString("name"),
      season = resultSet.getString("season"),
      startDate = resultSet.getString("start_date"),
      endDate = resultSet.getString("end_date"),
      description = resultSet.getString("description"),
      memberIds = Option(resultSet.getString("member_ids")).map(_.split(",").toList.map(_.trim).filter(_.nonEmpty)).getOrElse(Nil),
      status = resultSet.getString("status"),
      createdBy = Option(resultSet.getString("created_by")),
      createdAt = resultSet.getString("created_at")
    )

  // ---------- 考试 ----------

  private val insertExamSql: String =
    """
      |insert into edu_exams (id, cohort_id, name, description, scheduled_start, scheduled_end, argue_hours,
      |  argue_deadline, status, questions, grading_regions, sheet_template_image, created_by, created_at, released_at)
      |values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      |""".stripMargin

  private val updateExamSql: String =
    """
      |update edu_exams
      |set cohort_id = ?, name = ?, description = ?, scheduled_start = ?, scheduled_end = ?, argue_hours = ?,
      |  status = ?, questions = ?, grading_regions = ?, sheet_template_image = ?
      |where id = ?
      |""".stripMargin

  private val updateExamStatusSql: String =
    """
      |update edu_exams set status = ?, argue_deadline = ?, released_at = ? where id = ?
      |""".stripMargin

  private val listExamsSql: String =
    """
      |select id, cohort_id, name, description, scheduled_start, scheduled_end, argue_hours, argue_deadline,
      |  status, questions, grading_regions, sheet_template_image, created_by, created_at, released_at
      |from edu_exams
      |""".stripMargin

  private val findExamByIdSql: String =
    """
      |select id, cohort_id, name, description, scheduled_start, scheduled_end, argue_hours, argue_deadline,
      |  status, questions, grading_regions, sheet_template_image, created_by, created_at, released_at
      |from edu_exams where id = ?
      |""".stripMargin

  def insertExam(connection: Connection, exam: Exam): IO[Unit] =
    IO.blocking {
      val statement = connection.prepareStatement(insertExamSql)
      try
        bindExam(statement, exam, includeId = true)
        statement.executeUpdate()
        ()
      finally statement.close()
    }

  def updateExam(connection: Connection, exam: Exam): IO[Unit] =
    IO.blocking {
      val statement = connection.prepareStatement(updateExamSql)
      try
        bindExam(statement, exam, includeId = false)
        statement.setString(11, exam.id)
        statement.executeUpdate()
        ()
      finally statement.close()
    }

  def updateExamStatus(connection: Connection, examId: String, status: String, argueDeadline: Option[String], releasedAt: Option[String]): IO[Unit] =
    IO.blocking {
      val statement = connection.prepareStatement(updateExamStatusSql)
      try
        statement.setString(1, status)
        statement.setString(2, argueDeadline.orNull)
        statement.setString(3, releasedAt.orNull)
        statement.setString(4, examId)
        statement.executeUpdate()
        ()
      finally statement.close()
    }

  def listExams(connection: Connection, cohortId: Option[String]): IO[List[Exam]] =
    cohortId match
      case Some(value) =>
        selectList(connection.prepareStatement(listExamsSql + " where cohort_id = ? order by scheduled_start asc")) { statement =>
          statement.setString(1, value)
        }(readExam)
      case None =>
        selectList(connection.prepareStatement(listExamsSql + " order by scheduled_start asc"))(_ => ())(readExam)

  def findExamById(connection: Connection, id: String): IO[Option[Exam]] =
    queryOne(connection.prepareStatement(findExamByIdSql))(_.setString(1, id))(readExam)

  private def bindExam(statement: PreparedStatement, exam: Exam, includeId: Boolean): Unit =
    var index = 1
    if includeId then
      statement.setString(index, exam.id)
      index += 1
    statement.setString(index, exam.cohortId); index += 1
    statement.setString(index, exam.name); index += 1
    statement.setString(index, exam.description); index += 1
    statement.setString(index, exam.scheduledStart); index += 1
    statement.setString(index, exam.scheduledEnd); index += 1
    statement.setInt(index, exam.argueHours); index += 1
    statement.setString(index, exam.argueDeadline.orNull); index += 1
    statement.setString(index, exam.status); index += 1
    statement.setString(index, exam.questions.asJson.noSpaces); index += 1
    statement.setString(index, exam.gradingRegions.asJson.noSpaces); index += 1
    statement.setString(index, exam.sheetTemplateImage.orNull); index += 1
    statement.setString(index, exam.createdBy); index += 1
    statement.setString(index, exam.createdAt); index += 1
    statement.setString(index, exam.releasedAt.orNull)

  private def readExam(resultSet: ResultSet): Exam =
    Exam(
      id = resultSet.getString("id"),
      cohortId = resultSet.getString("cohort_id"),
      name = resultSet.getString("name"),
      description = resultSet.getString("description"),
      scheduledStart = resultSet.getString("scheduled_start"),
      scheduledEnd = resultSet.getString("scheduled_end"),
      argueHours = resultSet.getInt("argue_hours"),
      argueDeadline = Option(resultSet.getString("argue_deadline")),
      status = resultSet.getString("status"),
      questions = decode[List[ExamQuestion]](resultSet.getString("questions")).getOrElse(Nil),
      gradingRegions = decode[Map[String, GradingRegion]](resultSet.getString("grading_regions")).getOrElse(Map.empty),
      sheetTemplateImage = Option(resultSet.getString("sheet_template_image")),
      createdBy = resultSet.getString("created_by"),
      createdAt = resultSet.getString("created_at"),
      releasedAt = Option(resultSet.getString("released_at"))
    )

  // ---------- 答题卡 ----------

  private val insertSheetSql: String =
    """
      |insert into edu_answer_sheets (id, exam_id, student_id, student_name, image_data, status, raw_total, converted_total, uploaded_by_name, uploaded_at, graded_at)
      |values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      |""".stripMargin

  private val deleteSheetsByExamAndStudentSql: String =
    """
      |delete from edu_answer_sheets where exam_id = ? and student_id = ?
      |""".stripMargin

  private val updateSheetTotalsSql: String =
    """
      |update edu_answer_sheets set status = ?, raw_total = ?, converted_total = ?, graded_at = ? where id = ?
      |""".stripMargin

  private val listSheetsByExamSql: String =
    """
      |select id, exam_id, student_id, student_name, image_data, status, raw_total, converted_total, uploaded_by_name, uploaded_at, graded_at
      |from edu_answer_sheets where exam_id = ? order by student_name asc
      |""".stripMargin

  private val findSheetByIdSql: String =
    """
      |select id, exam_id, student_id, student_name, image_data, status, raw_total, converted_total, uploaded_by_name, uploaded_at, graded_at
      |from edu_answer_sheets where id = ?
      |""".stripMargin

  def upsertSheet(connection: Connection, sheet: AnswerSheet): IO[Unit] =
    for
      _ <- IO.blocking {
        val statement = connection.prepareStatement(deleteSheetsByExamAndStudentSql)
        try
          statement.setString(1, sheet.examId)
          statement.setString(2, sheet.studentId)
          statement.executeUpdate()
          ()
        finally statement.close()
      }
      _ <- IO.blocking {
        val statement = connection.prepareStatement(insertSheetSql)
        try
          statement.setString(1, sheet.id)
          statement.setString(2, sheet.examId)
          statement.setString(3, sheet.studentId)
          statement.setString(4, sheet.studentName)
          statement.setString(5, sheet.imageDataUrl)
          statement.setString(6, sheet.status)
          statement.setObject(7, sheet.rawTotal.map(Double.box).orNull)
          statement.setObject(8, sheet.convertedTotal.map(Double.box).orNull)
          statement.setString(9, sheet.uploadedByName)
          statement.setString(10, sheet.uploadedAt)
          statement.setString(11, sheet.gradedAt.orNull)
          statement.executeUpdate()
          ()
        finally statement.close()
      }
    yield ()

  def updateSheetTotals(connection: Connection, sheetId: String, status: String, rawTotal: Option[Double], convertedTotal: Option[Double], gradedAt: Option[String]): IO[Unit] =
    IO.blocking {
      val statement = connection.prepareStatement(updateSheetTotalsSql)
      try
        statement.setString(1, status)
        statement.setObject(2, rawTotal.map(Double.box).orNull)
        statement.setObject(3, convertedTotal.map(Double.box).orNull)
        statement.setString(4, gradedAt.orNull)
        statement.setString(5, sheetId)
        statement.executeUpdate()
        ()
      finally statement.close()
    }

  def listSheetsByExam(connection: Connection, examId: String): IO[List[AnswerSheet]] =
    selectList(connection.prepareStatement(listSheetsByExamSql))(_.setString(1, examId))(readSheet)

  def findSheetById(connection: Connection, id: String): IO[Option[AnswerSheet]] =
    queryOne(connection.prepareStatement(findSheetByIdSql))(_.setString(1, id))(readSheet)

  private val findSheetByExamAndStudentSql: String =
    """
      |select id, exam_id, student_id, student_name, image_data, status, raw_total, converted_total, uploaded_by_name, uploaded_at, graded_at
      |from edu_answer_sheets where exam_id = ? and student_id = ?
      |""".stripMargin

  def findSheetByExamAndStudent(connection: Connection, examId: String, studentId: String): IO[Option[AnswerSheet]] =
    queryOne(connection.prepareStatement(findSheetByExamAndStudentSql)) { statement =>
      statement.setString(1, examId)
      statement.setString(2, studentId)
    }(readSheet)

  private val findUserNameByIdSql: String =
    """
      |select name from edu_users where id = ?
      |""".stripMargin

  def findUserNameById(connection: Connection, userId: String): IO[Option[String]] =
    queryOne(connection.prepareStatement(findUserNameByIdSql))(_.setString(1, userId))(resultSet => resultSet.getString("name"))

  private val findUserByEmailSql: String =
    """
      |select id, name from edu_users where lower(email) = lower(?)
      |""".stripMargin

  def findUserByEmail(connection: Connection, email: String): IO[Option[(String, String)]] =
    queryOne(connection.prepareStatement(findUserByEmailSql))(_.setString(1, email))(resultSet =>
      (resultSet.getString("id"), resultSet.getString("name"))
    )

  private def readSheet(resultSet: ResultSet): AnswerSheet =
    AnswerSheet(
      id = resultSet.getString("id"),
      examId = resultSet.getString("exam_id"),
      studentId = resultSet.getString("student_id"),
      studentName = resultSet.getString("student_name"),
      imageDataUrl = resultSet.getString("image_data"),
      status = resultSet.getString("status"),
      rawTotal = Option(resultSet.getObject("raw_total")).map(v => BigDecimal(v.toString).doubleValue()),
      convertedTotal = Option(resultSet.getObject("converted_total")).map(v => BigDecimal(v.toString).doubleValue()),
      uploadedByName = resultSet.getString("uploaded_by_name"),
      uploadedAt = resultSet.getString("uploaded_at"),
      gradedAt = Option(resultSet.getString("graded_at"))
    )

  // ---------- 判分 ----------

  private val insertScoreSql: String =
    """
      |insert into edu_question_scores (id, exam_id, sheet_id, question_id, score, max_score, converted_score, comment, grader_id, grader_name, graded_at, adjusted)
      |values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      |""".stripMargin

  private val deleteScoreSql: String =
    """
      |delete from edu_question_scores where sheet_id = ? and question_id = ?
      |""".stripMargin

  private val updateScoreSql: String =
    """
      |update edu_question_scores set score = ?, converted_score = ?, comment = ?, grader_id = ?, grader_name = ?, graded_at = ?, adjusted = ? where id = ?
      |""".stripMargin

  private val listScoresByExamSql: String =
    """
      |select id, exam_id, sheet_id, question_id, score, max_score, converted_score, comment, grader_id, grader_name, graded_at, adjusted
      |from edu_question_scores where exam_id = ?
      |""".stripMargin

  private val listScoresBySheetSql: String =
    """
      |select id, exam_id, sheet_id, question_id, score, max_score, converted_score, comment, grader_id, grader_name, graded_at, adjusted
      |from edu_question_scores where sheet_id = ?
      |""".stripMargin

  def insertScore(connection: Connection, entry: QuestionScoreEntry): IO[Unit] =
    IO.blocking {
      val statement = connection.prepareStatement(insertScoreSql)
      try
        statement.setString(1, entry.id)
        statement.setString(2, entry.examId)
        statement.setString(3, entry.sheetId)
        statement.setString(4, entry.questionId)
        statement.setDouble(5, entry.score)
        statement.setDouble(6, entry.maxScore)
        statement.setDouble(7, entry.convertedScore)
        statement.setString(8, entry.comment)
        statement.setString(9, entry.graderId)
        statement.setString(10, entry.graderName)
        statement.setString(11, entry.gradedAt)
        statement.setBoolean(12, entry.adjusted)
        statement.executeUpdate()
        ()
      finally statement.close()
    }

  def deleteScore(connection: Connection, sheetId: String, questionId: String): IO[Unit] =
    IO.blocking {
      val statement = connection.prepareStatement(deleteScoreSql)
      try
        statement.setString(1, sheetId)
        statement.setString(2, questionId)
        statement.executeUpdate()
        ()
      finally statement.close()
    }

  def updateScore(connection: Connection, entry: QuestionScoreEntry): IO[Unit] =
    IO.blocking {
      val statement = connection.prepareStatement(updateScoreSql)
      try
        statement.setDouble(1, entry.score)
        statement.setDouble(2, entry.convertedScore)
        statement.setString(3, entry.comment)
        statement.setString(4, entry.graderId)
        statement.setString(5, entry.graderName)
        statement.setString(6, entry.gradedAt)
        statement.setBoolean(7, entry.adjusted)
        statement.setString(8, entry.id)
        statement.executeUpdate()
        ()
      finally statement.close()
    }

  def listScoresByExam(connection: Connection, examId: String): IO[List[QuestionScoreEntry]] =
    selectList(connection.prepareStatement(listScoresByExamSql))(_.setString(1, examId))(readScore)

  def listScoresBySheet(connection: Connection, sheetId: String): IO[List[QuestionScoreEntry]] =
    selectList(connection.prepareStatement(listScoresBySheetSql))(_.setString(1, sheetId))(readScore)

  private def readScore(resultSet: ResultSet): QuestionScoreEntry =
    QuestionScoreEntry(
      id = resultSet.getString("id"),
      examId = resultSet.getString("exam_id"),
      sheetId = resultSet.getString("sheet_id"),
      questionId = resultSet.getString("question_id"),
      score = resultSet.getDouble("score"),
      maxScore = resultSet.getDouble("max_score"),
      convertedScore = resultSet.getDouble("converted_score"),
      comment = resultSet.getString("comment"),
      graderId = resultSet.getString("grader_id"),
      graderName = resultSet.getString("grader_name"),
      gradedAt = resultSet.getString("graded_at"),
      adjusted = resultSet.getBoolean("adjusted")
    )

  // ---------- 争分工单 ----------

  private val insertArgueSql: String =
    """
      |insert into edu_exam_argues (id, exam_id, sheet_id, student_id, student_name, question_id, question_title, reason, status, response, handled_by_name, created_at, resolved_at)
      |values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      |""".stripMargin

  private val resolveArgueSql: String =
    """
      |update edu_exam_argues set status = ?, response = ?, handled_by_name = ?, resolved_at = ? where id = ?
      |""".stripMargin

  private val listArguesSql: String =
    """
      |select id, exam_id, sheet_id, student_id, student_name, question_id, question_title, reason, status, response, handled_by_name, created_at, resolved_at
      |from edu_exam_argues
      |""".stripMargin

  private val findArgueByIdSql: String =
    """
      |select id, exam_id, sheet_id, student_id, student_name, question_id, question_title, reason, status, response, handled_by_name, created_at, resolved_at
      |from edu_exam_argues where id = ?
      |""".stripMargin

  def insertArgue(connection: Connection, ticket: ArgueTicket): IO[Unit] =
    IO.blocking {
      val statement = connection.prepareStatement(insertArgueSql)
      try
        statement.setString(1, ticket.id)
        statement.setString(2, ticket.examId)
        statement.setString(3, ticket.sheetId)
        statement.setString(4, ticket.studentId)
        statement.setString(5, ticket.studentName)
        statement.setString(6, ticket.questionId)
        statement.setString(7, ticket.questionTitle)
        statement.setString(8, ticket.reason)
        statement.setString(9, ticket.status)
        statement.setString(10, ticket.response)
        statement.setString(11, ticket.handledByName.orNull)
        statement.setString(12, ticket.createdAt)
        statement.setString(13, ticket.resolvedAt.orNull)
        statement.executeUpdate()
        ()
      finally statement.close()
    }

  def resolveArgue(connection: Connection, ticketId: String, status: String, response: String, handledByName: String, resolvedAt: String): IO[Unit] =
    IO.blocking {
      val statement = connection.prepareStatement(resolveArgueSql)
      try
        statement.setString(1, status)
        statement.setString(2, response)
        statement.setString(3, handledByName)
        statement.setString(4, resolvedAt)
        statement.setString(5, ticketId)
        statement.executeUpdate()
        ()
      finally statement.close()
    }

  def listArgues(connection: Connection, examId: Option[String]): IO[List[ArgueTicket]] =
    examId match
      case Some(value) =>
        selectList(connection.prepareStatement(listArguesSql + " where exam_id = ? order by created_at desc")) { statement =>
          statement.setString(1, value)
        }(readArgue)
      case None =>
        selectList(connection.prepareStatement(listArguesSql + " order by created_at desc"))(_ => ())(readArgue)

  def findArgueById(connection: Connection, id: String): IO[Option[ArgueTicket]] =
    queryOne(connection.prepareStatement(findArgueByIdSql))(_.setString(1, id))(readArgue)

  private def readArgue(resultSet: ResultSet): ArgueTicket =
    ArgueTicket(
      id = resultSet.getString("id"),
      examId = resultSet.getString("exam_id"),
      sheetId = resultSet.getString("sheet_id"),
      studentId = resultSet.getString("student_id"),
      studentName = resultSet.getString("student_name"),
      questionId = resultSet.getString("question_id"),
      questionTitle = resultSet.getString("question_title"),
      reason = resultSet.getString("reason"),
      status = resultSet.getString("status"),
      response = resultSet.getString("response"),
      handledByName = Option(resultSet.getString("handled_by_name")),
      createdAt = resultSet.getString("created_at"),
      resolvedAt = Option(resultSet.getString("resolved_at"))
    )

  // ---------- 智能分析 ----------

  private val insertAnalysisSql: String =
    """
      |insert into edu_exam_analyses (id, exam_id, student_id, student_name, source, model, content, generated_at)
      |values (?, ?, ?, ?, ?, ?, ?, ?)
      |""".stripMargin

  private val deleteAnalysisSql: String =
    """
      |delete from edu_exam_analyses where exam_id = ? and student_id = ?
      |""".stripMargin

  private val findAnalysisSql: String =
    """
      |select id, exam_id, student_id, student_name, source, model, content, generated_at
      |from edu_exam_analyses where exam_id = ? and student_id = ?
      |""".stripMargin

  def upsertAnalysis(connection: Connection, analysis: ExamAnalysis): IO[Unit] =
    for
      _ <- IO.blocking {
        val statement = connection.prepareStatement(deleteAnalysisSql)
        try
          statement.setString(1, analysis.examId)
          statement.setString(2, analysis.studentId)
          statement.executeUpdate()
          ()
        finally statement.close()
      }
      _ <- IO.blocking {
        val statement = connection.prepareStatement(insertAnalysisSql)
        try
          statement.setString(1, analysis.id)
          statement.setString(2, analysis.examId)
          statement.setString(3, analysis.studentId)
          statement.setString(4, analysis.studentName)
          statement.setString(5, analysis.source)
          statement.setString(6, analysis.model)
          statement.setString(7, analysis.content.asJson.noSpaces)
          statement.setString(8, analysis.generatedAt)
          statement.executeUpdate()
          ()
        finally statement.close()
      }
    yield ()

  def findAnalysis(connection: Connection, examId: String, studentId: String): IO[Option[ExamAnalysis]] =
    queryOne(connection.prepareStatement(findAnalysisSql)) { statement =>
      statement.setString(1, examId)
      statement.setString(2, studentId)
    }(readAnalysis)

  private def readAnalysis(resultSet: ResultSet): ExamAnalysis =
    ExamAnalysis(
      id = resultSet.getString("id"),
      examId = resultSet.getString("exam_id"),
      studentId = resultSet.getString("student_id"),
      studentName = resultSet.getString("student_name"),
      source = resultSet.getString("source"),
      model = resultSet.getString("model"),
      content = decode[ExamAnalysisContent](resultSet.getString("content")).getOrElse(ExamAnalysisContent("分析内容解析失败。", Nil, Nil, Nil, Nil)),
      generatedAt = resultSet.getString("generated_at")
    )

  // ---------- 报名线索 ----------

  private val insertLeadSql: String =
    """
      |insert into edu_enrollment_leads (id, student_name, contact, grade_level, target_stage, course_interest, message, status, created_at)
      |values (?, ?, ?, ?, ?, ?, ?, ?, ?)
      |""".stripMargin

  private val listLeadsSql: String =
    """
      |select id, student_name, contact, grade_level, target_stage, course_interest, message, status, created_at
      |from edu_enrollment_leads order by created_at desc
      |""".stripMargin

  def insertLead(connection: Connection, lead: EnrollmentLead): IO[Unit] =
    IO.blocking {
      val statement = connection.prepareStatement(insertLeadSql)
      try
        statement.setString(1, lead.id)
        statement.setString(2, lead.studentName)
        statement.setString(3, lead.contact)
        statement.setString(4, lead.gradeLevel)
        statement.setString(5, lead.targetStage)
        statement.setString(6, lead.courseInterest)
        statement.setString(7, lead.message)
        statement.setString(8, lead.status)
        statement.setString(9, lead.createdAt)
        statement.executeUpdate()
        ()
      finally statement.close()
    }

  def listLeads(connection: Connection): IO[List[EnrollmentLead]] =
    selectList(connection, listLeadsSql)(readLead)

  private def readLead(resultSet: ResultSet): EnrollmentLead =
    EnrollmentLead(
      id = resultSet.getString("id"),
      studentName = resultSet.getString("student_name"),
      contact = resultSet.getString("contact"),
      gradeLevel = resultSet.getString("grade_level"),
      targetStage = resultSet.getString("target_stage"),
      courseInterest = resultSet.getString("course_interest"),
      message = resultSet.getString("message"),
      status = resultSet.getString("status"),
      createdAt = resultSet.getString("created_at")
    )

  // ---------- 通用查询工具 ----------

  private def selectList[A](connection: Connection, sql: String)(read: ResultSet => A): IO[List[A]] =
    IO.blocking {
      val statement = connection.createStatement()
      try
        val resultSet = statement.executeQuery(sql)
        collect(resultSet)(read)
      finally statement.close()
    }

  private def selectList[A](statement: PreparedStatement)(bind: PreparedStatement => Unit)(read: ResultSet => A): IO[List[A]] =
    IO.blocking {
      try
        bind(statement)
        val resultSet = statement.executeQuery()
        try collect(resultSet)(read)
        finally resultSet.close()
      finally statement.close()
    }

  private def collect[A](resultSet: ResultSet)(read: ResultSet => A): List[A] =
    val buffer = mutable.ListBuffer.empty[A]
    while resultSet.next() do buffer += read(resultSet)
    buffer.toList

  private def queryOne[A](statement: PreparedStatement)(bind: PreparedStatement => Unit)(reader: ResultSet => A): IO[Option[A]] =
    IO.blocking {
      try
        bind(statement)
        val resultSet = statement.executeQuery()
        try
          if resultSet.next() then Some(reader(resultSet))
          else None
        finally resultSet.close()
      finally statement.close()
    }
