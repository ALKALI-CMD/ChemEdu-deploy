import cats.effect.{IO, IOApp}
import com.comcast.ip4s.{Host, Port, host, port}
import database.DatabaseSession
import microservices.admin.api.InitializeAdminStorage
import microservices.auth.api.{InitializeAuthStorage, SeedDemoAccountsAPIMessage}
import microservices.course.catalog.api.{InitializeCourseCatalogStorage, SeedCourseCatalogDataIfNeededAPIMessage}
import microservices.course.discussion.api.InitializeDiscussionStorage
import microservices.course.enrollment.api.InitializeEnrollmentStorage
import microservices.course.learning.api.InitializeLearningStorage
import microservices.course.review.api.InitializeCourseReviewStorage
import microservices.exam.api.InitializeExamStorage
import system.routes.ApiRouter
import org.http4s.ember.server.EmberServerBuilder
import org.http4s.server.Server
import org.http4s.server.middleware.Logger
import org.typelevel.log4cats.slf4j.Slf4jLogger

object Main extends IOApp.Simple:

  private val logger = Slf4jLogger.getLogger[IO]
  private val httpHost: Host = sys.env.get("HTTP_HOST").flatMap(Host.fromString).getOrElse(host"0.0.0.0")
  private val httpPort: Port = sys.env.get("HTTP_PORT").flatMap(_.toIntOption).flatMap(Port.fromInt).getOrElse(port"8080")
  private val appEnv: String = sys.env.get("APP_ENV").map(_.trim).filter(_.nonEmpty).getOrElse("local")

  private val httpApp =
    Logger.httpApp(logHeaders = true, logBody = false)(ApiRouter.httpApp)

  private val serverResource: cats.effect.Resource[IO, Server] =
    for
      _ <- DatabaseSession.initialize
      _ <- cats.effect.Resource.eval(DatabaseSession.withTransactionConnection(connection => InitializeAuthStorage().plan(connection).void))
      _ <- cats.effect.Resource.eval(DatabaseSession.withTransactionConnection(connection => InitializeCourseCatalogStorage().plan(connection).void))
      _ <- cats.effect.Resource.eval(DatabaseSession.withTransactionConnection(connection => InitializeEnrollmentStorage().plan(connection).void))
      _ <- cats.effect.Resource.eval(DatabaseSession.withTransactionConnection(connection => InitializeCourseReviewStorage().plan(connection).void))
      _ <- cats.effect.Resource.eval(DatabaseSession.withTransactionConnection(connection => InitializeDiscussionStorage().plan(connection).void))
      _ <- cats.effect.Resource.eval(DatabaseSession.withTransactionConnection(connection => InitializeLearningStorage().plan(connection).void))
      _ <- cats.effect.Resource.eval(DatabaseSession.withTransactionConnection(connection => InitializeAdminStorage().plan(connection).void))
      _ <- cats.effect.Resource.eval(DatabaseSession.withTransactionConnection(connection => InitializeExamStorage().plan(connection).void))
      _ <- cats.effect.Resource.eval(DatabaseSession.withTransactionConnection(connection => SeedCourseCatalogDataIfNeededAPIMessage().plan(connection).void))
      _ <- cats.effect.Resource.eval(DatabaseSession.withTransactionConnection(InitializeLearningStorage.seedSamples))
      _ <- cats.effect.Resource.eval(DatabaseSession.withTransactionConnection(InitializeAdminStorage.seedSamples))
      _ <- cats.effect.Resource.eval(DatabaseSession.withTransactionConnection(SeedDemoAccountsAPIMessage.seedDemoAccounts))
      _ <- cats.effect.Resource.eval(DatabaseSession.withTransactionConnection(InitializeExamStorage.seedSamples))
      server <- EmberServerBuilder
        .default[IO]
        .withHost(httpHost)
        .withPort(httpPort)
        .withHttpApp(httpApp)
        .build
    yield server

  override def run: IO[Unit] =
    for
      _ <- logger.info(s"Starting backend-sample env=$appEnv on http://$httpHost:$httpPort")
      _ <- serverResource.useForever
    yield ()
