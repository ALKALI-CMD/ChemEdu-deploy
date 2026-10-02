package system.routes

import microservices.admin.api.*
import microservices.auth.api.*
import microservices.auth.objects.*
import microservices.course.catalog.api.*
import microservices.course.catalog.objects.*
import microservices.admin.objects.*
import microservices.auth.objects.*
import microservices.course.discussion.objects.*
import microservices.course.enrollment.objects.*
import microservices.course.learning.objects.*
import microservices.course.review.objects.*
import microservices.dashboard.objects.*
import microservices.dashboard.api.*
import microservices.course.discussion.api.*
import microservices.course.discussion.objects.*
import microservices.course.enrollment.api.*
import microservices.course.learning.api.*
import microservices.course.learning.objects.*
import microservices.course.review.api.*
import microservices.course.review.objects.*
import system.api.*
import system.objects.*

/** 闂嗗棔鑵戞竟鐗堟閹碘偓閺堝褰插▔銊ュ斀閻?Planner閵?*/
// Central registry for the historical /api/{name} dispatch endpoint.
// The active type-safe path is schema registration via plainMessage or
// withConnectionMessage. Legacy Planner registrations should not be added for
// new APIs unless an old client still depends on them.
object PlannerDefinitions:

  import RegisteredPlan.{plainMessage, withConnectionMessage}

  val planners: Map[String, RegisteredPlan] =
    List(
      // System/demo APIMessage entries.
      plainMessage(EchoAPIMessage.schema),
      withConnectionMessage(UpsertDemoNoteAPIMessage.schema),

      // Auth and profile APIMessage entries.
      withConnectionMessage(LoginAPIMessage.schema),
      withConnectionMessage(RegisterAPIMessage.schema),
      withConnectionMessage(UpdateProfileAPIMessage.schema),
      withConnectionMessage(ChangePasswordAPIMessage.schema),

      // Course catalog and enrollment APIMessage entries.
      withConnectionMessage(GetDashboardBaseAPIMessage.schema),
      withConnectionMessage(GetDashboardLearningAPIMessage.schema),
      withConnectionMessage(GetDashboardBusinessAPIMessage.schema),
      withConnectionMessage(GetDashboardGovernanceAPIMessage.schema),
      withConnectionMessage(GetTeachingInsightsAPIMessage.schema),
      withConnectionMessage(InitializeCourseCatalogStorage.schema),
      withConnectionMessage(SeedCourseCatalogDataIfNeededAPIMessage.schema),
      withConnectionMessage(UpsertCourseAPIMessage.schema),
      withConnectionMessage(UpdateCourseStatusAPIMessage.schema),
      withConnectionMessage(DeleteCourseAPIMessage.schema),
      withConnectionMessage(ListEnrollmentsAPIMessage.schema),
      withConnectionMessage(ListWaitlistEntriesAPIMessage.schema),
      withConnectionMessage(EnrollCourseAPIMessage.schema),
      withConnectionMessage(InitializeEnrollmentStorage.schema),
      withConnectionMessage(ListCourseReviewsAPIMessage.schema),
      withConnectionMessage(SubmitCourseReviewAPIMessage.schema),
      withConnectionMessage(InitializeCourseReviewStorage.schema),

      // Learning APIMessage entries.
      withConnectionMessage(PublishAssignmentAPIMessage.schema),
      withConnectionMessage(SubmitAssignmentAPIMessage.schema),
      withConnectionMessage(ReviewAssignmentAPIMessage.schema),
      withConnectionMessage(PublishQuizAPIMessage.schema),
      withConnectionMessage(SubmitQuizAPIMessage.schema),
      withConnectionMessage(UpdateLessonProgressAPIMessage.schema),
      withConnectionMessage(ReviewQuizAPIMessage.schema),
      withConnectionMessage(InitializeLearningStorage.schema),

      // Discussion APIMessage entries.
      withConnectionMessage(CreateDiscussionTopicAPIMessage.schema),
      withConnectionMessage(ReplyDiscussionTopicAPIMessage.schema),
      withConnectionMessage(UpdateDiscussionTopicAPIMessage.schema),
      withConnectionMessage(DeleteDiscussionTopicAPIMessage.schema),
      withConnectionMessage(UpdateDiscussionReplyAPIMessage.schema),
      withConnectionMessage(DeleteDiscussionReplyAPIMessage.schema),
      withConnectionMessage(ModerateDiscussionTopicAPIMessage.schema),
      withConnectionMessage(ModerateDiscussionReplyAPIMessage.schema),
      withConnectionMessage(ToggleDiscussionReactionAPIMessage.schema),
      withConnectionMessage(InitializeDiscussionStorage.schema),
      withConnectionMessage(CreatePlatformReportAPIMessage.schema),
      withConnectionMessage(ResolvePlatformReportAPIMessage.schema),
      withConnectionMessage(MarkNotificationReadAPIMessage.schema),
      withConnectionMessage(UpdateNotificationSettingAPIMessage.schema),

      // Admin APIMessage entries.
      withConnectionMessage(UpdateUserAccessAPIMessage.schema),
      withConnectionMessage(AuditCourseAPIMessage.schema),
      withConnectionMessage(UpsertDepartmentAPIMessage.schema),
      withConnectionMessage(UpsertMajorAPIMessage.schema),
      withConnectionMessage(UpsertAcademicClassAPIMessage.schema),
      withConnectionMessage(UpsertSemesterAPIMessage.schema),
      withConnectionMessage(DeleteDepartmentAPIMessage.schema),
      withConnectionMessage(DeleteMajorAPIMessage.schema),
      withConnectionMessage(DeleteAcademicClassAPIMessage.schema),
      withConnectionMessage(DeleteSemesterAPIMessage.schema),
      withConnectionMessage(AssignStudentsToAcademicClassAPIMessage.schema),
      withConnectionMessage(ClearStudentsAcademicClassAPIMessage.schema),
      withConnectionMessage(UpdateCourseAcademicClassesAPIMessage.schema),
      withConnectionMessage(ReviewEnrollmentAPIMessage.schema),
      withConnectionMessage(PromoteWaitlistEntryAPIMessage.schema),
      withConnectionMessage(ArchiveSemesterAPIMessage.schema)
    ).map(planner => planner.name -> planner).toMap

