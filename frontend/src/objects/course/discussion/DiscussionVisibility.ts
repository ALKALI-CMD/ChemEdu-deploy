// 文件说明：定义课程讨论讨论Visibility领域数据类型，用于业务流程和接口传输。
export const DiscussionVisibility = {
  Visible: 'visible',
  Hidden: 'hidden',
} as const

export type DiscussionVisibility = typeof DiscussionVisibility[keyof typeof DiscussionVisibility]
