import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// GitHub Pages (project site): https://fsysy.github.io/lab_test/
export default defineConfig({
  base: '/lab_test/',
  plugins: [react()],
  test: { include: ['tests/**/*.test.ts'] },
});
