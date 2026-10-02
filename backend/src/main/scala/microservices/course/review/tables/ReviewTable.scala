package microservices.course.review.tables

import cats.effect.IO
import microservices.auth.objects.{UserProfile, UserRole}
import microservices.course.review.objects.CourseReview

import java.sql.{Connection, PreparedStatement, ResultSet, Timestamp}
import java.time.Instant
import scala.collection.mutable

private[review] object ReviewTable:
  private val schemaStatements: List[String] = List(
    """
      |create table if not exists edu_course_reviews (
      |  id varchar(64) primary key,
      |  course_id varchar(64) not null references edu_courses(id) on delete cascade,
      |  user_id varchar(64) not null references edu_users(id) on delete cascade,
      |  author varchar(120) not null,
      |  rating integer not null,
      |  content text not null,
      |  created_at varchar(80) not null,
      |  updated_at varchar(80),
      |  unique (course_id, user_id)
      |);
      |""".stripMargin,
    "alter table edu_course_reviews add column if not exists updated_at varchar(80)"
  )

  private val listPublishedCourseReviewsSql: String =
    """
      |select r.id, r.course_id, r.user_id, r.author, r.rating, r.content, r.created_at, r.updated_at
      |from edu_course_reviews r
      |join edu_courses c on c.id = r.course_id
      |where c.status = 'published'
      |order by r.created_at desc, r.id desc
      |""".stripMargin

  private val listTeachingCourseReviewsSql: String =
    """
      |select r.id, r.course_id, r.user_id, r.author, r.rating, r.content, r.created_at, r.updated_at
      |from edu_course_reviews r
      |join edu_courses c on c.id = r.course_id
      |where c.teacher_id = ? or c.assistants like ?
      |order by r.created_at desc, r.id desc
      |""".stripMargin

  private val listAllCourseReviewsSql: String =
    """
      |select id, course_id, user_id, author, rating, content, created_at, updated_at
      |from edu_course_reviews
      |order by created_at desc, id desc
      |""".stripMargin

  private val findCourseReviewByCourseAndUserSql: String =
    """
      |select id, course_id, user_id, author, rating, content, created_at, updated_at
      |from edu_course_reviews
      |where course_id = ? and user_id = ?
      |""".stripMargin

  private val upsertCourseReviewSql: String =
    """
      |insert into edu_course_reviews (id, course_id, user_id, author, rating, content, created_at, updated_at)
      |values (?, ?, ?, ?, ?, ?, ?, ?)
      |on conflict (course_id, user_id) do update set
      |  author = excluded.author,
      |  rating = excluded.rating,
      |  content = excluded.content,
      |  updated_at = excluded.updated_at
      |""".stripMargin

  private val refreshCourseRatingSql: String =
    """
      |update edu_courses
      |set rating = coalesce((
      |  select round(avg(rating)::numeric, 1)
      |  from edu_course_reviews
      |  where course_id = ?
      |), rating),
      |updated_at = ?
      |where id = ?
      |""".stripMargin

  def initialize(connection: Connection): IO[Unit] =
    schemaStatements.foldLeft(IO.unit)((acc, sql) => acc.flatMap(_ => executeSql(connection, sql)))

  def listCourseReviews(connection: Connection, currentUser: UserProfile): IO[List[CourseReview]] =
    currentUser.role match
      case UserRole.Student =>
        selectStatementList(connection, listPublishedCourseReviewsSql)(readCourseReview)
      case UserRole.Teacher | UserRole.Assistant =>
        selectPreparedList(connection.prepareStatement(listTeachingCourseReviewsSql)) { statement =>
          statement.setString(1, currentUser.id)
          statement.setString(2, s"%${currentUser.id}%")
        }(readCourseReview)
      case UserRole.Admin | UserRole.Analyst =>
        selectStatementList(connection, listAllCourseReviewsSql)(readCourseReview)

  def findCourseReviewByCourseAndUser(connection: Connection, courseId: String, userId: String): IO[Option[CourseReview]] =
    queryOne(connection.prepareStatement(findCourseReviewByCourseAndUserSql)) { statement =>
      statement.setString(1, courseId)
      statement.setString(2, userId)
    }(readCourseReview)

  def upsertCourseReview(
    connection: Connection,
    reviewId: String,
    courseId: String,
    userId: String,
    author: String,
    rating: Int,
    content: String,
    createdAt: String,
    updatedAt: String
  ): IO[Unit] =
    executePrepared(connection.prepareStatement(upsertCourseReviewSql)) { statement =>
      statement.setString(1, reviewId)
      statement.setString(2, courseId)
      statement.setString(3, userId)
      statement.setString(4, author)
      statement.setInt(5, rating)
      statement.setString(6, content)
      statement.setString(7, createdAt)
      statement.setString(8, updatedAt)
    }.void

  def refreshCourseRating(connection: Connection, courseId: String): IO[Unit] =
    executePrepared(connection.prepareStatement(refreshCourseRatingSql)) { statement =>
      statement.setString(1, courseId)
      statement.setTimestamp(2, Timestamp.from(Instant.now()))
      statement.setString(3, courseId)
    }.void

  private def readCourseReview(resultSet: ResultSet): CourseReview =
    CourseReview(
      id = resultSet.getString("id"),
      courseId = resultSet.getString("course_id"),
      userId = resultSet.getString("user_id"),
      author = resultSet.getString("author"),
      rating = resultSet.getInt("rating"),
      content = resultSet.getString("content"),
      createdAt = resultSet.getString("created_at"),
      updatedAt = Option(resultSet.getString("updated_at")).filter(_.nonEmpty)
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
