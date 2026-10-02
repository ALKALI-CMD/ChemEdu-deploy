// 文件说明：定义认证认证Security领域数据类型，用于业务流程和接口传输。
package microservices.auth.objects

import cats.effect.IO

import java.nio.charset.StandardCharsets
import java.security.{MessageDigest, SecureRandom}
import javax.crypto.SecretKeyFactory
import javax.crypto.spec.PBEKeySpec

private[auth] val secureRandom = SecureRandom()
private[auth] val passwordIterations = 120000
private[auth] val passwordKeyLength = 256

private[auth] def createPasswordHash(password: String): IO[(String, String)] =
  for
    salt <- IO.blocking(randomHex(16))
    hash <- IO.blocking(hashPassword(password, salt))
  yield (hash, salt)

private[auth] def verifyPassword(password: String, passwordHash: String, passwordSalt: String): IO[Boolean] =
  IO.blocking(hashPassword(password, passwordSalt) == passwordHash)

private[auth] def randomSessionToken(): IO[SessionToken] =
  IO.blocking(SessionToken(randomHex(32)))

private[auth] def hashSessionToken(token: SessionToken): String =
  sha256Hex(token.value)

private def hashPassword(password: String, saltHex: String): String =
  val keySpec = PBEKeySpec(password.toCharArray, fromHex(saltHex), passwordIterations, passwordKeyLength)
  val keyFactory = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256")
  toHex(keyFactory.generateSecret(keySpec).getEncoded)

private def randomHex(length: Int): String =
  val bytes = Array.ofDim[Byte](length)
  secureRandom.nextBytes(bytes)
  toHex(bytes)

private def sha256Hex(value: String): String =
  val digest = MessageDigest.getInstance("SHA-256")
  toHex(digest.digest(value.getBytes(StandardCharsets.UTF_8)))

private def toHex(bytes: Array[Byte]): String =
  bytes.map(byte => f"${byte & 0xff}%02x").mkString

private def fromHex(hex: String): Array[Byte] =
  hex.grouped(2).map(Integer.parseInt(_, 16).toByte).toArray
