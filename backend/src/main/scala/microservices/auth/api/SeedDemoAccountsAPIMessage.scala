// 文件说明：认证域接口实现，用于启动时幂等填充演示账号（校长、教研、助教、数据分析处与学生）。
package microservices.auth.api

import cats.effect.IO
import cats.syntax.all.*
import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}
import microservices.auth.objects.{createPasswordHash, UserId, UserRole}
import microservices.auth.tables.UserTable
import microservices.course.catalog.objects.apiTypes.MessageResponse
import system.api.{ConnectionAPIMessage, ConnectionApiMessageSchema}

import java.sql.Connection
import java.util.UUID

final case class SeedDemoAccountsAPIMessage() extends ConnectionAPIMessage[MessageResponse]:
  override def plan(connection: Connection): IO[MessageResponse] =
    for
      _ <- SeedDemoAccountsAPIMessage.seedDemoAccounts(connection)
    yield MessageResponse("Demo accounts ensured.")

object SeedDemoAccountsAPIMessage:

  private case class DemoAccount(
    email: String,
    password: String,
    name: String,
    role: UserRole,
    grade: Option[String],
    subject: Option[String],
    bio: String
  )

  private val demoAccounts: List[DemoAccount] = List(
    DemoAccount("principal@example.com", "principal123", "陈校长", UserRole.Admin, None, None, "清北营负责人，负责整体运营与教学督导。"),
    DemoAccount("zhou@example.com", "teacher123", "周老师", UserRole.Teacher, None, Some("有机化学·教研负责人"), "教研老师，负责命题、审题与争分复核。"),
    DemoAccount("qian@example.com", "assistant123", "钱老师", UserRole.Assistant, None, None, "助教老师，负责答题卡收集与阅卷打分。"),
    DemoAccount("feng@example.com", "analyst123", "冯老师", UserRole.Analyst, None, None, "数据分析处，负责成绩统计与学情分析看板。"),
    DemoAccount("lin@example.com", "student123", "林晓", UserRole.Student, Some("高三"), None, "目标国决，已在清北营完成两期集训。"),
    DemoAccount("su@example.com", "student123", "苏航", UserRole.Student, Some("高三"), None, "目标省队，冲国初高分段。"),
    DemoAccount("jiang@example.com", "student123", "江晚晴", UserRole.Student, Some("高三"), None, "春季高端 VIP 班学员。"),
    DemoAccount("he@example.com", "student123", "何雨桐", UserRole.Student, Some("高二"), None, "暑期高端集训营学员。"),
    DemoAccount("yuan@example.com", "student123", "袁清越", UserRole.Student, Some("高三"), None, "春季班与暑期营连报学员。"),
    DemoAccount("deng@example.com", "student123", "邓子昂", UserRole.Student, Some("高三"), None, "国初冲刺阶段学员。"),
    DemoAccount("luo@example.com", "student123", "罗一鸣", UserRole.Student, Some("高二"), None, "暑期高端集训营学员。"),
    DemoAccount("bai@example.com", "student123", "白景行", UserRole.Student, Some("高二"), None, "春季高端 VIP 班学员。")
  )

  def seedDemoAccounts(connection: Connection): IO[Unit] =
    demoAccounts.traverse_(account => ensureAccount(connection, account))

  private def ensureAccount(connection: Connection, account: DemoAccount): IO[Unit] =
    UserTable.findByEmail(connection, account.email).flatMap {
      case Some(_) => IO.unit
      case None =>
        for
          credential <- createPasswordHash(account.password)
          passwordHash = credential._1
          passwordSalt = credential._2
          _ <- UserTable.insert(
            connection,
            UserId(s"${UserRole.toString(account.role)}-${UUID.randomUUID().toString.take(8)}"),
            account.name,
            account.email,
            passwordHash,
            passwordSalt,
            account.role,
            None,
            account.grade,
            account.subject,
            account.bio,
            None,
            defaultPermissionsForRole(account.role)
          )
        yield ()
    }

  private def defaultPermissionsForRole(role: UserRole): String =
    role match
      case UserRole.Admin => "user:manage,course:audit,report:view"
      case _ => ""

  val inputDecoder: Decoder[SeedDemoAccountsAPIMessage] = deriveDecoder[SeedDemoAccountsAPIMessage]
  val outputEncoder: Encoder[MessageResponse] = deriveEncoder[MessageResponse]
  val schema: ConnectionApiMessageSchema[SeedDemoAccountsAPIMessage, MessageResponse] = ConnectionApiMessageSchema(
    name = "SeedDemoAccountsAPIMessage",
    inputDecoder = inputDecoder,
    outputEncoder = outputEncoder,
    execute = (input, connection) => input.plan(connection)
  )
  given Decoder[SeedDemoAccountsAPIMessage] = inputDecoder
  given Encoder[SeedDemoAccountsAPIMessage] = deriveEncoder[SeedDemoAccountsAPIMessage]
