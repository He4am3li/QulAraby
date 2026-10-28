import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
const stub = path.resolve('tests/radio-browser-stubs.tsx');
export default defineConfig({
  optimizeDeps: { entries: ['tests/radio-harness.html'] },
  plugins: [react()], server: { host: '127.0.0.1', port: 4174, strictPort: true },
  resolve: { alias: [
    { find: /^(?:\.\.\/|\.\/)(?:components\/)?(?:AuthProvider|CassettePlayer|PageHeader)$/, replacement: stub },
    { find: /^\.\.\/firebase$/, replacement: stub },
    { find: /^\.\.\/services\/gemini$/, replacement: stub }
  ] }
});
