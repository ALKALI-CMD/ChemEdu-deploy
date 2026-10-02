package database

final case class DatabaseConfig(
  host: String,
  port: Int,
  databaseName: String,
  user: String,
  password: String,
  maxPoolSize: Int,
  connectionTimeoutMs: Long,
  sslMode: String
)

object DatabaseConfig:

  private def env(name: String): Option[String] =
    sys.env.get(name).map(_.trim).filter(_.nonEmpty)

  private def defaultDatabaseName: String =
    env("DB_NAME").getOrElse(DatabaseDefaults.DefaultDatabaseName)

  // 托管数据库（Neon / Supabase 等）通常强制 TLS，本机 docker-compose 里的 PostgreSQL 则保持明文。
  private def defaultSslMode: String =
    env("DB_SSL_MODE").orElse {
      env("DB_SSL").filter(_.equalsIgnoreCase("true")).map(_ => "require")
    }.getOrElse("")

  def url(config: DatabaseConfig): String =
    val sslSuffix = if config.sslMode.isEmpty then "" else s"?sslmode=${config.sslMode}"
    s"jdbc:postgresql://${config.host}:${config.port}/${config.databaseName}$sslSuffix"

  val default: DatabaseConfig =
    DatabaseConfig(
      host = env("DB_HOST").getOrElse("127.0.0.1"),
      port = env("DB_PORT").flatMap(_.toIntOption).getOrElse(5432),
      databaseName = defaultDatabaseName,
      user = env("DB_USER").getOrElse("db"),
      password = env("DB_PASSWORD").getOrElse("root"),
      maxPoolSize = env("DB_MAX_POOL_SIZE").flatMap(_.toIntOption).getOrElse(10),
      connectionTimeoutMs = env("DB_CONNECTION_TIMEOUT_MS").flatMap(_.toLongOption).getOrElse(3000L),
      sslMode = defaultSslMode
    )
