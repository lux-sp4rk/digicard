/* eslint-env node */
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// Detect if running in CI or subagent environment
const isSubagentEnvironment = () => {
  return (
    process.env.CI === 'true' ||
    process.env.OPENCODE_SUBAGENT === 'true' ||
    process.env.GITHUB_ACTIONS === 'true'
  );
};

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './test/setup.js',
    include: ['test/**/*.{test,spec}.{js,jsx,ts,tsx}'],
    exclude: ['**/node_modules/**', '**/.worktrees/**', '**/dist/**'],

    // Process isolation configuration for subagent environments
    pool: 'forks',
    poolOptions: {
      forks: {
        // Use single fork in CI/subagent to prevent orphaned processes
        singleFork: isSubagentEnvironment(),
        maxForks: isSubagentEnvironment() ? 1 : 2,
        minForks: 1,
      },
    },
    maxWorkers: isSubagentEnvironment() ? 1 : 2,
    minWorkers: 1,
    isolate: !isSubagentEnvironment(), // Disable isolation in subagent for faster cleanup

    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'json-summary', 'html'],
      exclude: [
        'node_modules/',
        'test/',
        'dist/',
        '.worktrees/',
        'scripts/',
        '.netlify/functions-serve/',
        '**/*.config.js',
        '**/*.config.ts',
        'src/main.jsx',
        'src/assets/',
        'public/',
        '**/*.d.ts',
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
  },
});
