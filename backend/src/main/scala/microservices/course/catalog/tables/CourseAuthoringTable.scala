package microservices.course.catalog.tables

import cats.effect.IO
import io.circe.syntax.*
import microservices.course.catalog.objects.*

import java.sql.{Connection, Timestamp}
import java.time.Instant

private[catalog] object CourseAuthoringTable:

  private val upsertCourseSql: String =
    """
      |insert into edu_courses (
      |  id, title, subtitle, category, grade, schedule, price, rating,
      |  completion_rate, status, teacher_id, assistants, semester_label, offering_code,
      |  starts_at, ends_at, academic_class_ids, capacity, enrollment_requires_approval,
      |  enrollment_open_at, enrollment_close_at, waitlist_enabled, enrollment_invite_code,
      |  tags, description, cover_image_url, updated_at
      |) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      |on conflict (id) do update set
      |  title = excluded.title,
      |  subtitle = excluded.subtitle,
      |  category = excluded.category,
      |  grade = excluded.grade,
      |  schedule = excluded.schedule,
      |  price = excluded.price,
      |  rating = excluded.rating,
      |  completion_rate = excluded.completion_rate,
      |  status = excluded.status,
      |  teacher_id = excluded.teacher_id,
      |  assistants = excluded.assistants,
      |  semester_label = excluded.semester_label,
      |  offering_code = excluded.offering_code,
      |  starts_at = excluded.starts_at,
      |  ends_at = excluded.ends_at,
      |  academic_class_ids = excluded.academic_class_ids,
      |  capacity = excluded.capacity,
      |  enrollment_requires_approval = excluded.enrollment_requires_approval,
      |  enrollment_open_at = excluded.enrollment_open_at,
      |  enrollment_close_at = excluded.enrollment_close_at,
      |  waitlist_enabled = excluded.waitlist_enabled,
      |  enrollment_invite_code = excluded.enrollment_invite_code,
      |  tags = excluded.tags,
      |  description = excluded.description,
      |  cover_image_url = excluded.cover_image_url,
      |  updated_at = excluded.updated_at
      |""".stripMargin

  private val storePendingCourseRevisionSql: String =
    """
      |insert into edu_course_audits (course_id, audit_status, audit_comment, audited_by, audited_at, pending_course_payload)
      |values (?, ?, ?, ?, ?, ?)
      |on conflict (course_id) do update set
      |  audit_status = excluded.audit_status,
      |  audit_comment = excluded.audit_comment,
      |  audited_by = excluded.audited_by,
      |  audited_at = excluded.audited_at,
      |  pending_course_payload = excluded.pending_course_payload
      |""".stripMargin

  private val updateCourseStatusSql: String =
    "update edu_courses set status = ?, updated_at = ? where id = ?"

  private val deleteCourseSql: String =
    "delete from edu_courses where id = ?"

  private val deleteCourseModulesSql: String =
    "delete from edu_course_modules where course_id = ?"

  private val insertCourseModuleSql: String =
    "insert into edu_course_modules (id, course_id, title, position) values (?, ?, ?, ?)"

  private val insertCourseLessonSql: String =
    """
      |insert into edu_course_lessons (
      |  id, module_id, title, duration, lesson_type, completed, position,
      |  content_blocks, resource_attachments, video_url, document_url, unlock_after_lesson_id, required_study_minutes
      |)
      |values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      |""".stripMargin

  private val upsertCourseAuditSql: String =
    """
      |insert into edu_course_audits (course_id, audit_status, audit_comment, audited_by, audited_at)
      |values (?, ?, ?, ?, ?)
      |on conflict (course_id) do update set
      |  audit_status = excluded.audit_status,
      |  audit_comment = excluded.audit_comment,
      |  audited_by = excluded.audited_by,
      |  audited_at = excluded.audited_at,
      |  pending_course_payload = null
      |""".stripMargin

  private[catalog] def applyCourseUpsert(
    connection: Connection,
    courseId: String,
    teacherId: String,
    effectiveStatus: CourseStatus,
    request: UpsertCourseData
  ): IO[Unit] =
    CourseTable.using(connection.prepareStatement(upsertCourseSql)) { statement =>
      IO.blocking {
        statement.setObject(1, courseId)
        statement.setObject(2, request.title)
        statement.setObject(3, request.subtitle)
        statement.setObject(4, request.category)
        statement.setObject(5, request.grade)
        statement.setObject(6, request.schedule)
        statement.setObject(7, request.price)
        statement.setObject(8, request.rating)
        statement.setObject(9, request.completionRate)
        statement.setObject(10, CourseStatus.toString(effectiveStatus))
        statement.setObject(11, teacherId)
        statement.setObject(12, CourseTable.encodeUserIdCsv(request.assistants))
        statement.setObject(13, request.semesterLabel.orNull)
        statement.setObject(14, request.offeringCode.orNull)
        statement.setObject(15, request.startsAt.orNull)
        statement.setObject(16, request.endsAt.orNull)
        statement.setObject(17, CourseTable.encodeUserIdCsv(request.academicClassIds))
        statement.setObject(18, request.capacity)
        statement.setBoolean(19, request.enrollmentPolicy.requiresApproval)
        statement.setObject(20, request.enrollmentPolicy.openAt.orNull)
        statement.setObject(21, request.enrollmentPolicy.closeAt.orNull)
        statement.setBoolean(22, request.enrollmentPolicy.waitlistEnabled)
        statement.setObject(23, request.enrollmentPolicy.inviteCode.orNull)
        statement.setObject(24, CourseTable.encodeCsv(request.tags))
        statement.setObject(25, request.description)
        statement.setObject(26, request.coverImageUrl.orNull)
        statement.setTimestamp(27, Timestamp.from(Instant.now()))
        statement.executeUpdate()
      }
    }.void

  private[catalog] def storePendingCourseRevision(
    connection: Connection,
    courseId: String,
    request: UpsertCourseData
  ): IO[Unit] =
    val payload = request.asJson.noSpaces
    CourseTable.using(connection.prepareStatement(storePendingCourseRevisionSql)) { statement =>
      IO.blocking {
        statement.setObject(1, courseId)
        statement.setObject(2, CourseAuditStatus.toString(CourseAuditStatus.Pending))
        statement.setObject(3, "Teacher submitted course changes. Existing published version remains visible until approval.")
        statement.setObject(4, null)
        statement.setObject(5, null)
        statement.setObject(6, payload)
        statement.executeUpdate()
      }
    }.void

  private[catalog] def updateCourseStatus(
    connection: Connection,
    courseId: String,
    status: CourseStatus
  ): IO[Unit] =
    CourseTable.using(connection.prepareStatement(updateCourseStatusSql)) { statement =>
      IO.blocking {
        statement.setObject(1, CourseStatus.toString(status))
        statement.setTimestamp(2, Timestamp.from(Instant.now()))
        statement.setObject(3, courseId)
        statement.executeUpdate()
      }
    }.void

  private[catalog] def deleteCourse(connection: Connection, courseId: String): IO[Unit] =
    CourseTable.using(connection.prepareStatement(deleteCourseSql)) { statement =>
      IO.blocking {
        statement.setObject(1, courseId)
        statement.executeUpdate()
      }
    }.void

  private[catalog] def clearCourseStructure(connection: Connection, courseId: String): IO[Unit] =
    CourseTable.using(connection.prepareStatement(deleteCourseModulesSql)) { statement =>
      IO.blocking {
        statement.setObject(1, courseId)
        statement.executeUpdate()
      }
    }.void

  private[catalog] def insertModules(
    connection: Connection,
    courseId: String,
    modules: List[CourseModuleInput]
  ): IO[Unit] =
    modules.zipWithIndex.foldLeft(IO.unit) { case (acc, (module, moduleIndex)) =>
      acc.flatMap { _ =>
        val moduleId = module.id.getOrElse(CourseTable.generateId("module"))
        for
          _ <- CourseTable.using(connection.prepareStatement(insertCourseModuleSql)) { statement =>
            IO.blocking {
              statement.setObject(1, moduleId)
              statement.setObject(2, courseId)
              statement.setObject(3, module.title)
              statement.setObject(4, moduleIndex + 1)
              statement.executeUpdate()
            }
          }
          _ <- module.lessons.zipWithIndex.foldLeft(IO.unit) { case (lessonAcc, (lesson, lessonIndex)) =>
            lessonAcc.flatMap { _ =>
              val lessonId = lesson.id.getOrElse(CourseTable.generateId("lesson"))
              CourseTable.using(connection.prepareStatement(insertCourseLessonSql)) { statement =>
                IO.blocking {
                  statement.setObject(1, lessonId)
                  statement.setObject(2, moduleId)
                  statement.setObject(3, lesson.title)
                  statement.setObject(4, lesson.duration)
                  statement.setObject(5, LessonType.toString(lesson.`type`))
                  statement.setBoolean(6, lesson.completed)
                  statement.setObject(7, lessonIndex + 1)
                  statement.setObject(8, lesson.contentBlocks.asJson.noSpaces)
                  statement.setObject(9, lesson.resourceAttachments.asJson.noSpaces)
                  statement.setObject(10, lesson.videoUrl.orNull)
                  statement.setObject(11, lesson.documentUrl.orNull)
                  statement.setObject(12, lesson.unlockAfterLessonId.orNull)
                  statement.setObject(13, lesson.requiredStudyMinutes)
                  statement.executeUpdate()
                }
              }
            }
          }
        yield ()
      }
    }

  private[catalog] def upsertCourseAuditRow(
    connection: Connection,
    courseId: String,
    auditStatus: CourseAuditStatus,
    auditComment: String,
    auditedBy: Option[String],
    auditedAt: Option[String]
  ): IO[Unit] =
    CourseTable.using(connection.prepareStatement(upsertCourseAuditSql)) { statement =>
      IO.blocking {
        statement.setObject(1, courseId)
        statement.setObject(2, CourseAuditStatus.toString(auditStatus))
        statement.setObject(3, auditComment)
        statement.setObject(4, auditedBy.orNull)
        statement.setObject(5, auditedAt.orNull)
        statement.executeUpdate()
      }
    }.void
