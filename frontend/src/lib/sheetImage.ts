// 文件说明：考试评定域图片工具，把答题卡图片压缩为适合入库的 data URL。
export async function readImageAsCompressedDataUrl(
  file: File,
  maxDimension = 1600,
  quality = 0.82,
): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('请选择图片文件（答题卡扫描件或照片）。')
  }

  if (file.type === 'image/svg+xml') {
    return fileToDataUrl(file)
  }

  const dataUrl = await fileToDataUrl(file)
  const image = await loadImage(dataUrl)
  const scale = Math.min(1, maxDimension / Math.max(image.naturalWidth, image.naturalHeight))

  if (scale >= 1 && dataUrl.length < 2_500_000) {
    return dataUrl
  }

  const canvas = document.createElement('canvas')
  canvas.width = Math.round(image.naturalWidth * scale)
  canvas.height = Math.round(image.naturalHeight * scale)
  const context = canvas.getContext('2d')
  if (!context) {
    return dataUrl
  }
  context.drawImage(image, 0, 0, canvas.width, canvas.height)
  return canvas.toDataURL('image/jpeg', quality)
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('读取图片失败，请重试。'))
    reader.readAsDataURL(file)
  })
}

function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('图片解析失败，请更换文件。'))
    image.src = dataUrl
  })
}
