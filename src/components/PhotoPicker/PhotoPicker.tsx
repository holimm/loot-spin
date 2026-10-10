import { Camera, Loader2 } from 'lucide-react'
import { useId, useState } from 'react'
import { IMAGE_ERROR_MESSAGES, PrizeImageError, fileToPrizeImage } from '../../lib/image'
import { PrizeImage } from '../PrizeImage/PrizeImage'

interface PhotoPickerProps {
  image: string | null
  color: string
  /** Called with the downscaled photo as a data URL. */
  onPick: (dataUrl: string) => void
  /** Accessible label for the file input. */
  label: string
  className?: string
}

/** Tap the picture to choose a photo (device gallery or camera on tablets). */
export function PhotoPicker({ image, color, onPick, label, className = 'size-16' }: PhotoPickerProps) {
  const inputId = useId()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFile = async (file: File | undefined) => {
    if (!file) return
    setBusy(true)
    setError(null)
    try {
      onPick(await fileToPrizeImage(file))
    } catch (e) {
      setError(IMAGE_ERROR_MESSAGES[e instanceof PrizeImageError ? e.message : 'decode'])
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex shrink-0 flex-col items-center">
      <label
        htmlFor={inputId}
        title={label}
        className={`relative block cursor-pointer overflow-hidden rounded-2xl border-4 bg-white transition focus-within:outline-4 focus-within:outline-offset-2 focus-within:outline-grape hover:brightness-95 ${className}`}
        style={{ borderColor: color }}
      >
        <PrizeImage image={image} color={color} className="h-full w-full" />
        <span className="absolute right-0.5 bottom-0.5 grid size-6 place-items-center rounded-full bg-ink/75 text-white">
          {busy ? <Loader2 className="size-3.5 animate-spin" aria-hidden="true" /> : <Camera className="size-3.5" aria-hidden="true" />}
        </span>
        <input
          id={inputId}
          type="file"
          accept="image/*"
          aria-label={label}
          className="sr-only"
          onChange={(e) => {
            void handleFile(e.target.files?.[0])
            e.target.value = '' // allow picking the same file again
          }}
        />
      </label>
      {error && (
        <p className="mt-1 max-w-40 text-center text-xs font-bold text-candy-dark" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
