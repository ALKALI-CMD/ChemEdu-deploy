package microservices.course.catalog.tables


private[catalog] object CourseSeedTable:

  val seedStatements: List[String] = List(
    """
      |insert into edu_departments (id, name)
      |values
      |  ('dept-eng', '工程学院'),
      |  ('dept-sci', '理学院');
      |""".stripMargin,
    """
      |insert into edu_majors (id, department_id, name)
      |values
      |  ('major-se', 'dept-eng', '软件工程'),
      |  ('major-ai', 'dept-eng', '人工智能'),
      |  ('major-math', 'dept-sci', '数学与应用数学');
      |""".stripMargin,
    """
      |insert into edu_academic_classes (id, major_id, grade, name, capacity)
      |values
      |  ('class-se-2025-1', 'major-se', '2025级', '软件工程 1 班', 45),
      |  ('class-ai-2025-1', 'major-ai', '2025级', '人工智能 1 班', 40),
      |  ('class-math-2025-1', 'major-math', '2025级', '数学 1 班', 35);
      |""".stripMargin,
    """
      |insert into edu_semesters (id, label, start_at, end_at, archived)
      |values
      |  ('semester-2026-spring', '2026 春季学期', '2026-02-24', '2026-06-28', false),
      |  ('semester-2025-fall', '2025 秋季学期', '2025-09-01', '2026-01-10', true);
      |""".stripMargin,
    """
      |insert into edu_users (
      |  id, name, email, password_hash, password_salt, role, age, grade, subject, department_id, department_name,
      |  major_id, major_name, academic_class_id, academic_class_name, bio, permissions
      |)
      |values
      |  ('student-lin', 'Lin Zhida', 'lin@example.com', 'fed7b2c8a82bcfd914c9abf5d4423a51d51e9b0ae01a9873e79c34603226910f', '00112233445566778899aabbccddeeff', 'student', 19, 'Freshman', null, 'dept-eng', '工程学院', 'major-se', '软件工程', 'class-se-2025-1', '软件工程 1 班', 'Focused on type-safe full-stack learning.', ''),
      |  ('teacher-zhou', 'Zhou Yicheng', 'zhou@example.com', 'b37c1c4eaf80e803852c869e027a543e35cc3c0992b201be8b6382da27af38ca', '102132435465768798a9babbdcedfe0f', 'teacher', null, null, 'Software Engineering', 'dept-eng', '工程学院', 'major-se', '软件工程', null, null, 'Teaches architecture, type-safe systems, and collaboration.', ''),
      |  ('assistant-yang', 'Yang Kai', 'yang@example.com', 'bd165b03062548db98a9ce039d4d953abc281fa9102825df82c324e67c6b336e', 'ffeeddccbbaa99887766554433221100', 'assistant', null, null, 'Full Stack Development', 'dept-eng', '工程学院', 'major-ai', '人工智能', null, null, 'Assists grading, Q and A, and workshop tutoring.', ''),
      |  ('admin-he', 'He Jiacheng', 'admin@example.com', '710a4ff9cab036703bacf4a56d23192761dfbc3fbd05f7fedcd5be22e99612b4', '0f1e2d3c4b5a69788796a5b4c3d2e1f0', 'admin', null, null, null, null, null, null, null, null, null, 'Manages platform operations, permissions, and audits.', 'user:manage,course:audit,report:view');
      |""".stripMargin,
    """
      |insert into edu_courses (
      |  id, title, subtitle, category, grade, schedule, price, rating, completion_rate, status,
      |  teacher_id, assistants, semester_label, offering_code, starts_at, ends_at, academic_class_ids,
      |  capacity, enrollment_requires_approval, enrollment_open_at, enrollment_close_at, waitlist_enabled,
      |  enrollment_invite_code, tags, description
      |)
      |values
      |  ('ts-fullstack', 'Type-Safe Full-Stack Systems', 'Build an education platform from domain models to React and Scala.', 'Programming', 'Freshman-Sophomore', 'Tue 19:00 - 21:00', 299, 4.9, 78, 'published', 'teacher-zhou', 'assistant-yang', '2026 春季学期', 'SE-2026-01', '2026-03-01T19:00:00Z', '2026-06-20T21:00:00Z', 'class-se-2025-1', 1, false, '2026-02-20T00:00:00Z', '2026-03-31T23:59:59Z', true, null, 'TypeScript,Scala,React,API Design', 'Covers authentication, courses, assignments, quizzes, orders, and analytics in one project.'),
      |  ('math-visual', 'Visual Calculus Basics', 'Understand limits, derivatives, and integrals through visual intuition.', 'Mathematics', 'Freshman', 'Thu 18:30 - 20:00', 0, 4.7, 84, 'published', 'teacher-zhou', 'assistant-yang', '2026 春季学期', 'MATH-2026-01', '2026-03-05T18:30:00Z', '2026-06-26T20:00:00Z', 'class-math-2025-1', 50, false, '2026-02-24T00:00:00Z', '2026-04-10T23:59:59Z', false, null, 'Calculus,Visualization,Exercises', 'Uses diagrams, worked examples, and short quizzes to build intuition.'),
      |  ('ai-study-lab', 'AI Study Lab', 'Prompt design, evaluation, and automation practice for students.', 'General Education', 'All Grades', 'Fri 19:30 - 21:00', 149, 4.8, 72, 'published', 'teacher-zhou', 'assistant-yang', '2026 春季学期', 'AI-2026-02', '2026-03-08T19:30:00Z', '2026-06-21T21:00:00Z', 'class-ai-2025-1', 40, true, '2026-02-28T00:00:00Z', '2026-03-20T23:59:59Z', true, 'AI-LAB-2026', 'AI,Prompting,Automation,Automation', 'Focuses on applying AI tools to planning, content generation, and delivery.'),
      |  ('ux-pitch', 'Education Product UX and Growth', 'Turn course quality into better learning experience and conversion.', 'Design and Operations', 'All Grades', 'Weekend Workshop', 199, 4.8, 69, 'draft', 'teacher-zhou', '', '2026 春季学期', 'UX-2026-01', '2026-04-01T09:00:00Z', '2026-05-31T17:00:00Z', '', 30, false, null, null, false, null, 'UX,Growth,Operations', 'Designed for teachers and operators who want to optimize course pages and growth strategy.');
      |""".stripMargin,
    """
      |insert into edu_course_modules (id, course_id, title, position)
      |values
      |  ('m1', 'ts-fullstack', 'Requirements and Domain Modeling', 1),
      |  ('m2', 'ts-fullstack', 'Learning Flow Design', 2),
      |  ('m3', 'math-visual', 'Limits and Continuity', 1),
      |  ('m4', 'ux-pitch', 'Learning Path Design', 1),
      |  ('m5', 'ai-study-lab', 'Prompting Foundations', 1),
      |  ('m6', 'ai-study-lab', 'Automation Automation', 2);
      |""".stripMargin,
    """
      |insert into edu_course_lessons (id, module_id, title, duration, lesson_type, completed, position)
      |values
      |  ('l1', 'm1', 'Role boundaries and permissions', '22 min', 'video', true, 1),
      |  ('l2', 'm1', 'Modeling courses, assignments, and quizzes', '18 min', 'document', true, 2),
      |  ('l3', 'm2', 'Video learning and progress tracking', '26 min', 'video', false, 1),
      |  ('l4', 'm2', 'Quiz flow and automated grading', '15 min', 'quiz', false, 2),
      |  ('l5', 'm3', 'Geometric intuition of limits', '20 min', 'video', true, 1),
      |  ('l6', 'm3', 'Continuity checkpoint quiz', '10 min', 'quiz', false, 2),
      |  ('l7', 'm4', 'Designing a course landing page', '17 min', 'document', false, 1),
      |  ('l8', 'm5', 'How prompts shape model behavior', '19 min', 'video', true, 1),
      |  ('l9', 'm5', 'Prompt iteration practice', '14 min', 'document', false, 2),
      |  ('l10', 'm6', 'Tool orchestration and model collaboration', '24 min', 'video', false, 1),
      |  ('l11', 'm6', 'Milestone review checkpoint', '12 min', 'quiz', false, 2);
      |""".stripMargin,
    """
      |insert into edu_enrollments (user_id, course_id, enrolled_at, status)
      |values
      |  ('student-lin', 'ts-fullstack', '2026-03-20T12:00:00Z', 'enrolled'),
      |  ('student-lin', 'math-visual', '2026-03-24T12:00:00Z', 'enrolled');
      |""".stripMargin,
    """
      |insert into edu_course_waitlist (user_id, course_id, queued_at, position)
      |values
      |  ('student-lin', 'ai-study-lab', '2026-03-01T10:00:00Z', 1);
      |""".stripMargin,
    """
      |insert into edu_course_reviews (id, course_id, user_id, author, rating, content, created_at, updated_at)
      |values
      |  ('cr1', 'ts-fullstack', 'student-lin', 'Lin Zhida', 5, '课程内容完整，章节安排清晰。', '2026-04-10T10:00:00Z', null),
      |  ('cr2', 'math-visual', 'student-lin', 'Lin Zhida', 4, '示例直观，测验难度适中。', '2026-04-11T10:00:00Z', null);
      |""".stripMargin,
    """
      |insert into edu_assignments (id, course_id, student_id, title, description, deadline, attachment_label, submission_status, score)
      |values
      |  ('a1', 'ts-fullstack', 'student-lin', 'Education platform ER design', 'Model users, courses, assignments, quizzes, and orders with clear constraints.', '2026-04-12 23:59', 'er-template.pdf', 'submitted', 93),
      |  ('a2', 'ts-fullstack', 'student-lin', 'Learning center wireframe', 'Implement the course directory, progress area, notes, and quiz entry.', '2026-04-16 23:59', 'wireframe.fig', 'pending', null),
      |  ('a3', 'math-visual', 'student-lin', 'Derivative optimization exercise', 'Submit a complete worked solution for an optimization problem.', '2026-04-09 20:00', 'exercise.docx', 'reviewed', 88);
      |""".stripMargin,
    """
      |insert into edu_quizzes (id, course_id, student_id, title, duration_minutes, objective_question_count, subjective_question_count, status, score)
      |values
      |  ('q1', 'ts-fullstack', 'student-lin', 'Roles and permissions quiz', 25, 8, 2, 'finished', 91),
      |  ('q2', 'math-visual', 'student-lin', 'Limits and continuity quiz', 15, 10, 0, 'upcoming', null);
      |""".stripMargin,
    """
      |insert into edu_discussions (id, course_id, title, author, content, reply_count, last_reply_at)
      |values
      |  ('d1', 'ts-fullstack', 'Should enrollment and order be modeled in one aggregate?', 'Lin Zhida', 'I am deciding whether enrollment and payment should share one lifecycle or stay separate.', 2, '2 hours ago'),
      |  ('d2', 'ts-fullstack', 'How should assistants review subjective questions?', 'Yang Kai', 'For subjective quiz items, should assistants draft feedback before teachers finalize scores?', 1, 'Today 10:30'),
      |  ('d3', 'math-visual', 'Can you show another example of continuity without differentiability?', 'Chen Xinyu', 'The absolute value example is clear. I want one more visual case for comparison.', 1, 'Yesterday');
      |""".stripMargin,
    """
      |insert into edu_discussion_replies (id, topic_id, author, content, created_at)
      |values
      |  ('dr1', 'd1', 'Zhou Yicheng', 'Keep enrollment as learning access and order as commercial state. They change for different reasons.', '2026-04-15T09:20:00Z'),
      |  ('dr2', 'd1', 'Yang Kai', 'That also makes refunds easier because access and payment history can be audited independently.', '2026-04-15T10:10:00Z'),
      |  ('dr3', 'd2', 'Zhou Yicheng', 'Assistants can prepare feedback, but the final score should remain attributable to the teacher.', '2026-04-16T10:30:00Z'),
      |  ('dr4', 'd3', 'Zhou Yicheng', 'Try the cusp of y = |x| and compare it with a smooth parabola near zero.', '2026-04-14T18:00:00Z');
      |""".stripMargin,
    """
      |insert into edu_messages (id, sender_name, recipient_name, content, attachment_label, sent_at)
      |values
      |  ('msg1', 'Zhou Yicheng', 'Lin Zhida', 'Your domain model is solid. Next, consider separating order state and payment state.', null, 'Today 09:20'),
      |  ('msg2', 'Yang Kai', 'Lin Zhida', 'The TA notes are ready. Remember to cover both file upload and text submission scenarios.', 'notes.md', 'Yesterday 21:10');
      |""".stripMargin,
    """
      |insert into edu_orders (
      |  id, buyer, course_title, amount, status, paid_at, original_amount, discount_amount,
      |  payment_state, payment_method, coupon_code, refund_status, refund_amount,
      |  invoice_status, invoice_title, promotion_id, billing_cycle
      |)
      |values
      |  ('ORD-202603-001', 'Lin Zhida', 'Type-Safe Full-Stack Systems', 249, 'paid', '2026-03-22 20:14', 299, 50, 'paid', 'wechat', 'SPRING50', null, 0, 'issued', 'Lin Zhida', 'promo-spring-growth', 'one_time'),
      |  ('ORD-202603-018', 'Zhao Ming', 'Education Product UX and Growth', 199, 'pending', 'Pending', 199, 0, 'awaiting_payment', null, null, null, 0, 'not_requested', null, null, 'one_time');
      |""".stripMargin,
    """
      |insert into edu_coupons (id, code, title, discount_amount, min_amount, valid_from, valid_to, active)
      |values
      |  ('coupon-spring-50', 'SPRING50', '春季报名立减', 50, 199, '2026-02-20T00:00:00Z', '2026-04-30T23:59:59Z', true),
      |  ('coupon-new-30', 'NEW30', '新用户课程券', 30, 99, '2026-01-01T00:00:00Z', '2026-12-31T23:59:59Z', true);
      |""".stripMargin,
    """
      |insert into edu_promotions (id, title, description, discount_percent, starts_at, ends_at, active)
      |values
      |  ('promo-spring-growth', '春季成长计划', '面向新学期的课程促销活动，联动优惠券和学习路径推荐。', 15, '2026-02-20T00:00:00Z', '2026-04-30T23:59:59Z', true),
      |  ('promo-team-learning', '班级团报活动', '按教学班报名人数提升课程转化，支持运营侧追踪报名效果。', 10, '2026-03-01T00:00:00Z', '2026-06-30T23:59:59Z', true);
      |""".stripMargin,
    """
      |insert into edu_invoices (id, order_id, title, amount, status, issued_at)
      |values
      |  ('INV-202603-001', 'ORD-202603-001', 'Lin Zhida', 249, 'issued', '2026-03-23 09:10'),
      |  ('INV-202603-018', 'ORD-202603-018', 'Zhao Ming', 199, 'not_requested', null);
      |""".stripMargin,
    """
      |insert into edu_refunds (id, order_id, amount, reason, status, requested_at, processed_at)
      |values
      |  ('REF-202603-001', 'ORD-202603-001', 0, 'No refund requested', 'none', '2026-03-22 20:14', null);
      |""".stripMargin,
    """
      |insert into edu_resource_assets (
      |  id, course_id, owner_id, filename, content_type, size_bytes, storage_key,
      |  preview_url, download_url, version, visibility, created_at, updated_at
      |)
      |values
      |  ('res-ts-architecture-v2', 'ts-fullstack', 'teacher-zhou', 'type-safe-architecture-v2.pdf', 'application/pdf', 2846720, 'courses/ts-fullstack/type-safe-architecture-v2.pdf', '/resources/preview/res-ts-architecture-v2', '/resources/download/res-ts-architecture-v2', 2, 'course_members', '2026-03-10T09:00:00Z', '2026-04-02T09:00:00Z'),
      |  ('res-ai-prompt-kit-v1', 'ai-study-lab', 'assistant-yang', 'prompt-workshop-kit.zip', 'application/zip', 5181440, 'courses/ai-study-lab/prompt-workshop-kit-v1.zip', '/resources/preview/res-ai-prompt-kit-v1', '/resources/download/res-ai-prompt-kit-v1', 1, 'course_members', '2026-03-15T09:00:00Z', '2026-03-15T09:00:00Z'),
      |  ('res-math-visual-v1', 'math-visual', 'teacher-zhou', 'visual-calculus-notes.pdf', 'application/pdf', 1930240, 'courses/math-visual/visual-calculus-notes-v1.pdf', '/resources/preview/res-math-visual-v1', '/resources/download/res-math-visual-v1', 1, 'public', '2026-03-08T09:00:00Z', '2026-03-20T09:00:00Z');
      |""".stripMargin,
    """
      |insert into edu_teacher_tasks (id, title, assignee, status)
      |values
      |  ('t1', 'Review subjective answers and sync feedback', 'Yang Kai', 'in_progress'),
      |  ('t2', 'Add API examples for chapter 3', 'Zhou Yicheng', 'pending'),
      |  ('t3', 'Audit new course cover and categories', 'He Jiacheng', 'completed');
      |""".stripMargin
  )
