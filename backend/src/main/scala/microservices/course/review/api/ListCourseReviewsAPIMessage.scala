// 文件说明：后端课程评价接口实现，用于处理列表查询课程Reviews请求并返回类型安全响应。
package microservices.course.review.api

import cats.effect.IO
import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}
import microservices.auth.api.RequireSessionUserAPIMessage
import microservices.course.review.objects.CourseReview
import microservices.course.review.tables.ReviewTable
import system.api.{ConnectionAPIMessage, ConnectionApiMessageSchema}

import java.sql.Connection

final case class ListCourseReviewsAPIMessage(
  sessionToken: String
) extends ConnectionAPIMessage[List[CourseReview]]:
  override def plan(connection: Connection): IO[List[CourseReview]] =
    ListCourseReviewsAPIMessage.schema.execute(this, connection)

object ListCourseReviewsAPIMessage:
  val inputDecoder: Decoder[ListCourseReviewsAPIMessage] = deriveDecoder[ListCourseReviewsAPIMessage]
  val outputEncoder: Encoder[List[CourseReview]] = Encoder.encodeList[CourseReview]
  val schema: ConnectionApiMessageSchema[ListCourseReviewsAPIMessage, List[CourseReview]] = ConnectionApiMessageSchema(
    name = "ListCourseReviewsAPIMessage",
    inputDecoder = inputDecoder,
    outputEncoder = outputEncoder,
    execute = (input, connection) =>
      for
        currentUser <- RequireSessionUserAPIMessage(input.sessionToken).plan(connection)
        reviews <- ReviewTable.listCourseReviews(connection, currentUser)
      yield reviews
  )
  given Decoder[ListCourseReviewsAPIMessage] = inputDecoder
  given Encoder[ListCourseReviewsAPIMessage] = deriveEncoder[ListCourseReviewsAPIMessage]
