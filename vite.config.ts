import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    
    return {
      // 核心修正：指定 GitHub Pages 的子路徑，解決 404 錯誤
      base: '/cheer-clinic-appointment_final/', 
      
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          // 優化路徑別名設定
          '@': path.resolve(__dirname, './src'),
        }
      },
      build: {
        // 確保編譯輸出的檔案能正確覆蓋舊版
        outDir: 'dist',
        emptyOutDir: true,
      }
    };
});
