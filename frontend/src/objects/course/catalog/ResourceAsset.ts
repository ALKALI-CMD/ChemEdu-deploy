// 文件说明：定义课程目录资源Asset领域数据类型，用于业务流程和接口传输。
import type { UserId } from '@/objects/auth/UserId'

export type ResourceAsset = {
  id: string
  courseId: string
  ownerId: UserId
  filename: string
  contentType: string
  sizeBytes: number
  storageKey: string
  previewUrl: string
  downloadUrl: string
  version: number
  visibility: string
  createdAt: string
  updatedAt: string
}
