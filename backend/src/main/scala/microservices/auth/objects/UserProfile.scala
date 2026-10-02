// 文件说明：定义认证用户Profile领域数据类型，用于业务流程和接口传输。
package microservices.auth.objects

import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}
import microservices.auth.objects.*

final case class UserProfile(
  id: String,
  name: String,
  email: String,
  role: UserRole,
  age: Option[Int],
  grade: Option[String],
  subject: Option[String],
  departmentId: Option[String],
  departmentName: Option[String],
  majorId: Option[String],
  majorName: Option[String],
  academicClassId: Option[String],
  academicClassName: Option[String],
  bio: String,
  avatarUrl: Option[String],
  permissions: Option[List[String]]
)

object UserProfile:
  given Encoder[UserProfile] = deriveEncoder[UserProfile]
  given Decoder[UserProfile] = deriveDecoder[UserProfile]

