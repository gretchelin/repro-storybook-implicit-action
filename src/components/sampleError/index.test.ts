import { it, describe, expect } from 'vitest';
import type { RenderResult } from '@testing-library/vue';
import { screen, render } from '@testing-library/vue';
import TestedComponent from './index.vue';

describe('[UI] sampleError', () => {
  let renderComp:(options:Record<string, any>) => RenderResult;

  beforeEach(() => {
    renderComp = (options) => {
      return render(TestedComponent, {
        ...(options || {}),
        global: {
          ...(options?.global || {}),
          stubs: {
            vTooltip: true,
            tooltip: true,
            Icon: {
              template: '<span />',
            },
            ...(options?.global?.stubs || {}),
          },
        },
        props: {
          'data-qa': 'comp-entry-id',
          ...(options?.props || {}),
        },
      });
    };
  });

  it('should render default', async () => {
    renderComp({
      props: {
        'data-qa': 'comp-entry-id',
      },
    });

    expect(screen.getByTestId('comp-entry-id')).toBeDefined();
  });
});



