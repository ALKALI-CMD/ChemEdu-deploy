import type { Course } from '@/objects/course/catalog/Course'
import type { CourseEditorInput } from '@/components/course-editor/CourseEditorInput'
import type { CourseLessonInput } from '@/objects/course/catalog/CourseLessonInput'
import type { CourseModuleInput } from '@/objects/course/catalog/CourseModuleInput'
import type { LessonType } from '@/objects/course/catalog/LessonType'
import { CourseStatus } from '@/objects/course/catalog/CourseStatus'
import { LessonContentType } from '@/objects/course/catalog/LessonContentType'
import { LessonType as LessonTypeEnum } from '@/objects/course/catalog/LessonType'
import { AssignmentAttachmentType } from '@/objects/course/learning/AssignmentAttachmentType'
import { zh } from '@/lib/localization'
import type { EditorStep } from '@/components/course-editor/useCourseEditorModel'

function cleanText(value: string) {
  return value.trim()
}

const rawCategoryOptions = ['前端开发', '后端开发', '软件工程', '数据分析', '人工智能', '设计与产品', '通识课程'] as const
const categoryOptions = Array.from(new Set(rawCategoryOptions)) as typeof rawCategoryOptions[number][]

const gradeOptions = ['不限年级', '大一', '大二', '大三', '大四', '研究生'] as const

const scheduleOptions = [
  '周一 08:00-10:00',
  '周一 14:00-16:00',
  '周二 08:00-10:00',
  '周二 14:00-16:00',
  '周三 08:00-10:00',
  '周三 14:00-16:00',
  '周四 08:00-10:00',
  '周四 14:00-16:00',
  '周五 08:00-10:00',
  '周五 14:00-16:00',
] as const

const lessonTypeOptions = [
  { value: LessonTypeEnum.Video, label: '视频' },
  { value: LessonTypeEnum.Document, label: '文档' },
  { value: LessonTypeEnum.Quiz, label: '测验' },
  { value: LessonTypeEnum.Live, label: '直播' },
] as const

const emptyCourseInput: CourseEditorInput = {
  title: cleanText(''),
  subtitle: cleanText(''),
  category: cleanText(''),
  grade: '',
  schedule: cleanText(''),
  price: 0,
  rating: 0,
  completionRate: 0,
  status: CourseStatus.Draft,
  assistants: [],
  academicClassIds: [],
  capacity: 60,
  enrollmentPolicy: {
    requiresApproval: false,
    waitlistEnabled: false,
  },
  tags: [],
  description: cleanText(''),
  coverImageUrl: undefined,
  modules: [
    {
      title: cleanText('章节 1'),
      lessons: [
        {
          title: cleanText('课时 1'),
          duration: cleanText('15 分钟'),
          type: LessonTypeEnum.Video,
          completed: false,
          contentBlocks: [
            {
              id: 'lesson-1-body',
              contentType: LessonContentType.RichText,
              title: '正文',
              content: '',
            },
          ],
          resourceAttachments: [],
          requiredStudyMinutes: 15,
        },
      ],
    },
  ],
}

const stepCopy: Record<
  EditorStep,
  {
    label: string
    description: string
  }
> = {
  basic: {
    label: '基本信息',
    description: '先完成课程标题、分类、简介和教学安排。',
  },
  structure: {
    label: '章节课时',
    description: '继续整理课程目录、章节顺序和课时类型。',
  },
  publish: {
    label: '发布设置',
    description: '最后确认助教、标签、价格和发布状态。',
  },
}

function normalizeLessonType(value: string): LessonType {
  switch (value.trim().toLowerCase()) {
    case '视频':
    case 'video':
      return LessonTypeEnum.Video
    case '文档':
    case 'document':
    case 'doc':
      return LessonTypeEnum.Document
    case '测验':
    case 'quiz':
      return LessonTypeEnum.Quiz
    case '直播':
    case 'live':
      return LessonTypeEnum.Live
    default:
      return LessonTypeEnum.Video
  }
}

function cloneEmptyLesson(order: number): CourseLessonInput {
  return {
    title: cleanText(`课时 ${order}`),
    duration: cleanText('15 分钟'),
    type: LessonTypeEnum.Video,
    completed: false,
    contentBlocks: [
      {
        id: `lesson-${order}-body`,
        contentType: LessonContentType.RichText,
        title: '正文',
        content: '',
      },
    ],
    resourceAttachments: [],
    requiredStudyMinutes: 15,
  }
}

function cloneEmptyModule(order: number): CourseModuleInput {
  return {
    title: cleanText(`章节 ${order}`),
    lessons: [cloneEmptyLesson(1)],
  }
}

function cloneEmptyInput(): CourseEditorInput {
  return {
    ...emptyCourseInput,
    modules: emptyCourseInput.modules.map((module) => ({
      ...module,
      lessons: module.lessons.map((lesson) => ({ ...lesson })),
    })),
  }
}

function toInput(course?: Course): CourseEditorInput {
  if (!course) {
    return cloneEmptyInput()
  }

  return {
    courseId: course.id,
    title: cleanText(zh(course.title)),
    subtitle: cleanText(zh(course.subtitle)),
    category: cleanText(zh(course.category)),
    grade: zh(course.grade).trim(),
    schedule: cleanText(zh(course.schedule)),
    price: course.price,
    rating: course.rating,
    completionRate: course.completionRate,
    status: course.status,
    teacherId: course.teacherId,
    assistants: [...course.assistants],
    semesterLabel: course.semesterLabel,
    offeringCode: course.offeringCode,
    startsAt: course.startsAt,
    endsAt: course.endsAt,
    academicClassIds: [...course.academicClassIds],
    capacity: course.capacity,
    enrollmentPolicy: { ...course.enrollmentPolicy },
    tags: course.tags.map(zh),
    description: cleanText(zh(course.description)),
    coverImageUrl: course.coverImageUrl,
    modules: course.modules.map((module) => ({
      id: module.id,
      title: cleanText(zh(module.title)),
      lessons: module.lessons.map((lesson) => ({
        id: lesson.id,
        title: cleanText(zh(lesson.title)),
        duration: cleanText(zh(lesson.duration)),
        type: lesson.type,
        completed: lesson.completed,
        contentBlocks: lesson.contentBlocks.map((block) => ({
          ...block,
          title: zh(block.title),
          content: zh(block.content),
        })),
        resourceAttachments: lesson.resourceAttachments.map((attachment) => ({
          ...attachment,
          label: zh(attachment.label).trim(),
          url: zh(attachment.url).trim(),
          attachmentType: attachment.attachmentType ?? AssignmentAttachmentType.Reference,
        })),
        videoUrl: lesson.videoUrl,
        documentUrl: lesson.documentUrl,
        unlockAfterLessonId: lesson.unlockAfterLessonId,
        requiredStudyMinutes: lesson.requiredStudyMinutes,
      })),
    })),
  }
}

export {
  categoryOptions,
  cloneEmptyLesson,
  cloneEmptyModule,
  gradeOptions,
  lessonTypeOptions,
  normalizeLessonType,
  scheduleOptions,
  stepCopy,
  toInput,
}
