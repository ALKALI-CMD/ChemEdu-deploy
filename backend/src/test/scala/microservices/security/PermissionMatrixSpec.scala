package microservices.security

import microservices.auth.objects.UserRole
import org.scalatest.funsuite.AnyFunSuite
import support.TestDataFactory

class PermissionMatrixSpec extends AnyFunSuite:

  test("admin permissions include role management") {
    val permissions = TestDataFactory.permissionMatrix.filter(_.role == UserRole.Admin).map(_.permissionKey).toSet
    assert(permissions.contains("user:manage"))
  }

  test("student permissions are scoped to enrolled course resources") {
    val studentEntry = TestDataFactory.permissionMatrix.find(_.role == UserRole.Student).get
    assert(studentEntry.scope == "enrolled_course")
    assert(studentEntry.allowed)
  }
