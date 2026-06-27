import { defineConfig } from 'vite';

// 기존 단일 index.html 기반 앱을 그대로 두고, 계정/랭킹 모듈(src/account.js)만
// 모듈 스크립트로 추가하는 구조. Vite는 index.html을 엔트리로 사용한다.
export default defineConfig({
  root: '.',
  build: {
    target: 'es2019',
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    host: true,
  },
});
