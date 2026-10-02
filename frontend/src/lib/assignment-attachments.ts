import { AssignmentAttachmentType } from '@/objects/course/learning/AssignmentAttachmentType'
import type { AssignmentAttachment } from '@/objects/course/learning/AssignmentAttachment'

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '')
    reader.onerror = () => reject(new Error(`无法读取文件：${file.name}`))
    reader.readAsDataURL(file)
  })
}

export async function filesToAssignmentAttachments(
  files: FileList | null,
  attachmentType: AssignmentAttachmentType,
): Promise<AssignmentAttachment[]> {
  if (!files || files.length === 0) {
    return []
  }

  const fileArray = Array.from(files)
  const uploadedAt = new Date().toISOString()

  return Promise.all(
    fileArray.map(async (file) => ({
      label: file.name.trim(),
      url: (await readFileAsDataUrl(file)).trim(),
      attachmentType,
      sizeBytes: file.size,
      uploadedAt,
    })),
  )
}
