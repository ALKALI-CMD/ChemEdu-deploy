package support

import microservices.course.catalog.objects.*
import microservices.auth.objects.*

object TestDataFactory:

  def adminUser(id: String = "admin-test"): UserProfile =
    UserProfile(
      id = id,
      name = "Admin Test",
      email = "admin-test@example.com",
      role = UserRole.Admin,
      age = None,
      grade = None,
      subject = None,
      departmentId = None,
      departmentName = None,
      majorId = None,
      majorName = None,
      academicClassId = None,
      academicClassName = None,
      bio = "Test administrator",
      avatarUrl = None,
      permissions = Some(List("user:manage", "course:audit", "report:view"))
    )

  def studentUser(id: String = "student-test"): UserProfile =
    adminUser(id).copy(
      name = "Student Test",
      email = "student-test@example.com",
      role = UserRole.Student,
      permissions = Some(List("course:learn", "discussion:write"))
    )

  val permissionMatrix: List[PermissionMatrixEntry] =
    List(
      PermissionMatrixEntry(UserRole.Admin, "user:manage", "update_role", "user", "platform", allowed = true),
      PermissionMatrixEntry(UserRole.Student, "course:learn", "read", "course", "enrolled_course", allowed = true)
    )
