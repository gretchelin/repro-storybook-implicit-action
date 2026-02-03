import type {StorybookConfig} from '@storybook/vue3-vite';
import {withoutVitePlugins} from '@storybook/builder-vite';
import {ENABLE_DOCGEN} from './config/constants.ts';

const config: StorybookConfig = {
  "stories": [
    '../stories/**/*.mdx',
    '../components/**/*.mdx',
    '../src/stories/**/*.stories.@(ts|js|jsx|mjs)',
    '../src/components/**/*.stories.@(ts|js|jsx|mjs)',
  ],
  "addons": ['@storybook/addon-docs'],
  "framework": {
    "name": "@storybook/vue3-vite",
    options: {
      docgen: ENABLE_DOCGEN ? {
        plugin: 'vue-component-meta',
        tsconfig: 'tsconfig.sb.json',
      } : false,
    },
  },
  docs: {
    //👇 See the table below for the list of supported options
    defaultName: 'Documentation',
  },
  async viteFinal(config) {
    return {
      ...config,
      plugins: await withoutVitePlugins(config.plugins, ['vite:dts', 'unplugin-dts']),
    }
  }
};
export default config;
