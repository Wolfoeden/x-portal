import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

const root = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  resolve: {
    alias: [
      { find: /^@\//, replacement: `${root}/` },
      // Next ersetzt „server-only“ beim Bauen; in Tests ist es ein leeres Modul.
      { find: /^server-only$/, replacement: `${root}/tests/server-only.ts` },
    ],
  },
  test: { include: ['tests/**/*.test.ts'] },
})
