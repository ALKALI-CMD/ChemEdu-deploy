package microservices.course.learning.tables

import cats.effect.IO
import io.circe.parser.decode
import io.circe.syntax.*
import microservices.course.learning.objects.*

import java.sql.{Connection, ResultSet}
import scala.collection.mutable.ListBuffer

private[learning] object QuizTable:

  val schemaStatements: List[String] = List(
    "alter table edu_quizzes add column if not exists subjective_answer text",
    "alter table edu_quizzes add column if not exists submitted_at varchar(80)",
    "alter table edu_quizzes add column if not exists objective_score integer",
    "alter table edu_quizzes add column if not exists subjective_score integer",
    "alter table edu_quizzes add column if not exists subjective_feedback text",
    "alter table edu_quizzes add column if not exists reviewer_name varchar(120)",
    "alter table edu_quizzes add column if not exists reviewed_at varchar(80)",
    "alter table edu_quizzes add column if not exists draw_count integer",
    "alter table edu_quizzes add column if not exists shuffle_questions boolean not null default false",
    "alter table edu_quizzes add column if not exists shuffle_options boolean not null default false",
    "alter table edu_quizzes add column if not exists question_bank_json text not null default '[]'",
    "alter table edu_quizzes add column if not exists objective_answer_record_json text not null default '[]'",
    "alter table edu_quizzes add column if not exists wrong_question_ids_json text not null default '[]'"
  )

  val quizProjectionSql: String =
    """
      |select id, course_id, title, duration_minutes, objective_question_count, subjective_question_count,
      |draw_count, shuffle_questions, shuffle_options, status, score, objective_score, subjective_score, subjective_answer, subjective_feedback, reviewer_name, reviewed_at, submitted_at, question_bank_json, objective_answer_record_json,
      |wrong_question_ids_json
      |from edu_quizzes
      |""".stripMargin

  val listStudentQuizzesSql: String =
    quizProjectionSql + "where student_id = ?"

  val listAllSubmittedQuizzesSql: String =
    quizProjectionSql + "where student_id is not null"

  val countStudentCourseQuizzesSql: String =
    "select count(*) from edu_quizzes where student_id = ? and course_id = ?"

  val listQuizTemplatesForCloneSql: String =
    """
      |select id, title, duration_minutes, objective_question_count, subjective_question_count,
      |draw_count, shuffle_questions, shuffle_options, question_bank_json
      |from edu_quizzes
      |where course_id = ? and student_id is null
      |order by title asc, id asc
      |""".stripMargin

  val insertQuizSql: String =
    """
      |insert into edu_quizzes (
      |  id, course_id, student_id, title, duration_minutes, objective_question_count,
      |  subjective_question_count, draw_count, shuffle_questions, shuffle_options,
      |  status, score, question_bank_json, objective_answer_record_json, wrong_question_ids_json
      |) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      |""".stripMargin

  val submitQuizSql: String =
    """
      |update edu_quizzes
      |set score = ?, objective_score = ?, subjective_score = null, subjective_answer = ?, subjective_feedback = null,
      |reviewer_name = null, reviewed_at = null, submitted_at = ?, status = ?, objective_answer_record_json = ?, wrong_question_ids_json = ?
      |where id = ?
      |""".stripMargin

  val reviewQuizSql: String =
    """
      |update edu_quizzes
      |set score = ?, subjective_score = ?, subjective_feedback = ?, reviewer_name = ?, reviewed_at = ?
      |where id = ?
      |""".stripMargin

  val findStudentQuizSql: String =
    quizProjectionSql + "where id = ? and student_id = ?"

  val findQuizByIdSql: String =
    quizProjectionSql + "where id = ?"

  private[learning] final case class QuizTemplateRow(
    id: String,
    title: String,
    durationMinutes: Int,
    objectiveQuestionCount: Int,
    subjectiveQuestionCount: Int,
    drawCount: Option[Int],
    shuffleQuestions: Boolean,
    shuffleOptions: Boolean,
    questionBank: List[QuizQuestion]
  )

  private[learning] def insertQuizForStudent(
    connection: Connection,
    quizId: String,
    courseId: String,
    studentId: Option[String],
    title: String,
    durationMinutes: Int,
    objectiveQuestionCount: Int,
    subjectiveQuestionCount: Int,
    drawCount: Option[Int],
    shuffleQuestions: Boolean,
    shuffleOptions: Boolean,
    questionBank: List[QuizQuestion]
  ): IO[Unit] =
    using(connection.prepareStatement(insertQuizSql)) { statement =>
      IO.blocking {
        statement.setObject(1, quizId)
        statement.setObject(2, courseId)
        statement.setObject(3, studentId.orNull)
        statement.setObject(4, title)
        statement.setObject(5, durationMinutes)
        statement.setObject(6, objectiveQuestionCount)
        statement.setObject(7, subjectiveQuestionCount)
        statement.setObject(8, drawCount.map(Int.box).orNull)
        statement.setObject(9, shuffleQuestions)
        statement.setObject(10, shuffleOptions)
        statement.setObject(11, QuizStatus.toString(QuizStatus.Upcoming))
        statement.setObject(12, null)
        statement.setObject(13, encodeQuestionBank(questionBank))
        statement.setObject(14, "[]")
        statement.setObject(15, "[]")
        statement.executeUpdate()
      }
    }

  private[learning] def findStudentQuiz(connection: Connection, quizId: String, studentId: String): IO[Option[Quiz]] =
    using(connection.prepareStatement(findStudentQuizSql)) { statement =>
      IO.blocking {
        statement.setObject(1, quizId)
        statement.setObject(2, studentId)
        val resultSet = statement.executeQuery()
        try if resultSet.next() then Some(readQuiz(resultSet)) else None
        finally resultSet.close()
      }
    }

  private[learning] def listStudentQuizzes(connection: Connection, studentId: String): IO[List[Quiz]] =
    selectPreparedList(connection, listStudentQuizzesSql) { statement =>
      statement.setString(1, studentId)
    }(readQuiz)

  private[learning] def listAllSubmittedQuizzes(connection: Connection): IO[List[Quiz]] =
    selectList(connection, listAllSubmittedQuizzesSql)(readQuiz)

  private[learning] def countStudentCourseQuizzes(connection: Connection, studentId: String, courseId: String): IO[Int] =
    using(connection.prepareStatement(countStudentCourseQuizzesSql)) { statement =>
      IO.blocking {
        statement.setObject(1, studentId)
        statement.setObject(2, courseId)
        val resultSet = statement.executeQuery()
        try if resultSet.next() then resultSet.getInt(1) else 0
        finally resultSet.close()
      }
    }

  private[learning] def listQuizTemplatesForClone(connection: Connection, courseId: String): IO[List[QuizTemplateRow]] =
    using(connection.prepareStatement(listQuizTemplatesForCloneSql)) { statement =>
      IO.blocking {
        statement.setObject(1, courseId)
        val resultSet = statement.executeQuery()
        val templates = ListBuffer.empty[QuizTemplateRow]
        try
          while resultSet.next() do
            templates += QuizTemplateRow(
              id = resultSet.getString("id"),
              title = resultSet.getString("title"),
              durationMinutes = resultSet.getInt("duration_minutes"),
              objectiveQuestionCount = resultSet.getInt("objective_question_count"),
              subjectiveQuestionCount = resultSet.getInt("subjective_question_count"),
              drawCount = Option(resultSet.getObject("draw_count")).map(_.toString.toInt),
              shuffleQuestions = resultSet.getBoolean("shuffle_questions"),
              shuffleOptions = resultSet.getBoolean("shuffle_options"),
              questionBank = decodeQuestionBank(resultSet.getString("question_bank_json"))
            )
          templates.toList
        finally resultSet.close()
      }
    }

  private[learning] def findQuizById(connection: Connection, quizId: String): IO[Option[Quiz]] =
    using(connection.prepareStatement(findQuizByIdSql)) { statement =>
      IO.blocking {
        statement.setObject(1, quizId)
        val resultSet = statement.executeQuery()
        try if resultSet.next() then Some(readQuiz(resultSet)) else None
        finally resultSet.close()
      }
    }

  private[learning] def submitQuiz(
    connection: Connection,
    quizId: String,
    computedScore: Int,
    subjectiveAnswer: Option[String],
    submittedAt: String,
    answerRecord: List[QuizAnswerRecord],
    wrongQuestionIds: List[String]
  ): IO[Unit] =
    using(connection.prepareStatement(submitQuizSql)) { statement =>
      IO.blocking {
        statement.setObject(1, computedScore)
        statement.setObject(2, computedScore)
        statement.setObject(3, subjectiveAnswer.orNull)
        statement.setObject(4, submittedAt)
        statement.setObject(5, QuizStatus.toString(QuizStatus.Finished))
        statement.setObject(6, encodeQuizAnswerRecord(answerRecord))
        statement.setObject(7, encodeStringList(wrongQuestionIds))
        statement.setObject(8, quizId)
        statement.executeUpdate()
      }
    }

  private[learning] def reviewQuiz(
    connection: Connection,
    quizId: String,
    finalScore: Int,
    subjectiveScore: Int,
    feedback: Option[String],
    reviewerName: String,
    reviewedAt: String
  ): IO[Unit] =
    using(connection.prepareStatement(reviewQuizSql)) { statement =>
      IO.blocking {
        statement.setObject(1, finalScore)
        statement.setObject(2, subjectiveScore)
        statement.setObject(3, feedback.map(_.trim).filter(_.nonEmpty).orNull)
        statement.setObject(4, reviewerName)
        statement.setObject(5, reviewedAt)
        statement.setObject(6, quizId)
        statement.executeUpdate()
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

  private[learning] def readQuiz(resultSet: ResultSet): Quiz =
    Quiz(
      id = resultSet.getString("id"),
      courseId = resultSet.getString("course_id"),
      title = resultSet.getString("title"),
      durationMinutes = resultSet.getInt("duration_minutes"),
      objectiveQuestionCount = resultSet.getInt("objective_question_count"),
      subjectiveQuestionCount = resultSet.getInt("subjective_question_count"),
      drawCount = Option(resultSet.getObject("draw_count")).map(_.toString.toInt),
      shuffleQuestions = resultSet.getBoolean("shuffle_questions"),
      shuffleOptions = resultSet.getBoolean("shuffle_options"),
      status = QuizStatus.fromString(resultSet.getString("status")).getOrElse(QuizStatus.Upcoming),
      score = Option(resultSet.getObject("score")).map(_.toString.toInt),
      objectiveScore = Option(resultSet.getObject("objective_score")).map(_.toString.toInt),
      subjectiveScore = Option(resultSet.getObject("subjective_score")).map(_.toString.toInt),
      subjectiveAnswer = Option(resultSet.getString("subjective_answer")).filter(_.nonEmpty),
      subjectiveFeedback = Option(resultSet.getString("subjective_feedback")).filter(_.nonEmpty),
      reviewerName = Option(resultSet.getString("reviewer_name")).filter(_.nonEmpty),
      reviewedAt = Option(resultSet.getString("reviewed_at")).filter(_.nonEmpty),
      submittedAt = Option(resultSet.getString("submitted_at")).filter(_.nonEmpty),
      questionBank = decodeQuestionBank(resultSet.getString("question_bank_json")),
      objectiveAnswerRecord = decodeQuizAnswerRecord(resultSet.getString("objective_answer_record_json")),
      wrongQuestionIds = decodeStringList(resultSet.getString("wrong_question_ids_json"))
    )

  private[learning] def encodeQuestionBank(value: List[QuizQuestion]): String =
    value.asJson.noSpaces

  private[learning] def decodeQuestionBank(value: String): List[QuizQuestion] =
    decodeJsonList[QuizQuestion](value)

  private[learning] def encodeQuizAnswerRecord(value: List[QuizAnswerRecord]): String =
    value.asJson.noSpaces

  private[learning] def encodeStringList(value: List[String]): String =
    value.asJson.noSpaces

  private def decodeQuizAnswerRecord(value: String): List[QuizAnswerRecord] =
    decodeJsonList[QuizAnswerRecord](value)

  private def decodeStringList(value: String): List[String] =
    decodeJsonList[String](value)

  private def decodeJsonList[A: io.circe.Decoder](value: String): List[A] =
    Option(value)
      .filter(_.trim.nonEmpty)
      .flatMap(raw => decode[List[A]](raw).toOption)
      .getOrElse(Nil)
