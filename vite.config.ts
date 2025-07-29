import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/2seongha.github.io/', // 슬래시 꼭 포함!
  plugins: [react()],
})