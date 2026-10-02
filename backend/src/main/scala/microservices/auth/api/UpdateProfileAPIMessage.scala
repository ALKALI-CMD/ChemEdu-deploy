// 文件说明：后端认证接口实现，用于处理更新Profile请求并返回类型安全响应。
package microservices.auth.api

import microservices.admin.objects.apiTypes.*
import microservices.auth.objects.apiTypes.*
import microservices.course.catalog.objects.apiTypes.*
import microservices.course.discussion.objects.apiTypes.*
import microservices.course.learning.objects.apiTypes.*
import microservices.course.review.objects.apiTypes.*
import microservices.dashboard.objects.apiTypes.*
import cats.effect.IO
import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}
import microservices.auth.objects.{UserId, UserRole}
import microservices.auth.objects.apiTypes.UserProfileMutationResponse
import microservices.auth.tables.UserTable
import system.api.{ConnectionAPIMessage, ConnectionApiMessageSchema}

import java.sql.Connection

final case class UpdateProfileAPIMessage(
  sessionToken: String,
  name: String,
  age: Option[Int],
  grade: Option[String],
  subject: Option[String],
  bio: String,
  avatarUrl: Option[String]
) extends ConnectionAPIMessage[UserProfileMutationResponse]:
  override def plan(connection: Connection): IO[UserProfileMutationResponse] =
    for
      currentUser <- RequireSessionUserAPIMessage(sessionToken).plan(connection)
      normalizedName <- IO.pure(name.trim)
      normalizedBio <- IO.pure(bio.trim)
      normalizedGrade <- IO.pure(grade.map(_.trim).filter(_.nonEmpty))
      normalizedSubject <- IO.pure(subject.map(_.trim).filter(_.nonEmpty))
      normalizedAvatarUrl <- IO.pure(avatarUrl.map(_.trim).filter(_.nonEmpty))
      _ <- age match
        case Some(age) if age > 0 => IO.unit
        case Some(_) => IO.raiseError(new IllegalArgumentException("Age must be a positive integer."))
        case None => IO.unit
      _ <- UpdateProfileAPIMessage.ensureNonEmpty(normalizedName, "Username cannot be empty.")
      _ <- if normalizedName.length >= 2 then IO.unit else IO.raiseError(new IllegalArgumentException("Username must be at least 2 characters long."))
      _ <- if normalizedBio.nonEmpty then IO.unit else IO.raiseError(new IllegalArgumentException("Please complete your profile introduction."))
      _ <- UpdateProfileAPIMessage.validateProfileByRole(currentUser.role, normalizedGrade, normalizedSubject)
      existingName <- UserTable.findByName(connection, normalizedName)
      _ <- existingName match
        case Some(existing) if existing.id != currentUser.id => IO.raiseError(new IllegalArgumentException("This username is already registered."))
        case _ => IO.unit
      userId <- IO.pure(UserId(currentUser.id))
      _ <- UserTable.updateProfile(connection, userId, normalizedName, age, normalizedGrade, normalizedSubject, normalizedBio, normalizedAvatarUrl)
      updatedUser <- UserTable.findById(connection, userId)
      result <- IO.fromOption(updatedUser)(new IllegalStateException("Profile updated successfully but could not be reloaded."))
    yield UserProfileMutationResponse("Profile updated successfully.", result)

object UpdateProfileAPIMessage:
  val inputDecoder: Decoder[UpdateProfileAPIMessage] = deriveDecoder[UpdateProfileAPIMessage]
  val outputEncoder: Encoder[UserProfileMutationResponse] = deriveEncoder[UserProfileMutationResponse]
  val schema: ConnectionApiMessageSchema[UpdateProfileAPIMessage, UserProfileMutationResponse] = ConnectionApiMessageSchema(
    name = "UpdateProfileAPIMessage",
    inputDecoder = inputDecoder,
    outputEncoder = outputEncoder,
    execute = (input, connection) => input.plan(connection)
  )
  given Decoder[UpdateProfileAPIMessage] = inputDecoder
  given Encoder[UpdateProfileAPIMessage] = deriveEncoder[UpdateProfileAPIMessage]

  private def validateProfileByRole(role: UserRole, grade: Option[String], subject: Option[String]): IO[Unit] =
    role match
      case UserRole.Student => ensureNonEmpty(grade.getOrElse("").trim, "Student profiles must include a grade.")
      case UserRole.Teacher => ensureNonEmpty(subject.getOrElse("").trim, "Teacher profiles must include a subject.")
      case _ => IO.unit

  private def ensureNonEmpty(value: String, message: String): IO[Unit] =
    if value.nonEmpty then IO.unit else IO.raiseError(new IllegalArgumentException(message))
