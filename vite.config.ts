import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // 최대 압축 설정
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // 프로덕션에서 console.log 제거
        drop_debugger: true, // debugger 제거
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.trace'], // 특정 함수 제거
        passes: 3, // 압축 패스 횟수 증가
      },
      mangle: {
        safari10: true, // Safari 10 호환성
      },
      format: {
        comments: false, // 모든 주석 제거
      },
    },
    // 청크 분할 최적화
    rollupOptions: {
      output: {
        manualChunks: {
          // 벤더 라이브러리 분리
          'vendor-react': ['react', 'react-dom'],
          'vendor-ionic': ['@ionic/react', '@ionic/react-router'],
          'vendor-router': ['react-router', 'react-router-dom'],
          'vendor-icons': ['ionicons'],
          'vendor-utils': ['zustand'],
        },
        // 파일명 최적화
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const extType = assetInfo.name.split('.').at(1);
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
            return `img/[name]-[hash][extname]`;
          }
          if (/css/i.test(extType)) {
            return `css/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
      },
    },
    // CSS 압축 (Ionic 호환성을 위해 기본 압축 사용)
    cssMinify: true,
    // 소스맵 비활성화 (프로덕션)
    sourcemap: false,
    // 청크 크기 경고 임계값 증가
    chunkSizeWarningLimit: 1000,
    // 에셋 인라인 임계값
    assetsInlineLimit: 8192, // 8kb 이하 인라인화
    // 압축 레벨 최대
    target: 'es2018',
    // 모든 에셋 압축
    copyPublicDir: true,
  },
  // CSS 전처리기 최적화
  css: {
    devSourcemap: false,
  },
  assetsInclude: ['**/*.webp', '**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.gif', '**/*.svg']
})