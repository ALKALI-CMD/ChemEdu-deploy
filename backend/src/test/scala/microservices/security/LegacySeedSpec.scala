package microservices.security

import cats.effect.unsafe.implicits.global
import microservices.admin.api.InitializeAdminStorage
import microservices.course.learning.api.InitializeLearningStorage
import org.scalatest.funsuite.AnyFunSuite

class LegacySeedSpec extends AnyFunSuite:
  test("normal startup does not access legacy learning or audit samples") {
    assume(!sys.env.get("ENABLE_LEGACY_DEMO_DATA").contains("true"))
    // No database is available: disabled seeders must not query or write anything.
    InitializeLearningStorage.seedSamples(null).unsafeRunSync()
    InitializeAdminStorage.seedSamples(null).unsafeRunSync()
  }
