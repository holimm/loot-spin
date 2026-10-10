function parseHex(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h
  const n = Number.parseInt(full, 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

/** Linear blend of two hex colors; t = 0 → a, t = 1 → b. */
export function mix(a: string, b: string, t: number): string {
  const ca = parseHex(a)
  const cb = parseHex(b)
  const out = ca.map((v, i) => Math.round(v + (cb[i] - v) * t))
  return `#${out.map((v) => v.toString(16).padStart(2, '0')).join('')}`
}

export const shade = (hex: string, t: number) => mix(hex, '#000000', t)
export const tintUp = (hex: string, t: number) => mix(hex, '#ffffff', t)

export function alpha(hex: string, a: number): string {
  const [r, g, b] = parseHex(hex)
  return `rgba(${r}, ${g}, ${b}, ${a})`
}
