// 文件说明：后端认证接口实现，用于处理注册请求并返回类型安全响应。
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
import microservices.auth.objects.{createPasswordHash, hashSessionToken, randomSessionToken, UserId, UserRole}
import microservices.auth.objects.apiTypes.AuthResponse
import microservices.auth.tables.{UserSessionTable, UserTable}
import system.api.{ConnectionAPIMessage, ConnectionApiMessageSchema}

import java.sql.Connection
import java.util.UUID

final case class RegisterAPIMessage(
  name: String,
  email: String,
  password: String,
  role: UserRole,
  age: Option[Int],
  grade: Option[String],
  subject: Option[String],
  bio: String,
  avatarUrl: Option[String]
) extends ConnectionAPIMessage[AuthResponse]:
  override def plan(connection: Connection): IO[AuthResponse] =
    for
      normalizedEmail <- IO.pure(email.trim.toLowerCase)
      normalizedName <- IO.pure(name.trim)
      normalizedGrade <- IO.pure(grade.map(_.trim).filter(_.nonEmpty))
      normalizedSubject <- IO.pure(subject.map(_.trim).filter(_.nonEmpty))
      normalizedBio <- IO.pure(bio.trim)
      normalizedAvatarUrl <- IO.pure(avatarUrl.map(_.trim).filter(_.nonEmpty))
      _ <- RegisterAPIMessage.validateRegistrationInput(normalizedName, normalizedEmail, password, role, normalizedGrade, normalizedSubject)
      existingEmail <- UserTable.findByEmail(connection, normalizedEmail)
      _ <- existingEmail match
        case Some(_) => IO.raiseError(new IllegalArgumentException("This email is already registered."))
        case None => IO.unit
      existingName <- UserTable.findByName(connection, normalizedName)
      _ <- existingName match
        case Some(_) => IO.raiseError(new IllegalArgumentException("This username is already registered."))
        case None => IO.unit
      userId <- IO.pure(UserId(s"${UserRole.toString(role)}-${UUID.randomUUID().toString.take(8)}"))
      passwordCredential <- createPasswordHash(password)
      (passwordHash, passwordSalt) = passwordCredential
      user <- UserTable.insert(
        connection,
        userId,
        normalizedName,
        normalizedEmail,
        passwordHash,
        passwordSalt,
        role,
        age,
        normalizedGrade,
        normalizedSubject,
        normalizedBio,
        normalizedAvatarUrl,
        RegisterAPIMessage.defaultPermissionsForRole(role)
      )
      token <- randomSessionToken()
      expiresAt <- IO.pure(LoginAPIMessage.sessionExpiryInstant())
      _ <- UserSessionTable.insert(connection, hashSessionToken(token), UserId(user.id), expiresAt)
    yield AuthResponse.authenticated(token.value, user, expiresAt.toString)

object RegisterAPIMessage:
  val inputDecoder: Decoder[RegisterAPIMessage] = deriveDecoder[RegisterAPIMessage]
  val outputEncoder: Encoder[AuthResponse] = deriveEncoder[AuthResponse]
  val schema: ConnectionApiMessageSchema[RegisterAPIMessage, AuthResponse] = ConnectionApiMessageSchema(
    name = "RegisterAPIMessage",
    inputDecoder = inputDecoder,
    outputEncoder = outputEncoder,
    execute = (input, connection) => input.plan(connection)
  )
  given Decoder[RegisterAPIMessage] = inputDecoder
  given Encoder[RegisterAPIMessage] = deriveEncoder[RegisterAPIMessage]

  private def validateRegistrationInput(
    name: String,
    email: String,
    password: String,
    role: UserRole,
    grade: Option[String],
    subject: Option[String]
  ): IO[Unit] =
    for
      _ <- ensureNonEmpty(name, "Username cannot be empty.")
      _ <- if name.length >= 2 then IO.unit else IO.raiseError(new IllegalArgumentException("Username must be at least 2 characters long."))
      _ <- ensureNonEmpty(email, "Email cannot be empty.")
      _ <- if email.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$") then IO.unit else IO.raiseError(new IllegalArgumentException("Please enter a valid email address."))
      _ <- validatePasswordStrength(password)
      _ <- role match
        case UserRole.Student => ensureNonEmpty(grade.getOrElse("").trim, "Student registrations must include a grade.")
        case UserRole.Teacher => ensureNonEmpty(subject.getOrElse("").trim, "Teacher registrations must include a subject.")
        case UserRole.Assistant => IO.unit
        case UserRole.Analyst | UserRole.Admin => IO.raiseError(new IllegalArgumentException("Self-registration currently supports student, teacher, or assistant roles."))
    yield ()

  private def defaultPermissionsForRole(role: UserRole): String =
    role match
      case UserRole.Admin => "user:manage,course:audit,report:view"
      case _ => ""

  private def ensureNonEmpty(value: String, message: String): IO[Unit] =
    if value.nonEmpty then IO.unit else IO.raiseError(new IllegalArgumentException(message))

  private def validatePasswordStrength(password: String): IO[Unit] =
    if password.length >= 6 then IO.unit
    else IO.raiseError(new IllegalArgumentException("Password must be at least 6 characters long."))
