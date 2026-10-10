export function Header() {
  return (
    <header className="mx-auto flex max-w-6xl items-center gap-3 px-4 pt-4 sm:px-6">
      <img src={`${import.meta.env.BASE_URL}favicon.svg`} alt="" width={48} height={48} className="size-12 shrink-0 animate-float" />
      <div className="min-w-0">
        <p className="font-display text-2xl leading-none font-extrabold text-candy sm:text-3xl">Hộp Quà May Mắn</p>
        <p className="mt-1 truncate text-sm font-bold text-ink-soft">Trả lời đúng là được mở quà!</p>
      </div>
    </header>
  )
}
