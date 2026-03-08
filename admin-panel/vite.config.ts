import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

type CountdownLang = 'ge' | 'am' | 'az';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const backendUrl = env.VITE_BACKEND_URL || 'http://localhost:3000';
  const countdownLang = env.VITE_COUNTDOWN_LANG as CountdownLang | undefined;
  const isCountdown = countdownLang && ['ge', 'am', 'az'].includes(countdownLang);

  return {
    plugins: [react()],
    base: isCountdown ? `/legacy-countdown-${countdownLang}/` : '/',
    build: isCountdown
      ? {
          outDir: `dist-legacy-countdown-${countdownLang}`,
          emptyOutDir: true,
          rollupOptions: {
            input: { index: `countdown-${countdownLang}.html` },
          },
        }
      : undefined,
    server: {
      proxy: {
        '/api': {
          target: backendUrl,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
