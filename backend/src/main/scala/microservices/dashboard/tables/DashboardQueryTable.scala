package microservices.dashboard.tables

import cats.effect.IO
import io.circe.parser.decode
import microservices.auth.objects.{UserProfile, UserRole}
import microservices.course.learning.objects.{LessonProgressStatus, QuizQuestion, QuizStatus, SubmissionStatus}
import microservices.dashboard.objects.*

import java.sql.{Connection, PreparedStatement, ResultSet}

object DashboardQueryTable:

  private val listTeacherTasksForAssigneeSql: String =
    "select id, title, assignee, status from edu_teacher_tasks where assignee = ?"

  private val listNoTeacherTasksSql: String =
    "select id, title, assignee, status from edu_teacher_tasks where 1 = 0"

  private val listAllTeacherTasksSql: String =
    "select id, title, assignee, status from edu_teacher_tasks"

  private val listStudentAssignmentsByCourseIdsSqlTemplate: String =
    """
      |select course_id, student_id, submission_status, score, late_submitted
      |from edu_assignments
      |where student_id is not null and course_id in (%s)
      |""".stripMargin

  private val listStudentQuizzesByCourseIdsSqlTemplate: String =
    """
      |select course_id, student_id, title, status, score, question_bank_json, wrong_question_ids_json
      |from edu_quizzes
      |where student_id is not null and course_id in (%s)
      |""".stripMargin

  private val listStudentLessonProgressByCourseIdsSqlTemplate: String =
    """
      |select modules.course_id,
      |       progress.user_id,
      |       lessons.id as lesson_id,
      |       lessons.title as lesson_title,
      |       modules.title as module_title,
      |       lessons.required_study_minutes,
      |       progress.status,
      |       progress.study_minutes
      |from edu_lesson_progress progress
      |join edu_course_lessons lessons on progress.lesson_id = lessons.id
      |join edu_course_modules modules on lessons.module_id = modules.id
      |where modules.course_id in (%s)
      |""".stripMargin

  def listTeacherTasks(connection: Connection, currentUser: UserProfile): IO[List[TeacherTask]] =
    val sql =
      currentUser.role match
        case UserRole.Teacher | UserRole.Assistant => listTeacherTasksForAssigneeSql
        case UserRole.Student => listNoTeacherTasksSql
        case _ => listAllTeacherTasksSql
    selectPreparedList(connection.prepareStatement(sql)) { statement =>
      currentUser.role match
        case UserRole.Teacher | UserRole.Assistant => statement.setString(1, currentUser.name)
        case _ => ()
    }(readTeacherTask)

  def listStudentAssignments(connection: Connection, courseIds: List[String]): IO[List[StudentAssignmentSnapshot]] =
    if courseIds.isEmpty then IO.pure(Nil)
    else
      val sql = listStudentAssignmentsByCourseIdsSqlTemplate.format(placeholders(courseIds))
      selectPreparedList(connection.prepareStatement(sql))(bindIds(courseIds))(readStudentAssignment)

  def listStudentQuizzes(connection: Connection, courseIds: List[String]): IO[List[StudentQuizSnapshot]] =
    if courseIds.isEmpty then IO.pure(Nil)
    else
      val sql = listStudentQuizzesByCourseIdsSqlTemplate.format(placeholders(courseIds))
      selectPreparedList(connection.prepareStatement(sql))(bindIds(courseIds))(readStudentQuiz)

  def listStudentLessonProgress(connection: Connection, courseIds: List[String]): IO[List[StudentLessonProgressSnapshot]] =
    if courseIds.isEmpty then IO.pure(Nil)
    else
      val sql = listStudentLessonProgressByCourseIdsSqlTemplate.format(placeholders(courseIds))
      selectPreparedList(connection.prepareStatement(sql))(bindIds(courseIds))(readStudentLessonProgress)

  def listTeachingInsightSnapshots(
    connection: Connection,
    courseIds: List[String]
  ): IO[(List[StudentAssignmentSnapshot], List[StudentQuizSnapshot], List[StudentLessonProgressSnapshot])] =
    for
      assignments <- listStudentAssignments(connection, courseIds)
      quizzes <- listStudentQuizzes(connection, courseIds)
      lessonProgress <- listStudentLessonProgress(connection, courseIds)
    yield (assignments, quizzes, lessonProgress)

  private def placeholders(values: List[String]): String =
    List.fill(values.size)("?").mkString(", ")

  private def bindIds(values: List[String])(statement: PreparedStatement): Unit =
    values.zipWithIndex.foreach { case (value, index) => statement.setObject(index + 1, value) }

  private def selectPreparedList[A](statement: PreparedStatement)(bind: PreparedStatement => Unit)(read: ResultSet => A): IO[List[A]] =
    IO.blocking {
      try
        bind(statement)
        val resultSet = statement.executeQuery()
        try
          val buffer = scala.collection.mutable.ListBuffer.empty[A]
          while resultSet.next() do buffer += read(resultSet)
          buffer.toList
        finally resultSet.close()
      finally statement.close()
    }

  private def readTeacherTask(resultSet: ResultSet): TeacherTask =
    TeacherTask(
      id = resultSet.getString("id"),
      title = resultSet.getString("title"),
      assignee = resultSet.getString("assignee"),
      status = TeacherTaskStatus.fromString(resultSet.getString("status")).getOrElse(TeacherTaskStatus.Pending)
    )

  private def readStudentAssignment(resultSet: ResultSet): StudentAssignmentSnapshot =
    StudentAssignmentSnapshot(
      courseId = resultSet.getString("course_id"),
      studentId = resultSet.getString("student_id"),
      submissionStatus = SubmissionStatus.fromString(resultSet.getString("submission_status")).getOrElse(SubmissionStatus.Pending),
      score = Option(resultSet.getObject("score")).map(_ => resultSet.getInt("score")),
      lateSubmitted = resultSet.getBoolean("late_submitted")
    )

  private def readStudentQuiz(resultSet: ResultSet): StudentQuizSnapshot =
    val questionBankJson = Option(resultSet.getString("question_bank_json")).filter(_.nonEmpty).getOrElse("[]")
    val wrongIdsJson = Option(resultSet.getString("wrong_question_ids_json")).filter(_.nonEmpty).getOrElse("[]")
    StudentQuizSnapshot(
      courseId = resultSet.getString("course_id"),
      studentId = resultSet.getString("student_id"),
      title = resultSet.getString("title"),
      status = QuizStatus.fromString(resultSet.getString("status")).getOrElse(QuizStatus.Upcoming),
      score = Option(resultSet.getObject("score")).map(_ => resultSet.getInt("score")),
      questionBank = decode[List[QuizQuestion]](questionBankJson).getOrElse(Nil),
      wrongQuestionIds = decode[List[String]](wrongIdsJson).getOrElse(Nil)
    )

  private def readStudentLessonProgress(resultSet: ResultSet): StudentLessonProgressSnapshot =
    StudentLessonProgressSnapshot(
      courseId = resultSet.getString("course_id"),
      studentId = resultSet.getString("user_id"),
      lessonId = resultSet.getString("lesson_id"),
      lessonTitle = resultSet.getString("lesson_title"),
      moduleTitle = resultSet.getString("module_title"),
      completed = LessonProgressStatus.fromString(resultSet.getString("status")).contains(LessonProgressStatus.Completed),
      studyMinutes = resultSet.getInt("study_minutes"),
      requiredStudyMinutes = resultSet.getInt("required_study_minutes")
    )
