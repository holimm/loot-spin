import type { CelebrationTier } from '../types'

/**
 * Sound effects synthesised with the Web Audio API — no audio files to load.
 * Browsers only allow audio after a user gesture, so call `unlock()` from a
 * click handler (the open button does this) before the first sound.
 */

type Wave = OscillatorType

const MASTER_VOLUME = 0.5
const MIN_TICK_GAP_S = 0.035

const NOTES = { C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99, A5: 880, C6: 1046.5, E6: 1318.5, G6: 1568 }

let ctx: AudioContext | null = null
let master: GainNode | null = null
let muted = false
let lastTick = 0

function context(): AudioContext | null {
  if (ctx) return ctx
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctor) return null
  ctx = new Ctor()
  master = ctx.createGain()
  master.gain.value = MASTER_VOLUME
  master.connect(ctx.destination)
  return ctx
}

/** Create/resume the audio context. Must run inside a user gesture. */
export function unlock(): void {
  const c = context()
  if (c && c.state === 'suspended') void c.resume()
}

export function setMuted(value: boolean): void {
  muted = value
}

/** One enveloped tone. `at` is seconds from now. */
function tone(freq: number, { at = 0, duration = 0.25, wave = 'triangle' as Wave, volume = 0.3, slideTo }: { at?: number; duration?: number; wave?: Wave; volume?: number; slideTo?: number } = {}) {
  const c = context()
  if (!c || !master || muted) return
  const start = c.currentTime + at
  const osc = c.createOscillator()
  const gain = c.createGain()
  osc.type = wave
  osc.frequency.setValueAtTime(freq, start)
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, start + duration)
  gain.gain.setValueAtTime(0.0001, start)
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.012)
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)
  osc.connect(gain).connect(master)
  osc.start(start)
  osc.stop(start + duration + 0.05)
}

/** Short click as a card passes the marker. Rate-limited so fast spins don't turn into a buzz. */
export function tick(): void {
  const c = context()
  if (!c || muted) return
  if (c.currentTime - lastTick < MIN_TICK_GAP_S) return
  lastTick = c.currentTime
  tone(1700 + Math.random() * 250, { duration: 0.035, wave: 'square', volume: 0.09 })
}

/** Rising whoosh when the box starts opening. */
export function openStart(): void {
  tone(260, { duration: 0.35, wave: 'sawtooth', volume: 0.08, slideTo: 900 })
  tone(NOTES.C5, { at: 0.05, duration: 0.18, volume: 0.15 })
  tone(NOTES.G5, { at: 0.15, duration: 0.22, volume: 0.15 })
}

const arpeggio = (notes: number[], step: number, opts: { volume?: number; duration?: number; wave?: Wave } = {}) =>
  notes.forEach((f, i) => tone(f, { at: i * step, duration: opts.duration ?? 0.3, volume: opts.volume ?? 0.25, wave: opts.wave }))

function sparkle(count: number, from: number) {
  const high = [NOTES.C6, NOTES.E6, NOTES.G6, NOTES.A5 * 2]
  for (let i = 0; i < count; i += 1) {
    tone(high[i % high.length], { at: from + i * 0.07 + Math.random() * 0.03, duration: 0.18, wave: 'sine', volume: 0.1 })
  }
}

/** Reveal sound, bigger for rarer prizes (matches the confetti tier). */
export function reveal(tier: CelebrationTier): void {
  switch (tier) {
    case 'gentle':
      // Soft "aww" — encouraging, not sad.
      tone(NOTES.E5, { duration: 0.35, wave: 'sine', volume: 0.18 })
      tone(NOTES.C5, { at: 0.28, duration: 0.5, wave: 'sine', volume: 0.18 })
      break
    case 'small':
      arpeggio([NOTES.C5, NOTES.E5, NOTES.G5], 0.09)
      tone(NOTES.C6, { at: 0.27, duration: 0.45, volume: 0.22 })
      break
    case 'medium':
      arpeggio([NOTES.C5, NOTES.E5, NOTES.G5, NOTES.C6], 0.08)
      ;[NOTES.E5, NOTES.G5, NOTES.C6].forEach((f) => tone(f, { at: 0.34, duration: 0.7, volume: 0.15 }))
      sparkle(5, 0.4)
      break
    case 'big':
      // Fanfare: two rising runs, a held chord, then shimmer.
      arpeggio([NOTES.G5 / 2, NOTES.C5, NOTES.E5, NOTES.G5], 0.08, { wave: 'square', volume: 0.12, duration: 0.2 })
      arpeggio([NOTES.C5, NOTES.E5, NOTES.G5, NOTES.C6], 0.08, { volume: 0.22 })
      ;[NOTES.C5, NOTES.E5, NOTES.G5, NOTES.C6].forEach((f) => tone(f, { at: 0.4, duration: 1.3, volume: 0.13 }))
      ;[NOTES.D5, NOTES.G5, NOTES.C6].forEach((f) => tone(f * 1.5, { at: 0.4, duration: 1.3, wave: 'sine', volume: 0.06 }))
      sparkle(12, 0.55)
      break
  }
}
