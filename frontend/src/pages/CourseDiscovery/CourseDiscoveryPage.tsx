import { useState } from 'react'
import EducationPageGuard from '@/components/EducationPageGuard'
import EducationShell from '@/components/EducationShell'
import { useEducationDashboard } from '@/components/education-dashboard-context'
import { InlineNotice, type NoticeState, useAutoClearNotice } from '@/components/ExperienceState'
import CourseDiscoveryPanel from '@/pages/EducationHome/components/panels/CourseDiscoveryPanel/CourseDiscoveryPanel'

export default function CourseDiscovery() {
  const { enroll } = useEducationDashboard()
  const [notice, setNotice] = useState<NoticeState>(null)
  useAutoClearNotice(notice, setNotice)

  return (
    <EducationPageGuard title="课程发现" description="课程列表。" loadingVariant="courses">
      {(dashboard) => (
        <EducationShell eyebrow="课程发现" title="课程发现" description="按分类、教师、状态和价格筛选课程。">
          <div className="space-y-8">
            <InlineNotice notice={notice} />

            <CourseDiscoveryPanel
              dashboard={dashboard}
              onEnroll={async (courseId, paymentMethod, inviteCode) => {
                try {
                  await enroll(courseId, paymentMethod, inviteCode)
                  setNotice({
                    tone: 'success',
                    title: '报名成功',
                    message: '课程已加入。',
                  })
                } catch (error) {
                  setNotice({
                    tone: 'error',
                    title: '报名失败',
                    message: error instanceof Error ? error.message : '课程报名失败，请稍后重试。',
                  })
                }
              }}
            />
          </div>
        </EducationShell>
      )}
    </EducationPageGuard>
  )
}
