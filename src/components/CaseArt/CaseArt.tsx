import { memo, useId } from 'react'
import { shade, tintUp } from '../../lib/color'
import type { CaseTheme } from '../../types'

interface CaseArtProps {
  theme: CaseTheme
  className?: string
  /** Gentle floating + twinkling; off for small thumbnails. */
  animated?: boolean
}

const LID = 'M38 94 V76 C38 46 70 30 120 30 C170 30 202 46 202 76 V94 Z'
const SPARK = 'M0 -6 L1.4 -1.4 L6 0 L1.4 1.4 L0 6 L-1.4 1.4 L-6 0 L-1.4 -1.4 Z'
const SPARKS: [number, number, number, string][] = [
  [42, 40, 0.9, '0s'],
  [204, 30, 1.2, '0.9s'],
  [214, 118, 0.7, '1.6s'],
  [22, 128, 0.8, '2.2s'],
  [176, 14, 0.6, '1.2s'],
]
const RAY_ANGLES = [-162, -140, -118, -96, -74, -52, -30]

/** Original, theme-driven treasure chest illustration rendered as inline SVG. */
export const CaseArt = memo(function CaseArt({ theme, className = '', animated = false }: CaseArtProps) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const id = (name: string) => `${name}-${uid}`
  const url = (name: string) => `url(#${id(name)})`

  const bodyLight = tintUp(theme.body, 0.16)
  const bodyDark = shade(theme.body, 0.5)
  const trimLight = tintUp(theme.trim, 0.5)
  const trimDark = shade(theme.trim, 0.5)
  const Emblem = theme.emblem

  return (
    <svg viewBox="0 0 240 200" className={className} aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id={id('halo')} cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor={theme.glow} stopOpacity="0.5" />
          <stop offset="0.5" stopColor={theme.glow} stopOpacity="0.12" />
          <stop offset="1" stopColor={theme.glow} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={id('ray')} gradientUnits="userSpaceOnUse" cx="120" cy="98" r="118">
          <stop offset="0" stopColor={theme.glow} stopOpacity="0.55" />
          <stop offset="1" stopColor={theme.glow} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={id('lid')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={bodyLight} />
          <stop offset="1" stopColor={theme.body} />
        </linearGradient>
        <linearGradient id={id('body')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={theme.body} />
          <stop offset="1" stopColor={bodyDark} />
        </linearGradient>
        <linearGradient id={id('trim')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={trimLight} />
          <stop offset="0.5" stopColor={theme.trim} />
          <stop offset="1" stopColor={trimDark} />
        </linearGradient>
        <linearGradient id={id('band')} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={trimDark} />
          <stop offset="0.35" stopColor={trimLight} />
          <stop offset="0.65" stopColor={theme.trim} />
          <stop offset="1" stopColor={trimDark} />
        </linearGradient>
        <filter id={id('blur')} x="-20%" y="-200%" width="140%" height="500%">
          <feGaussianBlur stdDeviation="4" />
        </filter>
        <clipPath id={id('lidClip')}>
          <path d={LID} />
        </clipPath>
      </defs>

      <circle cx="120" cy="100" r="100" fill={url('halo')} />
      <g opacity="0.55">
        {RAY_ANGLES.map((deg) => {
          const a = (deg * Math.PI) / 180
          const spread = 0.07
          const r = 120
          const p1 = `${120 + Math.cos(a - spread) * r},${98 + Math.sin(a - spread) * r}`
          const p2 = `${120 + Math.cos(a + spread) * r},${98 + Math.sin(a + spread) * r}`
          return <polygon key={deg} points={`120,98 ${p1} ${p2}`} fill={url('ray')} />
        })}
      </g>

      <ellipse cx="120" cy="182" rx="88" ry="9" fill="#000" opacity="0.6" filter={url('blur')} />

      <g className={animated ? 'animate-float' : undefined}>
        {/* Body */}
        <rect x="38" y="102" width="164" height="74" rx="7" fill={url('body')} stroke={bodyDark} strokeWidth="2" />
        {[126, 151].map((y) => (
          <g key={y}>
            <line x1="40" x2="200" y1={y} y2={y} stroke={bodyDark} strokeWidth="2" opacity="0.8" />
            <line x1="40" x2="200" y1={y + 2} y2={y + 2} stroke={bodyLight} strokeWidth="1" opacity="0.25" />
          </g>
        ))}
        <rect x="58" y="102" width="14" height="74" fill={url('band')} />
        <rect x="168" y="102" width="14" height="74" fill={url('band')} />
        <rect x="35" y="164" width="22" height="14" rx="3" fill={url('trim')} />
        <rect x="183" y="164" width="22" height="14" rx="3" fill={url('trim')} />
        <rect x="34" y="100" width="172" height="9" rx="3" fill={url('trim')} />

        {/* Light leaking from the seam */}
        <rect x="40" y="92" width="160" height="10" fill={theme.glow} filter={url('blur')} opacity="0.95" />
        <rect x="44" y="97" width="152" height="3" rx="1.5" fill={tintUp(theme.glow, 0.65)} />

        {/* Lid */}
        <path d={LID} fill={url('lid')} stroke={bodyDark} strokeWidth="2" />
        <g clipPath={url('lidClip')}>
          {[52, 72].map((y) => (
            <line key={y} x1="30" x2="210" y1={y} y2={y} stroke={bodyDark} strokeWidth="2" opacity="0.6" />
          ))}
          <rect x="58" y="20" width="14" height="80" fill={url('band')} />
          <rect x="168" y="20" width="14" height="80" fill={url('band')} />
        </g>
        <path
          d="M52 68 C54 50 82 38 120 38 C158 38 186 50 188 68"
          fill="none"
          stroke="#fff"
          strokeOpacity="0.14"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <rect x="34" y="86" width="172" height="9" rx="3" fill={url('trim')} />

        {/* Rivets */}
        {[
          [65, 112],
          [65, 168],
          [175, 112],
          [175, 168],
          [65, 46],
          [175, 46],
        ].map(([cx, cy]) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="2.2" fill={trimLight} stroke={trimDark} strokeWidth="0.8" />
        ))}

        {/* Lock plate with the case emblem */}
        <path
          d="M104 82 h32 a4 4 0 0 1 4 4 v22 c0 9 -10 15 -20 19 c-10 -4 -20 -10 -20 -19 v-22 a4 4 0 0 1 4 -4 Z"
          fill={url('trim')}
          stroke={trimDark}
          strokeWidth="2"
        />
        <Emblem x={109} y={91} width={22} height={22} stroke={bodyDark} strokeWidth={2.4} aria-hidden="true" />
      </g>

      {SPARKS.map(([x, y, s, delay]) => (
        <g key={`${x}-${y}`} transform={`translate(${x} ${y}) scale(${s})`}>
          <path
            d={SPARK}
            fill={tintUp(theme.glow, 0.5)}
            className={animated ? 'animate-twinkle' : undefined}
            style={{ transformBox: 'fill-box', transformOrigin: 'center', animationDelay: delay }}
            opacity={animated ? undefined : 0.7}
          />
        </g>
      ))}
    </svg>
  )
})
