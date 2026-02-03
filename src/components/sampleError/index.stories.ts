import type { Meta, StoryObj, StoryFn } from '@storybook/vue3-vite';

import StoryComp from './index.vue';

const meta = {
  title: "Ungrouped/SampleError",
  component: StoryComp,
  tags: ['autodocs'],
  parameters: {
      docs: {
        description: {
          component: 'This component have `blabla` emitted as events during `onMounted` staged. \n\nFor better docs, this event is added to `argTypes` as `onBlabla`.\n\nHowever, this resulted on storybook throwing errors. To fix this, `onBlabla` must be explicitly defined with valid default values in `arg` prop of the story (see sampleFixed for the fixed story)',
        },
      },
  },
} satisfies Meta<typeof StoryComp>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

const Template: StoryFn<typeof StoryComp> = args => ({
  components: { sampleError: StoryComp },
  setup() {
    return { args };
  },
  template: `<sampleError v-bind="args"></sampleError>`,
});
export const WithTemplate = Template.bind({});
WithTemplate.args = {
};
WithTemplate.parameters = {
  docs: {
    description: {
      story: 'This is a sample usage of template for stories',
    },
  },
};

