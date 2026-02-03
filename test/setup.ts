import { configure } from '@testing-library/vue';
import * as matchers from 'jest-extended';
import { expect } from 'vitest';
import "@testing-library/jest-dom/vitest";

// Setup testing library
configure({
  testIdAttribute: 'data-qa',
});

// Extend matchers
expect.extend(matchers);

expect.extend({
  toBeWithinRange(actual, min, max) {
    if (typeof actual !== 'number') {
      throw new Error('Actual value must be a number');
    }
    const pass = actual >= min && actual <= max;
    return {
      // do not alter your "pass" based on isNot. Vitest does it for you
      pass,
      message: pass
        ? () => `expected ${actual} not to be within range (${min}..${max})`
        : () => `expected ${actual} to be within range (${min}..${max})`,
    };
  },
});
