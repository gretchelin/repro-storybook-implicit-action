import { fileURLToPath, URL } from 'node:url'
import AutoImport from 'unplugin-auto-import/vite';
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import {resolve} from "path";
import dts from 'vite-plugin-dts';
import {copyFileSync} from "node:fs";
import dts from 'unplugin-dts/vite';

// https://vite.dev/config/
export default defineConfig(({command}) => ({
  plugins: [
    vue(),
    vueDevTools(),
    AutoImport({
      // targets to transform
      include: [
        /\.[tj]sx?$/, // .ts, .tsx, .js, .jsx
        /\.vue$/,
        /\.vue\?vue/, // .vue
        /\.vue\.[tj]sx?\?vue/, // .vue (vue-loader with experimentalInlineMatchResource enabled)
        /\.md$/, // .md
      ],

      // global imports to register
      imports: [
        // presets
        'vue',
        'vitest'
      ],

      // Filepath to generate corresponding .d.ts file.
      // Defaults to './auto-imports.d.ts' when `typescript` is installed locally.
      // Set `false` to disable.
      dts: './types/auto-imports.d.ts',

      // Generate corresponding .eslintrc-auto-import.json file.
      // eslint globals Docs - https://eslint.org/docs/user-guide/configuring/language-options#specifying-globals
      eslintrc: {
        enabled: true,
        // provide path ending with `.mjs` or `.cjs` to generate the file with the respective format
        filepath: './.eslintrc-auto-import.json', // Default `./.eslintrc-auto-import.json`
        globalsPropValue: true, // Default `true`, (true | false | 'readonly' | 'readable' | 'writable' | 'writeable')
      },
    }),
    // generate type file based on lib-only tsconfig file
    dts({
      tsconfigPath: resolve(__dirname, "tsconfig.lib.json"),
      processor: 'vue',
      afterBuild: () => {
        // Ref: https://github.com/qmhc/unplugin-dts/issues/267
        // To pass publint (`npm x publint@latest`) and ensure the
        // package is supported by all consumers, we must export types that are
        // read as ESM. To do this, there must be duplicate types with the
        // correct extension supplied in the package.json exports field.
        copyFileSync("dist/index.d.ts", "dist/index.d.mts")
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  publicDir: command === 'serve' ? 'public' : false,
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: '[name]',
      // the proper extensions will be added
      fileName: 'index',
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      // put things in peerDependencies here
      external: ['vue', '@vuepic/vue-datepicker'],
      output: {
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          vue: 'Vue',
        },
      },
    },
  },
}));
