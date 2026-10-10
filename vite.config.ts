import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

/**
 * Resolve the public base path the site is served from.
 *
 * - Unset / empty / "/"      → "/"            (local dev, custom domain, user.github.io)
 * - "loot-spin" / "/loot-spin" → "/loot-spin/" (project page: user.github.io/loot-spin/)
 * - "./"                     → "./"           (relative, portable build)
 *
 * The GitHub Actions workflow passes the path reported by `actions/configure-pages`,
 * so the repository name is never hardcoded.
 */
function resolveBase(raw: string | undefined): string {
  const value = raw?.trim()
  if (!value || value === '/') return '/'
  if (value === '.' || value === './') return './'
  return `/${value.replace(/^\/+|\/+$/g, '')}/`
}

// https://vite.dev/config/
export default defineConfig({
  base: resolveBase(process.env.BASE_PATH),
  plugins: [react(), tailwindcss()],
})
