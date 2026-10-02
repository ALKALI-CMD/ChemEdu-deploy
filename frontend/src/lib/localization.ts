const exactTranslations: Record<string, string> = {
  'Lin Zhida': '林志达',
  'Zhou Yicheng': '周亦成',
  'Yang Kai': '杨凯',
  'He Jiacheng': '何嘉诚',
  'Chen Xinyu': '陈欣雨',
  'Zhao Ming': '赵明',
  Freshman: '大一',
  'Freshman-Sophomore': '大一至大二',
  'All Grades': '全年级',
  Programming: '编程开发',
  Mathematics: '数学',
  'General Education': '通识教育',
  'Design and Operations': '设计与运营',
  'Software Engineering': '软件工程',
  'Full Stack Development': '全栈开发',
  'Tue 19:00 - 21:00': '周二 19:00 - 21:00',
  'Thu 18:30 - 20:00': '周四 18:30 - 20:00',
  'Fri 19:30 - 21:00': '周五 19:30 - 21:00',
  'Weekend Workshop': '周末工作坊',
  'Type-Safe Full-Stack Systems': '类型安全全栈系统',
  'Visual Calculus Basics': '可视化微积分基础',
  'AI Study Lab': 'AI 学习实验室',
  'Education Product UX and Growth': '教育产品体验与增长',
  'Build an education platform from domain models to React and Scala.': '从领域模型到 React 与 Scala，搭建在线教育平台。',
  'Understand limits, derivatives, and integrals through visual intuition.': '通过可视化直觉理解极限、导数与积分。',
  'Prompt design, evaluation, and workflow automation for students.': '面向学生的提示词设计、评估与工作流自动化。',
  'Turn course quality into better learning experience and conversion.': '把课程质量转化为更好的学习体验和转化效果。',
  'Covers authentication, courses, assignments, quizzes, orders, and analytics in one project.':
    '在一个项目中覆盖登录鉴权、课程、作业、测验、订单和数据分析。',
  'Uses diagrams, worked examples, and short quizzes to build intuition.': '通过图示、例题和短测验建立直觉。',
  'Focuses on applying AI tools to planning, content generation, and delivery.': '聚焦用 AI 工具完成规划、内容生成和交付。',
  'Designed for teachers and operators who want to optimize course pages and growth strategy.':
    '面向希望优化课程页面与增长策略的教师和运营人员。',
  'Requirements and Domain Modeling': '需求分析与领域建模',
  'Learning Flow Design': '学习流程设计',
  'Limits and Continuity': '极限与连续',
  'Learning Path Design': '学习路径设计',
  'Prompting Foundations': '提示词基础',
  'Workflow Automation': '工作流自动化',
  'Role boundaries and permissions': '角色边界与权限',
  'Modeling courses, assignments, and quizzes': '建模课程、作业与测验',
  'Video learning and progress tracking': '视频学习与进度跟踪',
  'Quiz flow and automated grading': '测验流程与自动判分',
  'Geometric intuition of limits': '极限的几何直觉',
  'Continuity checkpoint quiz': '连续性检查测验',
  'Designing a course landing page': '设计课程详情页',
  'How prompts shape model behavior': '提示词如何影响模型行为',
  'Prompt iteration practice': '提示词迭代练习',
  'Tool orchestration and model collaboration': '工具编排与模型协作',
  'Milestone review checkpoint': '阶段复盘检查',
  'Education platform ER design': '教育平台 ER 设计',
  'Learning center wireframe': '学习中心线框图',
  'Derivative optimization exercise': '导数优化练习',
  'Model users, courses, assignments, quizzes, and orders with clear constraints.':
    '为用户、课程、作业、测验和订单建立清晰约束的数据模型。',
  'Implement the course directory, progress area, notes, and quiz entry.': '实现课程目录、进度区域、笔记和测验入口。',
  'Submit a complete worked solution for an optimization problem.': '提交一道优化问题的完整解题过程。',
  'Roles and permissions quiz': '角色与权限测验',
  'Limits and continuity quiz': '极限与连续测验',
  'Should enrollment and order be modeled in one aggregate?': '报名和订单应该放在同一个聚合里吗？',
  'How should assistants review subjective questions?': '助教应该如何参与主观题批改？',
  'Can you show another example of continuity without differentiability?': '能再举一个连续但不可导的例子吗？',
  'I am deciding whether enrollment and payment should share one lifecycle or stay separate.':
    '我在判断报名和支付是否应该共享同一个生命周期，还是应该拆开处理。',
  'For subjective quiz items, should assistants draft feedback before teachers finalize scores?':
    '主观题部分是否应该先由助教拟定反馈，再由教师确认最终分数？',
  'The absolute value example is clear. I want one more visual case for comparison.':
    '绝对值函数的例子很清楚，我还想要一个更直观的对比例子。',
  'Keep enrollment as learning access and order as commercial state. They change for different reasons.':
    '建议把报名作为学习访问权限，把订单作为商业状态处理，它们变化的原因不同。',
  'That also makes refunds easier because access and payment history can be audited independently.':
    '这样退款也更容易处理，因为访问权限和支付历史可以独立审计。',
  'Assistants can prepare feedback, but the final score should remain attributable to the teacher.':
    '助教可以准备反馈，但最终分数仍应归属于教师确认。',
  'Try the cusp of y = |x| and compare it with a smooth parabola near zero.':
    '可以看 y = |x| 的尖点，并和零点附近的平滑抛物线对比。',
  'Your domain model is solid. Next, consider separating order state and payment state.':
    '你的领域模型很扎实。下一步可以考虑拆分订单状态和支付状态。',
  'The TA notes are ready. Remember to cover both file upload and text submission scenarios.':
    '助教笔记已经准备好了。记得同时覆盖文件上传和文本提交两种场景。',
  'Review subjective answers and sync feedback': '批改主观题并同步反馈',
  'Add API examples for chapter 3': '补充第 3 章 API 示例',
  'Audit new course cover and categories': '审核新课程封面和分类',
  'Focused on type-safe full-stack learning.': '专注于类型安全的全栈学习。',
  'Teaches architecture, type-safe systems, and collaboration.': '讲授架构设计、类型安全系统与协作开发。',
  'Supports grading, Q and A, and workshop tutoring.': '支持作业评分、答疑和工作坊辅导。',
  'Manages platform operations, permissions, and audits.': '负责平台运营、权限和审核。',
  Pending: '待处理',
  Today: '今天',
  Yesterday: '昨天',
  TypeScript: 'TypeScript',
  Scala: 'Scala',
  React: 'React',
  'API Design': '接口设计',
  Calculus: '微积分',
  Visualization: '可视化',
  Exercises: '练习',
  AI: 'AI',
  Prompting: '提示词',
  Automation: '自动化',
  Workflow: '工作流',
  UX: '用户体验',
  Growth: '增长',
  Operations: '运营',
}

const lessonTypeLabel: Record<string, string> = {
  video: '视频',
  document: '文档',
  quiz: '测验',
  live: '直播',
}

const statusLabel: Record<string, string> = {
  published: '已发布',
  draft: '草稿',
  archived: '已下架',
  pending: '待处理',
  paid: '已支付',
  refunded: '已退款',
  in_progress: '进行中',
  completed: '已完成',
}

export function zh(value: unknown): string {
  if (value === null || value === undefined) {
    return ''
  }

  const raw = String(value)
  const exact = exactTranslations[raw]
  if (exact) {
    return exact
  }

  const minuteMatch = raw.match(/^(\d+)\s*min$/i)
  if (minuteMatch) {
    return `${minuteMatch[1]} 分钟`
  }

  return raw
    .replace(/\bToday\b/g, '今天')
    .replace(/\bYesterday\b/g, '昨天')
    .replace(/\bPending\b/g, '待处理')
}

export function zhList(values: string[]): string[] {
  return values.map(zh)
}

export function zhLessonType(value: string): string {
  return lessonTypeLabel[value] ?? zh(value)
}

export function zhStatus(value: string): string {
  return statusLabel[value] ?? zh(value)
}
