import type { Meta, StoryObj, StoryFn } from '@storybook/vue3-vite';

import StoryComp from '../sampleError/index.vue';

const meta = {
  title: "Ungrouped/SampleFixed",
  component: StoryComp,
  tags: ['autodocs'],
  parameters: {
      docs: {
        description: {
          component: 'This story uses the same component as SampleError, but no issue here because `onBlabla` is defined in `args` prop!',
        },
      },
  },
  args: {
    onBlabla: () => {}
  }
} satisfies Meta<typeof StoryComp>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

const Template: StoryFn<typeof StoryComp> = args => ({
  components: { SampleA: StoryComp },
  setup() {
    return { args };
  },
  template: `<SampleA v-bind="args"></SampleA>`,
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

