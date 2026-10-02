import { UserRole } from '@/objects/auth/UserRole'

export const roleLabel: Record<UserRole, string> = {
  [UserRole.Student]: '学生',
  [UserRole.Teacher]: '教研老师',
  [UserRole.Assistant]: '助教老师',
  [UserRole.Analyst]: '数据分析处',
  [UserRole.Admin]: '校长',
}

const avatarOutputSize = 320

export function clampOffset(offset: number, scaledSize: number) {
  if (scaledSize <= avatarOutputSize) {
    return (avatarOutputSize - scaledSize) / 2
  }
  return Math.min(0, Math.max(avatarOutputSize - scaledSize, offset))
}

export function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('头像图片读取失败，请重新选择图片。'))
    image.src = dataUrl
  })
}

export async function cropAvatarImage(source: string, cropX: number, cropY: number, zoom: number) {
  const image = await loadImage(source)
  const canvas = document.createElement('canvas')
  canvas.width = avatarOutputSize
  canvas.height = avatarOutputSize
  const context = canvas.getContext('2d')
  if (!context) {
    throw new Error('当前浏览器无法裁剪头像。')
  }

  const baseScale = Math.max(avatarOutputSize / image.width, avatarOutputSize / image.height)
  const scale = baseScale * zoom
  const scaledWidth = image.width * scale
  const scaledHeight = image.height * scale
  const focusX = image.width * (cropX / 100) * scale
  const focusY = image.height * (cropY / 100) * scale
  const drawX = clampOffset(avatarOutputSize / 2 - focusX, scaledWidth)
  const drawY = clampOffset(avatarOutputSize / 2 - focusY, scaledHeight)

  context.fillStyle = '#ffffff'
  context.fillRect(0, 0, avatarOutputSize, avatarOutputSize)
  context.drawImage(image, drawX, drawY, scaledWidth, scaledHeight)
  return canvas.toDataURL('image/png')
}

export function getDirectionLabel(role: UserRole): string {
  if (role === UserRole.Student) {
    return '学习方向'
  }
  if (role === UserRole.Teacher) {
    return '授课方向'
  }
  if (role === UserRole.Assistant) {
    return '辅助方向'
  }
  return '管理方向'
}
