import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Default "/" for local dev; GitHub Actions sets VITE_BASE_PATH for Pages
const base = process.env.VITE_BASE_PATH ?? '/'

export default defineConfig({
  base,
  plugins: [react()],
  server: {
    fs: {
      allow: ['.'],
    },
  },
})
