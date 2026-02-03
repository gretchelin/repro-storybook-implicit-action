import { fileURLToPath } from 'node:url'
import { mergeConfig, defineConfig, configDefaults, coverageConfigDefaults, } from 'vitest/config'
import viteConfig from './vite.config'
import path from 'path';

export default defineConfig(configEnv => mergeConfig(
  viteConfig(configEnv),
  defineConfig({
    resolve: {
      alias: {
        '~': path.resolve(__dirname, './src'),
        '@': path.resolve(__dirname, './src'),
      },
    },
    test: {
      root: fileURLToPath(new URL('./', import.meta.url)),
      environment: 'happy-dom',

      exclude: [
        ...configDefaults.exclude,
        '**/*.stories.*',
        '**/*.config.*',
        '**/types.ts',
        'e2e/**',
        '**/.husky/**',
        '**/node_modules/**',
        '**/public/**',
      ],

      globals: true,

      setupFiles: [
        './test/setup.ts',
      ],

      coverage: {
        exclude: [
          '**/*.stories.*',
          '**/*.config.*',
          '**/types.ts',
          'e2e/**',
          '**/.husky/**',
          '**/public/**',
          ...coverageConfigDefaults.exclude,
        ],
        reporter: process.env.GITHUB_ACTIONS ? ['text-summary', 'lcov', 'github-actions'] : ['text-summary', 'html', 'lcov'],
        reportsDirectory: './test/coverage',
      },
    },
  }),
));
