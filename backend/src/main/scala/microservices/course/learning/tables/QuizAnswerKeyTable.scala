package microservices.course.learning.tables

import cats.effect.IO
import microservices.course.learning.objects.QuizOption

import java.sql.Connection

private[learning] object QuizAnswerKeyTable:

  val schemaStatements: List[String] = List(
    """
      |create table if not exists edu_quiz_answer_keys (
      |  quiz_id varchar(64) not null references edu_quizzes(id) on delete cascade,
      |  question_index integer not null,
      |  correct_option varchar(4) not null,
      |  primary key (quiz_id, question_index)
      |);
      |""".stripMargin
  )

  val seedStatements: List[String] = List(
    "insert into edu_quiz_answer_keys (quiz_id, question_index, correct_option) values ('q1', 1, 'A') on conflict do nothing",
    "insert into edu_quiz_answer_keys (quiz_id, question_index, correct_option) values ('q1', 2, 'C') on conflict do nothing",
    "insert into edu_quiz_answer_keys (quiz_id, question_index, correct_option) values ('q1', 3, 'B') on conflict do nothing",
    "insert into edu_quiz_answer_keys (quiz_id, question_index, correct_option) values ('q2', 1, 'D') on conflict do nothing",
    "insert into edu_quiz_answer_keys (quiz_id, question_index, correct_option) values ('q2', 2, 'A') on conflict do nothing"
  )

  val countQuizAnswerKeysSql: String =
    "select count(*) from edu_quiz_answer_keys"

  val insertQuizAnswerKeySql: String =
    "insert into edu_quiz_answer_keys (quiz_id, question_index, correct_option) values (?, ?, ?)"

  val listQuizAnswerKeysSql: String =
    "select correct_option from edu_quiz_answer_keys where quiz_id = ? order by question_index asc"

  private[learning] def insertQuizAnswerKeys(connection: Connection, quizId: String, answerKeys: List[QuizOption]): IO[Unit] =
    answerKeys.zipWithIndex.foldLeft(IO.unit) { case (acc, (answerKey, index)) =>
      acc.flatMap(_ =>
        using(connection.prepareStatement(insertQuizAnswerKeySql)) { statement =>
          IO.blocking {
            statement.setObject(1, quizId)
            statement.setObject(2, index + 1)
            statement.setObject(3, QuizOption.toString(answerKey))
            statement.executeUpdate()
          }
        }
      )
    }

  private[learning] def listQuizAnswerKeys(connection: Connection, quizId: String): IO[List[QuizOption]] =
    using(connection.prepareStatement(listQuizAnswerKeysSql)) { statement =>
      IO.blocking {
        statement.setObject(1, quizId)
        val resultSet = statement.executeQuery()
        val buffer = scala.collection.mutable.ListBuffer.empty[QuizOption]
        try
          while resultSet.next() do
            QuizOption.fromString(resultSet.getString("correct_option")).foreach(buffer += _)
          buffer.toList
        finally resultSet.close()
      }
    }

  private[learning] def using[A <: AutoCloseable, B](resource: A)(use: A => IO[B]): IO[B] =
    use(resource).guarantee(IO.blocking(resource.close()).handleErrorWith(_ => IO.unit))
