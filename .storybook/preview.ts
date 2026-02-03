import type {Preview} from '@storybook/vue3-vite'
import {setup} from '@storybook/vue3-vite'
import '../src/assets/css/tailwind.css';
import {computed, ref} from "vue";
import {INITIAL_VIEWPORTS} from 'storybook/viewport';
import {extractArgTypes} from './config/docsParameter';
import {templateCustomSourceCodeGen} from "./utils/storyUtils";

let appCounter = 0;
let dateNow = Date.now();
// setup storybook's vue app
setup((app) => {
  // Since mode `Documentation` render multiple app instances within the same page,
  // there will be "issues" when dealing with components using `useId` composables
  // as the value of `useId` will be the same for each rendered story in documentation page
  // As such, when there's multiple vue app instance in the same page, we need to set a prefix
  // as per official recommendation [here](https://vuejs.org/api/composition-api-helpers#useid)

  // Here, we kept track of date and reset counter when necessary
  // tracking date is useful to reset counter to 0, to prevent high amount of counter,
  // as counter will only reset on page refresh (not CSR).
  // This is purely for better readability.
  // Not resetting the counter will likely be fine for most cases.
  const now = Date.now();
  if (now !== dateNow) {
    dateNow = now;
    appCounter = 0;
  }

  // Set the app `idPrefix` [docs](https://vuejs.org/api/application.html#app-config-idprefix)
  // to differentiate each story app instances
  app.config.idPrefix = `app-${appCounter}`;

  // Increment counter
  appCounter += 1;
});

const ThemeColors = [
  {value: "turquoise", title: "Turquoise"},
  {value: "vermillion", title: "Vermilion"},
];

const themeToolbar = {
  description: 'Color scheme',
  toolbar: {
    // The label to show for this toolbar  cv     @item
    title: 'Theme',
    icon: 'paintbrush',
    // Array of plain string values or MenuItem shape (see below)
    items: ThemeColors,
    // Change title based on selected value
    dynamicTitle: true,
  },
};

// Need to have the "reactive" global value to be initialized outside decorator
// for it to have any effect on global decorator update
// Refer to: https://github.com/storybookjs/storybook/issues/12840#issuecomment-1598808427
// and https://github.com/storybookjs/storybook/issues/12840#issuecomment-1990013774
const activeTheme = ref(ThemeColors[0].value);

const themeDecorator = (Story, context) => {
  // NOTE:
  // Everything within this section (not the one within `return`, though)
  // have the correct values regarding globals.
  // However, it seemed `return` is not reflecting this update even if there is watcher set up.

  // This line is IMPORTANT as it trigger update to the "global" reactive outside decorator scope
  // and thus somehow trigger update on returned value of decorator
  activeTheme.value = context.globals.theme;

  return {
    components: {Story},

    setup: () => {
      const cssPath = computed(() => `/themes/${activeTheme.value}.css`);

      // Return the needed var here.
      return ({cssPath, activeTheme});
    },

    template: `
      <div :data-theme="activeTheme">
        <link rel="stylesheet" :href="cssPath"/>
        <story/>
      </div>
    `
  }
};

const preview: Preview = {
  parameters: {
    viewport: {
      options: INITIAL_VIEWPORTS,
    },
    options: {
      storySort: {
        method: 'alphabetical',
        order: ['Intro', 'Styleguide'],
      },
    },
    actions: {argTypesRegex: '^on[A-Z].*'},
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
      expanded: true,
    },
    docs: {
      extractArgTypes,
      argType: {
        sort: 'alpha',
      },
      codePanel: true,
      source: {
        dark: true,
        type: 'dynamic',
        language: 'html',
        transform: templateCustomSourceCodeGen(),
      }
    },
  },
  globalTypes: {
    theme: themeToolbar,
  },
  initialGlobals: {
    theme: activeTheme.value,
    viewport: {value: 'desktop'},
  },
  decorators: [
    themeDecorator,
  ],
};

export default preview;
