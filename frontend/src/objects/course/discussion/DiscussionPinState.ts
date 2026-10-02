// 文件说明：定义课程讨论讨论PinState领域数据类型，用于业务流程和接口传输。
export const DiscussionPinState = {
  Normal: 'normal',
  Pinned: 'pinned',
} as const

export type DiscussionPinState = typeof DiscussionPinState[keyof typeof DiscussionPinState]
