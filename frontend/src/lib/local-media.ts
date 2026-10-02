const avatarPrefix = 'education-avatar:'
const courseCoverPrefix = 'education-course-cover:'

export function readAvatar(userId?: string) {
  if (!userId || typeof window === 'undefined') return null
  return window.localStorage.getItem(`${avatarPrefix}${userId}`)
}

export function saveAvatar(userId: string, dataUrl: string) {
  window.localStorage.setItem(`${avatarPrefix}${userId}`, dataUrl)
}

export function readCourseCover(courseKey?: string) {
  if (!courseKey || typeof window === 'undefined') return null
  return window.localStorage.getItem(`${courseCoverPrefix}${courseKey}`)
}

export function saveCourseCover(courseKey: string, dataUrl: string) {
  window.localStorage.setItem(`${courseCoverPrefix}${courseKey}`, dataUrl)
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}
