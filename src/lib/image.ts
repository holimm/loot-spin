import { MAX_IMAGE_DATA_URL_LENGTH } from './prizes'

const MAX_SIDE = 320
const QUALITY = 0.82

export class PrizeImageError extends Error {}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new PrizeImageError('decode'))
    }
    img.src = url
  })
}

/**
 * Shrink a user's photo so it fits comfortably in localStorage: longest side
 * 320px, WebP (or JPEG where WebP encoding isn't supported, e.g. older Safari).
 * Returns a data URL.
 */
export async function fileToPrizeImage(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) throw new PrizeImageError('type')
  const img = await loadImage(file)
  if (!img.naturalWidth || !img.naturalHeight) throw new PrizeImageError('decode')

  const scale = Math.min(1, MAX_SIDE / Math.max(img.naturalWidth, img.naturalHeight))
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(img.naturalWidth * scale))
  canvas.height = Math.max(1, Math.round(img.naturalHeight * scale))
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new PrizeImageError('decode')
  // White behind transparent PNGs, since JPEG has no alpha.
  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

  let data = canvas.toDataURL('image/webp', QUALITY)
  if (!data.startsWith('data:image/webp')) data = canvas.toDataURL('image/jpeg', QUALITY)
  if (data.length > MAX_IMAGE_DATA_URL_LENGTH) throw new PrizeImageError('size')
  return data
}

export const IMAGE_ERROR_MESSAGES: Record<string, string> = {
  type: 'Tệp này không phải là ảnh. Hãy chọn một ảnh khác.',
  decode: 'Không đọc được ảnh này. Hãy chọn một ảnh khác.',
  size: 'Ảnh quá lớn. Hãy chọn một ảnh khác.',
}
