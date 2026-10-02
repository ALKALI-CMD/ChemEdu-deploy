import { useEffect, useState } from 'react'
import type { UserId } from '@/objects/auth/UserId'
import type { CourseReview } from '@/objects/course/review/CourseReviewEntity'
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Textarea } from '@/components/ui/UiComponents'
import { zh } from '@/lib/localization'

type CourseReviewsPanelProps = {
  reviews: CourseReview[]
  currentUserId: UserId
  canSubmit: boolean
  submitting: boolean
  onSubmit: (rating: number, content: string) => Promise<void>
}

export default function CourseReviewsPanel({
  reviews,
  currentUserId,
  canSubmit,
  submitting,
  onSubmit,
}: CourseReviewsPanelProps) {
  const ownReview = reviews.find((review) => review.userId === currentUserId)
  const [rating, setRating] = useState<number>(Number(ownReview?.rating ?? 5))
  const [content, setContent] = useState(ownReview?.content ?? '')

  useEffect(() => {
    setRating(Number(ownReview?.rating ?? 5))
    setContent(ownReview?.content ?? '')
  }, [ownReview])

  const averageRating =
    reviews.length > 0 ? (reviews.reduce((sum, review) => sum + Number(review.rating), 0) / reviews.length).toFixed(1) : '暂无'

  return (
    <Card className="border-slate-200 bg-white text-slate-900 shadow-sm">
      <CardHeader className="space-y-3">
        <CardTitle className="text-slate-950">课程评分与评价</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-500">平均评分</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">{averageRating}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-500">评价数量</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">{reviews.length}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-500">我的状态</p>
            <p className="mt-2 text-lg font-semibold text-slate-950">
              {ownReview ? '已提交评价' : canSubmit ? '可提交评价' : '暂不可提交'}
            </p>
          </div>
        </div>

        {canSubmit ? (
          <div className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-950">{ownReview ? '修改评价' : '提交评价'}</p>
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <Button
                    key={value}
                    type="button"
                    variant="outline"
                    className={
                      rating === value
                        ? 'rounded-full bg-slate-950 text-white hover:bg-slate-800'
                        : 'rounded-full border-slate-300 bg-white text-slate-900 hover:bg-slate-100'
                    }
                    onClick={() => setRating(value)}
                  >
                    {value} 分
                  </Button>
                ))}
              </div>
            </div>

            <Textarea
              className="min-h-28 bg-white"
              placeholder="说说这门课哪里有帮助、哪里还可以改进，后来的同学会看到你的建议。"
              value={content}
              onChange={(event) => setContent(event.target.value)}
            />

            <div className="flex justify-end">
              <Button
                type="button"
                className="rounded-full bg-slate-950 text-white hover:bg-slate-800"
                disabled={submitting}
                onClick={() => void onSubmit(rating, content)}
              >
                {submitting ? '提交中...' : ownReview ? '保存评价' : '提交评价'}
              </Button>
            </div>
          </div>
        ) : (
          <p className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">报名并学习课程后可提交评价。</p>
        )}

        <div className="space-y-4">
          {reviews.length === 0 ? (
            <p className="text-sm text-slate-500">暂时还没有课程评价。</p>
          ) : (
            reviews.map((review) => (
              <div key={review.id} className="rounded-3xl border border-slate-200 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-slate-950">{zh(review.author)}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {review.updatedAt ? `更新于 ${zh(review.updatedAt)}` : `发布于 ${zh(review.createdAt)}`}
                    </p>
                  </div>
                  <Badge className="rounded-full border border-slate-200 bg-white text-slate-900 hover:bg-white">
                    {Number(review.rating)} 分
                  </Badge>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-700">{zh(review.content)}</p>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
