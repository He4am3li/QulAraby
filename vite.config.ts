import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import geminiHandler from './api/gemini';
import liveTokenHandler from './api/gemini-live-token';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    // Read server secrets in the Node runtime only, never inject them into Vite
    // browser bundles through define or VITE_ variables.
    if (!process.env.GEMINI_API_KEY) process.env.GEMINI_API_KEY = env.GEMINI_API_KEY || '';
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        {
          name: 'local-gemini-gateway',
          configureServer(server) {
            server.middlewares.use((req, res, next) => {
              const pathname = (req.url || '').split('?')[0];
              const handler = pathname === '/api/gemini' ? geminiHandler
                : pathname === '/api/gemini-live-token' ? liveTokenHandler
                : null;
              if (!handler) return next();
              void Promise.resolve(handler(req as any, res as any)).catch(() => {
                if (!res.headersSent) {
                  res.statusCode = 500;
                  res.end(JSON.stringify({ error: 'Gateway unavailable' }));
                } else {
                  res.destroy();
                }
              });
            });
          }
        }
      ],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        chunkSizeWarningLimit: 2500,
      }
    };
});
