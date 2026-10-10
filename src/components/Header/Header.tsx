import { Volume2, VolumeX } from 'lucide-react'
import { memo } from 'react'

interface HeaderProps {
  soundOn: boolean
  onToggleSound: () => void
}

export const Header = memo(function Header({ soundOn, onToggleSound }: HeaderProps) {
  return (
    <header className="mx-auto flex max-w-6xl items-center gap-3 px-4 pt-4 sm:px-6">
      <img src={`${import.meta.env.BASE_URL}favicon.svg`} alt="" width={48} height={48} className="size-10 shrink-0 animate-float sm:size-12" />
      <div className="min-w-0">
        <p className="font-display text-xl leading-none font-extrabold text-candy min-[360px]:text-2xl sm:text-3xl">Hộp Quà May Mắn</p>
        <p className="mt-1 truncate text-xs font-bold text-ink-soft sm:text-sm">Trả lời đúng là được mở quà!</p>
      </div>
      <button
        type="button"
        onClick={onToggleSound}
        aria-pressed={soundOn}
        aria-label="Âm thanh"
        title={soundOn ? 'Tắt âm thanh' : 'Bật âm thanh'}
        className="btn-white ml-auto h-12 shrink-0 px-4 text-base"
      >
        {soundOn ? <Volume2 className="size-6" aria-hidden="true" /> : <VolumeX className="size-6 text-ink-soft" aria-hidden="true" />}
        <span className="hidden sm:inline">{soundOn ? 'Âm thanh: bật' : 'Âm thanh: tắt'}</span>
      </button>
    </header>
  )
})
