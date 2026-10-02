package microservices.course.enrollment.tables

import cats.effect.IO
import microservices.admin.objects.OrderStatus
import microservices.auth.objects.{UserProfile, UserRole}
import microservices.course.enrollment.objects.{CourseEnrollment, WaitlistEntry}

import java.sql.{Connection, PreparedStatement, ResultSet}
import java.time.Instant
import scala.collection.mutable

private[enrollment] object EnrollmentTable:
  private val schemaStatements: List[String] = List(
    """
      |create table if not exists edu_enrollments (
      |  user_id varchar(64) not null references edu_users(id) on delete cascade,
      |  course_id varchar(64) not null references edu_courses(id) on delete cascade,
      |  enrolled_at varchar(80) not null,
      |  primary key (user_id, course_id)
      |);
      |""".stripMargin,
    """
      |create table if not exists edu_course_waitlist (
      |  user_id varchar(64) not null references edu_users(id) on delete cascade,
      |  course_id varchar(64) not null references edu_courses(id) on delete cascade,
      |  queued_at varchar(80) not null,
      |  position integer not null,
      |  primary key (user_id, course_id)
      |);
      |""".stripMargin,
    "alter table edu_enrollments add column if not exists status varchar(32) not null default 'enrolled'"
  )

  private val listStudentWaitlistSql: String =
    """
      |select user_id, course_id, queued_at, position
      |from edu_course_waitlist
      |where user_id = ?
      |order by queued_at asc, position asc
      |""".stripMargin

  private val listTeachingWaitlistSql: String =
    """
      |select w.user_id, w.course_id, w.queued_at, w.position
      |from edu_course_waitlist w
      |join edu_courses c on c.id = w.course_id
      |where c.teacher_id = ? or c.assistants like ?
      |order by w.course_id asc, w.position asc
      |""".stripMargin

  private val listAllWaitlistSql: String =
    """
      |select user_id, course_id, queued_at, position
      |from edu_course_waitlist
      |order by course_id asc, position asc
      |""".stripMargin

  private val listStudentEnrollmentsSql: String =
    """
      |select user_id, course_id, enrolled_at, status
      |from edu_enrollments
      |where user_id = ?
      |""".stripMargin

  private val listAllEnrollmentsSql: String =
    """
      |select user_id, course_id, enrolled_at, status
      |from edu_enrollments
      |""".stripMargin

  private val findAcademicClassCapacitySql: String =
    """
      |select capacity
      |from edu_academic_classes
      |where id = ?
      |""".stripMargin

  private val findEnrollmentSql: String =
    """
      |select user_id, course_id, enrolled_at, status
      |from edu_enrollments
      |where user_id = ? and course_id = ?
      |""".stripMargin

  private val findNextWaitlistPositionSql: String =
    """
      |select coalesce(max(position), 0) + 1
      |from edu_course_waitlist
      |where course_id = ?
      |""".stripMargin

  private val insertWaitlistSql: String =
    """
      |insert into edu_course_waitlist (user_id, course_id, queued_at, position)
      |values (?, ?, ?, ?)
      |on conflict (user_id, course_id) do nothing
      |""".stripMargin

  private val countCourseEnrollmentsSql: String =
    """
      |select count(*)
      |from edu_enrollments
      |where course_id = ?
      |""".stripMargin

  private val countActiveCourseEnrollmentsSql: String =
    """
      |select count(*)
      |from edu_enrollments
      |where course_id = ? and status = 'enrolled'
      |""".stripMargin

  private val upsertEnrollmentSql: String =
    """
      |insert into edu_enrollments (user_id, course_id, enrolled_at, status)
      |values (?, ?, ?, ?)
      |on conflict (user_id, course_id) do update set
      |enrolled_at = excluded.enrolled_at,
      |status = excluded.status
      |""".stripMargin

  private val insertPaidOrderSql: String =
    """
      |insert into edu_orders (id, buyer, course_title, amount, status, paid_at, payment_method)
      |values (?, ?, ?, ?, ?, ?, ?)
      |""".stripMargin

  def initialize(connection: Connection): IO[Unit] =
    schemaStatements.foldLeft(IO.unit)((acc, sql) => acc.flatMap(_ => executeSql(connection, sql)))

  def listWaitlistEntries(connection: Connection, currentUser: UserProfile): IO[List[WaitlistEntry]] =
    currentUser.role match
      case UserRole.Student =>
        selectPreparedList(connection.prepareStatement(listStudentWaitlistSql)) { statement =>
          statement.setString(1, currentUser.id)
        }(readWaitlistEntry)
      case UserRole.Teacher | UserRole.Assistant =>
        selectPreparedList(connection.prepareStatement(listTeachingWaitlistSql)) { statement =>
          statement.setString(1, currentUser.id)
          statement.setString(2, s"%${currentUser.id}%")
        }(readWaitlistEntry)
      case UserRole.Admin | UserRole.Analyst =>
        selectStatementList(connection, listAllWaitlistSql)(readWaitlistEntry)

  def listEnrollments(connection: Connection, currentUser: UserProfile): IO[List[CourseEnrollment]] =
    currentUser.role match
      case UserRole.Student =>
        selectPreparedList(connection.prepareStatement(listStudentEnrollmentsSql)) { statement =>
          statement.setString(1, currentUser.id)
        }(readEnrollment)
      case _ =>
        selectStatementList(connection, listAllEnrollmentsSql)(readEnrollment)

  def findEnrollment(connection: Connection, userId: String, courseId: String): IO[Option[CourseEnrollment]] =
    queryOne(connection.prepareStatement(findEnrollmentSql)) { statement =>
      statement.setString(1, userId)
      statement.setString(2, courseId)
    }(readEnrollment)

  def enqueueWaitlist(connection: Connection, userId: String, courseId: String): IO[Unit] =
    for
      nextPosition <- findNextWaitlistPosition(connection, courseId)
      _ <- executePrepared(connection.prepareStatement(insertWaitlistSql)) { statement =>
        statement.setString(1, userId)
        statement.setString(2, courseId)
        statement.setString(3, Instant.now().toString)
        statement.setInt(4, nextPosition)
      }
    yield ()

  def countCourseEnrollments(connection: Connection, courseId: String): IO[Int] =
    queryCount(connection.prepareStatement(countCourseEnrollmentsSql)) { statement =>
      statement.setString(1, courseId)
    }

  def countActiveCourseEnrollments(connection: Connection, courseId: String): IO[Int] =
    queryCount(connection.prepareStatement(countActiveCourseEnrollmentsSql)) { statement =>
      statement.setString(1, courseId)
    }

  def upsertEnrollment(connection: Connection, userId: String, courseId: String, enrollmentStatus: String): IO[Unit] =
    executePrepared(connection.prepareStatement(upsertEnrollmentSql)) { statement =>
      statement.setString(1, userId)
      statement.setString(2, courseId)
      statement.setString(3, Instant.now().toString)
      statement.setString(4, enrollmentStatus)
    }.void

  def insertPaidOrder(
    connection: Connection,
    orderId: String,
    buyer: String,
    courseTitle: String,
    amount: BigDecimal,
    paymentMethod: Option[String]
  ): IO[Unit] =
    executePrepared(connection.prepareStatement(insertPaidOrderSql)) { statement =>
      statement.setString(1, orderId)
      statement.setString(2, buyer)
      statement.setString(3, courseTitle)
      statement.setBigDecimal(4, amount.bigDecimal)
      statement.setString(5, OrderStatus.toString(OrderStatus.Paid))
      statement.setString(6, Instant.now().toString)
      statement.setString(7, paymentMethod.orNull)
    }.void

  private def findNextWaitlistPosition(connection: Connection, courseId: String): IO[Int] =
    queryOne(connection.prepareStatement(findNextWaitlistPositionSql)) { statement =>
      statement.setString(1, courseId)
    }(_.getInt(1)).map(_.getOrElse(1))

  private def readWaitlistEntry(resultSet: ResultSet): WaitlistEntry =
    WaitlistEntry(
      userId = resultSet.getString("user_id"),
      courseId = resultSet.getString("course_id"),
      queuedAt = resultSet.getString("queued_at"),
      position = resultSet.getInt("position")
    )

  private def readEnrollment(resultSet: ResultSet): CourseEnrollment =
    CourseEnrollment(
      userId = resultSet.getString("user_id"),
      courseId = resultSet.getString("course_id"),
      enrolledAt = resultSet.getString("enrolled_at"),
      status = Option(resultSet.getString("status")).filter(_.nonEmpty).getOrElse("enrolled")
    )

  private def selectStatementList[A](connection: Connection, sql: String)(reader: ResultSet => A): IO[List[A]] =
    IO.blocking {
      val statement = connection.createStatement()
      try
        val resultSet = statement.executeQuery(sql)
        readList(resultSet)(reader)
      finally statement.close()
    }

  private def selectPreparedList[A](statement: PreparedStatement)(bind: PreparedStatement => Unit)(reader: ResultSet => A): IO[List[A]] =
    IO.blocking {
      try
        bind(statement)
        val resultSet = statement.executeQuery()
        readList(resultSet)(reader)
      finally statement.close()
    }

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

  private def queryCount(statement: PreparedStatement)(bind: PreparedStatement => Unit): IO[Int] =
    queryOne(statement)(bind)(_.getInt(1)).map(_.getOrElse(0))

  private def executePrepared(statement: PreparedStatement)(bind: PreparedStatement => Unit): IO[Int] =
    IO.blocking {
      try
        bind(statement)
        statement.executeUpdate()
      finally statement.close()
    }

  private def executeSql(connection: Connection, sql: String): IO[Unit] =
    IO.blocking {
      val statement = connection.createStatement()
      try statement.execute(sql)
      finally statement.close()
    }.void

  private def readList[A](resultSet: ResultSet)(reader: ResultSet => A): List[A] =
    val buffer = mutable.ListBuffer.empty[A]
    try
      while resultSet.next() do buffer += reader(resultSet)
      buffer.toList
    finally resultSet.close()
