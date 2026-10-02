package microservices.admin.routes

import cats.effect.IO
import database.DatabaseSession
import io.circe.syntax.*
import microservices.admin.api.*
import org.http4s.HttpRoutes
import org.http4s.circe.CirceEntityCodec.*
import org.http4s.circe.CirceEntityEncoder.*
import org.http4s.dsl.io.*
import system.routes.RouteSupport.*

object AdminRoutes:

  val routes: HttpRoutes[IO] = HttpRoutes.of[IO] {
    case req @ PATCH -> Root / "api" / "v1" / "users" / userId / "access" =>
      (
        for
          _ <- logger.info(s"AdminRoutes received PATCH /api/v1/users/$userId/access")
          payload <- req.as[UpdateUserAccessAPIMessage]
          response <- DatabaseSession.withTransactionConnection(connection => UpdateUserAccessAPIMessage.schema.execute(payload.copy(userId = Some(userId)), connection))
          result <- Ok(response.asJson)
        yield result
      ).handleErrorWith(handleError)

    case req @ POST -> Root / "api" / "v1" / "courses" / courseId / "audits" =>
      (
        for
          _ <- logger.info(s"AdminRoutes received POST /api/v1/courses/$courseId/audits")
          payload <- req.as[AuditCourseAPIMessage]
          response <- DatabaseSession.withTransactionConnection(connection => AuditCourseAPIMessage.schema.execute(payload.copy(courseId = Some(courseId)), connection))
          result <- Ok(response.asJson)
        yield result
      ).handleErrorWith(handleError)

    case req @ POST -> Root / "api" / "v1" / "admin" / "departments" =>
      (
        for
          _ <- logger.info("AdminRoutes received POST /api/v1/admin/departments")
          payload <- req.as[UpsertDepartmentAPIMessage]
          response <- DatabaseSession.withTransactionConnection(connection => UpsertDepartmentAPIMessage.schema.execute(payload.copy(departmentId = None), connection))
          result <- Ok(response.asJson)
        yield result
      ).handleErrorWith(handleError)

    case req @ PUT -> Root / "api" / "v1" / "admin" / "departments" / departmentId =>
      (
        for
          _ <- logger.info(s"AdminRoutes received PUT /api/v1/admin/departments/$departmentId")
          payload <- req.as[UpsertDepartmentAPIMessage]
          response <- DatabaseSession.withTransactionConnection(connection => UpsertDepartmentAPIMessage.schema.execute(payload.copy(departmentId = Some(departmentId)), connection))
          result <- Ok(response.asJson)
        yield result
      ).handleErrorWith(handleError)

    case req @ POST -> Root / "api" / "v1" / "admin" / "majors" =>
      (
        for
          _ <- logger.info("AdminRoutes received POST /api/v1/admin/majors")
          payload <- req.as[UpsertMajorAPIMessage]
          response <- DatabaseSession.withTransactionConnection(connection => UpsertMajorAPIMessage.schema.execute(payload.copy(majorId = None), connection))
          result <- Ok(response.asJson)
        yield result
      ).handleErrorWith(handleError)

    case req @ PUT -> Root / "api" / "v1" / "admin" / "majors" / majorId =>
      (
        for
          _ <- logger.info(s"AdminRoutes received PUT /api/v1/admin/majors/$majorId")
          payload <- req.as[UpsertMajorAPIMessage]
          response <- DatabaseSession.withTransactionConnection(connection => UpsertMajorAPIMessage.schema.execute(payload.copy(majorId = Some(majorId)), connection))
          result <- Ok(response.asJson)
        yield result
      ).handleErrorWith(handleError)

    case req @ POST -> Root / "api" / "v1" / "admin" / "academic-classes" =>
      (
        for
          _ <- logger.info("AdminRoutes received POST /api/v1/admin/academic-classes")
          payload <- req.as[UpsertAcademicClassAPIMessage]
          response <- DatabaseSession.withTransactionConnection(connection => UpsertAcademicClassAPIMessage.schema.execute(payload.copy(academicClassId = None), connection))
          result <- Ok(response.asJson)
        yield result
      ).handleErrorWith(handleError)

    case req @ PUT -> Root / "api" / "v1" / "admin" / "academic-classes" / academicClassId =>
      (
        for
          _ <- logger.info(s"AdminRoutes received PUT /api/v1/admin/academic-classes/$academicClassId")
          payload <- req.as[UpsertAcademicClassAPIMessage]
          response <- DatabaseSession.withTransactionConnection(connection => UpsertAcademicClassAPIMessage.schema.execute(payload.copy(academicClassId = Some(academicClassId)), connection))
          result <- Ok(response.asJson)
        yield result
      ).handleErrorWith(handleError)

    case req @ POST -> Root / "api" / "v1" / "admin" / "semesters" =>
      (
        for
          _ <- logger.info("AdminRoutes received POST /api/v1/admin/semesters")
          payload <- req.as[UpsertSemesterAPIMessage]
          response <- DatabaseSession.withTransactionConnection(connection => UpsertSemesterAPIMessage.schema.execute(payload.copy(semesterId = None), connection))
          result <- Ok(response.asJson)
        yield result
      ).handleErrorWith(handleError)

    case req @ PUT -> Root / "api" / "v1" / "admin" / "semesters" / semesterId =>
      (
        for
          _ <- logger.info(s"AdminRoutes received PUT /api/v1/admin/semesters/$semesterId")
          payload <- req.as[UpsertSemesterAPIMessage]
          response <- DatabaseSession.withTransactionConnection(connection => UpsertSemesterAPIMessage.schema.execute(payload.copy(semesterId = Some(semesterId)), connection))
          result <- Ok(response.asJson)
        yield result
      ).handleErrorWith(handleError)

    case req @ DELETE -> Root / "api" / "v1" / "admin" / "departments" / departmentId =>
      (
        for
          _ <- logger.info(s"AdminRoutes received DELETE /api/v1/admin/departments/$departmentId")
          payload <- req.as[DeleteDepartmentAPIMessage]
          response <- DatabaseSession.withTransactionConnection(connection => DeleteDepartmentAPIMessage.schema.execute(payload.copy(departmentId = Some(departmentId)), connection))
          result <- Ok(response.asJson)
        yield result
      ).handleErrorWith(handleError)

    case req @ DELETE -> Root / "api" / "v1" / "admin" / "majors" / majorId =>
      (
        for
          _ <- logger.info(s"AdminRoutes received DELETE /api/v1/admin/majors/$majorId")
          payload <- req.as[DeleteMajorAPIMessage]
          response <- DatabaseSession.withTransactionConnection(connection => DeleteMajorAPIMessage.schema.execute(payload.copy(majorId = Some(majorId)), connection))
          result <- Ok(response.asJson)
        yield result
      ).handleErrorWith(handleError)

    case req @ DELETE -> Root / "api" / "v1" / "admin" / "academic-classes" / academicClassId =>
      (
        for
          _ <- logger.info(s"AdminRoutes received DELETE /api/v1/admin/academic-classes/$academicClassId")
          payload <- req.as[DeleteAcademicClassAPIMessage]
          response <- DatabaseSession.withTransactionConnection(connection => DeleteAcademicClassAPIMessage.schema.execute(payload.copy(academicClassId = Some(academicClassId)), connection))
          result <- Ok(response.asJson)
        yield result
      ).handleErrorWith(handleError)

    case req @ DELETE -> Root / "api" / "v1" / "admin" / "semesters" / semesterId =>
      (
        for
          _ <- logger.info(s"AdminRoutes received DELETE /api/v1/admin/semesters/$semesterId")
          payload <- req.as[DeleteSemesterAPIMessage]
          response <- DatabaseSession.withTransactionConnection(connection => DeleteSemesterAPIMessage.schema.execute(payload.copy(semesterId = Some(semesterId)), connection))
          result <- Ok(response.asJson)
        yield result
      ).handleErrorWith(handleError)

    case req @ POST -> Root / "api" / "v1" / "admin" / "academic-classes" / academicClassId / "students" =>
      (
        for
          _ <- logger.info(s"AdminRoutes received POST /api/v1/admin/academic-classes/$academicClassId/students")
          payload <- req.as[AssignStudentsToAcademicClassAPIMessage]
          response <- DatabaseSession.withTransactionConnection(connection => AssignStudentsToAcademicClassAPIMessage.schema.execute(payload.copy(academicClassId = Some(academicClassId)), connection))
          result <- Ok(response.asJson)
        yield result
      ).handleErrorWith(handleError)

    case req @ POST -> Root / "api" / "v1" / "admin" / "students" / "class-clear" =>
      (
        for
          _ <- logger.info("AdminRoutes received POST /api/v1/admin/students/class-clear")
          payload <- req.as[ClearStudentsAcademicClassAPIMessage]
          response <- DatabaseSession.withTransactionConnection(connection => ClearStudentsAcademicClassAPIMessage.schema.execute(payload, connection))
          result <- Ok(response.asJson)
        yield result
      ).handleErrorWith(handleError)

    case req @ PATCH -> Root / "api" / "v1" / "admin" / "courses" / courseId / "academic-classes" =>
      (
        for
          _ <- logger.info(s"AdminRoutes received PATCH /api/v1/admin/courses/$courseId/academic-classes")
          payload <- req.as[UpdateCourseAcademicClassesAPIMessage]
          response <- DatabaseSession.withTransactionConnection(connection => UpdateCourseAcademicClassesAPIMessage.schema.execute(payload.copy(courseId = Some(courseId)), connection))
          result <- Ok(response.asJson)
        yield result
      ).handleErrorWith(handleError)

    case req @ POST -> Root / "api" / "v1" / "admin" / "courses" / courseId / "enrollments" / userId / "review" =>
      (
        for
          _ <- logger.info(s"AdminRoutes received POST /api/v1/admin/courses/$courseId/enrollments/$userId/review")
          payload <- req.as[ReviewEnrollmentAPIMessage]
          response <- DatabaseSession.withTransactionConnection(connection => ReviewEnrollmentAPIMessage.schema.execute(payload.copy(courseId = Some(courseId), userId = Some(userId)), connection))
          result <- Ok(response.asJson)
        yield result
      ).handleErrorWith(handleError)

    case req @ POST -> Root / "api" / "v1" / "admin" / "courses" / courseId / "waitlist" / userId / "promote" =>
      (
        for
          _ <- logger.info(s"AdminRoutes received POST /api/v1/admin/courses/$courseId/waitlist/$userId/promote")
          payload <- req.as[PromoteWaitlistEntryAPIMessage]
          response <- DatabaseSession.withTransactionConnection(connection => PromoteWaitlistEntryAPIMessage.schema.execute(payload.copy(courseId = Some(courseId), userId = Some(userId)), connection))
          result <- Ok(response.asJson)
        yield result
      ).handleErrorWith(handleError)

    case req @ POST -> Root / "api" / "v1" / "admin" / "semesters" / semesterId / "archive" =>
      (
        for
          _ <- logger.info(s"AdminRoutes received POST /api/v1/admin/semesters/$semesterId/archive")
          payload <- req.as[ArchiveSemesterAPIMessage]
          response <- DatabaseSession.withTransactionConnection(connection => ArchiveSemesterAPIMessage.schema.execute(payload.copy(semesterId = Some(semesterId)), connection))
          result <- Ok(response.asJson)
        yield result
      ).handleErrorWith(handleError)
  }
