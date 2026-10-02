// 文件说明：定义认证用户角色领域数据类型，用于业务流程和接口传输。
package microservices.auth.objects

import io.circe.{Decoder, Encoder}

enum UserRole(val entryName: String):
  case Student extends UserRole("student")
  case Teacher extends UserRole("teacher")
  case Assistant extends UserRole("assistant")
  case Analyst extends UserRole("analyst")
  case Admin extends UserRole("admin")

object UserRole:
  def toString(value: UserRole): String =
    value.entryName

  def fromString(value: String): Option[UserRole] =
    values.find(_.entryName == value.trim.toLowerCase)
  given Encoder[UserRole] = Encoder.encodeString.contramap(toString)
  given Decoder[UserRole] = Decoder.decodeString.emap(value =>
    fromString(value).toRight(s"Unknown UserRole: $value")
  )
