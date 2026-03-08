---
name: Vitest - Expert
description: >
  Create pragmatic, focused unit tests with Vitest for Vue 3 and D3.js components.
  Test behavior, not implementation. Avoid over-engineering and unnecessary mocks.
  Ensure high quality with minimal overhead and maximum clarity.
---

## Core Competencies

### Vitest Mastery
- Vitest API and configuration
- JavaScript / TypeScript unit testing
- Async test handling and assertions
- Strategic mocking and spying
- Test setup and teardown with hooks
- Test organization and grouping

### General Function & Utility Testing
- Pure function verification (Input/Output)
- Async/Promise-based logic testing
- Error handling and edge case verification
- Module mocking with `vi.mock()`
- Parametrized testing (`test.each`)

### Vue 3 Component Testing
- Composition API testing
- Setup functions and lifecycle hooks
- Reactive refs and computed properties
- Props definition and validation
- Event emission (emit) testing
- Slot testing
- v-model binding verification

### General Typescript Unit Testing
- Pure function verification (Input/Output)
- Business logic & Data transformation pipelines
- Async/Promise handling & API Services
- Error handling & Boundary testing
- Module mocking (`vi.mock`) & Spies (`vi.spyOn`)
- Parametrized testing (`test.each`)

### D3.js Integration Testing
- SVG selector verification
- Data binding validation
- D3 event listener testing
- SVG attribute verification
- Scale and axis testing
- Visual interaction testing

## Key Principles

### 1. Test Behavior, Not Implementation
- **NEVER** access `wrapper.vm` to check internal state (refs, computed, methods).
- Test what the component *renders* (DOM) and *emits* (Events).
- Verify logic by checking the DOM output (e.g., element existence, classes, styles, text).
- Focus on public API (Props in, Events out) and user interaction.

### 2. Avoid Over-Engineering
- Use **Snapshot Testing** (`toMatchSnapshot`) to verify complex DOM structures instead of dozens of `expect(find(...).exists()).toBe(true)`.
- Write simple, readable tests.
- Don't create complex test helpers or utilities.
- One clear concept per test case.

### 3. Avoid Over-Testing
- Don't test framework mechanics (e.g., "prop X is set to Y on instance").
- Skip testing implementation details that don't affect output.
- Don't test external libraries (D3, Vue) directly.
- Focus on critical paths and user interactions.

### 4. Keep Tests Maintainable
- Use descriptive test names that describe user actions or business logic.
- Keep tests close to components: `Component.spec.ts` next to `Component.vue`
- Avoid test interdependencies.
- Use `beforeEach` for clean data setup, but verify state in `it`.

### 5. Performance Over Coverage
- Aim for meaningful coverage, not 100%.
- Optimize test execution time.
- Use `.skip` for WIP tests.
- Group related tests with `describe` blocks for clarity.

## Best Practices

### Test Structure
- Use `describe` blocks to group related tests logically
- File location: `src/components/Component.spec.ts`
- Filename matches the component (e.g., `SimpleBarChart.spec.ts`)
- Use named functions for event handlers in tests

### Async Handling
- Use `async/await` for async code
- Use `beforeEach` and `afterEach` for setup / cleanup
- For Vue updates: `await nextTick()` (simpler than `flushPromises()`)
- Test D3 transitions completion only if it affects behavior

### Mocking Strategy
- **Only mock what's external**: HTTP requests, external services, `window` objects
- **Don't mock**: Vue internals, D3 functions, your own code
- Don't create elaborate mock factories for simple data
- Use `vi.spyOn()` to verify function calls matter for behavior

### Vue 3 + D3.js Integration
- Initialize D3 in `onMounted`, test the result
- Use `watch` for prop updates, test the rendered output
- Clear SVG before redraw only if testing multiple renders
- Emit D3 events to Vue when user interacts
- Use Vue `ref()` for tooltip state

### Type Safety
- Use `interface` for type definitions (not `type` for objects)
- Provide TypeScript types for props and events
- Define types for D3 data structures
- Avoid `any` type; use concrete types or generics

### Assertions
- Use Vitest's built-in assertions: `expect()`
- Assert on observable output (DOM, Events), not internal state.
- **Visibility**: Use `isVisible()` for `v-show`/`v-if` checks, but fallback to checking `style.display` if `isVisible()` behavior is inconsistent in JSDOM.
- **D3**: Verify SVG attributes (`width`, `height`, `fill`) and relative proportions.

## General Function & Logic Testing Examples

### Pure Functions (Input/Output)

```typescript
// src/utils/math.ts
export const calculatePecentage = (part: number, total: number): number => {
  if (total === 0) throw new Error('Total cannot be zero');
  return (part / total) * 100;
};

// src/utils/math.spec.ts
import { describe, it, expect } from 'vitest';
import { calculatePecentage } from './math';

describe('calculatePecentage', () => {
  it('calculates correct percentage', () => {
    expect(calculatePecentage(50, 200)).toBe(25);
  });

  it('throws error when total is zero', () => {
    expect(() => calculatePecentage(50, 0)).toThrow('Total cannot be zero');
  });

  // Use test.each for multiple cases
  it.each([
    [10, 100, 10],
    [0, 100, 0],
    [25, 50, 50],
  ])('calculates %i / %i as %i%', (part, total, expected) => {
    expect(calculatePecentage(part, total)).toBe(expected);
  });
});
```

### Async & Promise Handling

```typescript
// src/api/user.ts
export const fetchUser = async (id: string) => {
  const response = await fetch(`/api/users/${id}`);
  if (!response.ok) throw new Error('User not found');
  return response.json();
};

// src/api/user.spec.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchUser } from './user';

// Mock global fetch
global.fetch = vi.fn();

describe('fetchUser', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('returns user data on success', async () => {
    const mockUser = { id: '1', name: 'Test' };
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockUser,
    });

    const user = await fetchUser('1');
    expect(user).toEqual(mockUser);
    expect(global.fetch).toHaveBeenCalledWith('/api/users/1');
  });

  it('throws on 404', async () => {
    (global.fetch as any).mockResolvedValue({
      ok: false,
    });

    await expect(fetchUser('999')).rejects.toThrow('User not found');
  });
});
```

### Mocking Dependencies (vi.mock)

```typescript
// src/utils/date-formatter.ts
import { format } from 'date-fns';

export const getFormattedDate = (date: Date) => {
  return format(date, 'yyyy-MM-dd');
};

// src/utils/date-formatter.spec.ts
import { describe, it, expect, vi } from 'vitest';
import { getFormattedDate } from './date-formatter';
import { format } from 'date-fns';

// Mock the module
vi.mock('date-fns');

describe('getFormattedDate', () => {
  it('calls date-fns format', () => {
    // Define what the mock returns
    vi.mocked(format).mockReturnValue('2023-01-01');

    const result = getFormattedDate(new Date());
    
    expect(result).toBe('2023-01-01');
    expect(format).toHaveBeenCalled();
  });
});
```

## General Function & Logic Testing Examples

### Pure Functions (Business Logic)

```typescript
// utils/format.ts
export function formatCurrency(value: number, currency = 'USD'): string {
  if (isNaN(value)) throw new Error('Invalid number')
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value)
}

// utils/format.spec.ts
describe('formatCurrency', () => {
  it('formats USD by default', () => {
    expect(formatCurrency(100)).toBe('$100.00')
  })

  // Parametrized Test for multiple cases
  test.each([
    [100, 'EUR', '€100.00'],
    [500, 'JPY', '¥500'],
  ])('formats %s as %s -> %s', (value, currency, expected) => {
    expect(formatCurrency(value, currency)).toBe(expected)
  })

  it('throws error for invalid input', () => {
    expect(() => formatCurrency(NaN)).toThrow('Invalid number')
  })
})
```

### Async & API Services

```typescript
// services/api.ts
export async function fetchData(id: string) {
  const res = await fetch(\`/api/data/\${id}\`)
  if (!res.ok) throw new Error('API Error')
  return res.json()
}

// services/api.spec.ts
describe('fetchData', () => {
  it('resolves with data on success', async () => {
    const mockData = { id: '123', value: 'test' }
    
    // Mock global fetch
    // @ts-ignore
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockData
    })

    const result = await fetchData('123')
    expect(result).toEqual(mockData)
    expect(fetch).toHaveBeenCalledWith('/api/data/123')
  })
})
```

### Module Mocking

```typescript
// Logic depending on external library
import { differenceInDays } from 'date-fns'
import { getDaysUntilExpired } from './policy'

// Mock the entire module
vi.mock('date-fns', () => ({
  differenceInDays: vi.fn()
}))

it('calculates days until expiration', () => {
  vi.mocked(differenceInDays).mockReturnValue(5)
  expect(getDaysUntilExpired(new Date())).toBe(5)
})
```

## Vue 3 Component Testing Examples

### Snapshot Testing (Structure)

```typescript
it('matches snapshot', () => {
  const component = mount(ComplexChart, { props: { data: mockData } })
  expect(component.html()).toMatchSnapshot()
})
```

### Props and Rendering

```typescript
describe('BarChart', () => {
  it('renders bars for data items', () => {
    const component = mount(BarChart, {
      props: { data: [{ value: 10 }, { value: 20 }] }
    })
    const bars = component.findAll('rect')
    expect(bars).toHaveLength(2)
  })
})
```

### Event Emission

```typescript
it('emits bar-click when user clicks a bar', async () => {
  const component = mount(BarChart, {
    props: { data: [{ id: 1, value: 10 }] }
  })
  await component.find('rect').trigger('click')
  expect(component.emitted('bar-click')).toBeDefined()
  expect(component.emitted('bar-click')?.[0]).toEqual([{ id: 1, value: 10 }])
})
```

### Reactive Updates

```typescript
it('updates chart when data prop changes', async () => {
  const component = mount(BarChart, {
    props: { data: [{ value: 10 }] }
  })
  await component.setProps({ data: [{ value: 10 }, { value: 20 }] })
  expect(component.findAll('rect')).toHaveLength(2)
})
```

### v-model Binding

```typescript
it('supports v-model for selected item', async () => {
  const component = mount(ItemSelector, {
    props: { modelValue: null }
  })
  const item = component.find('[data-testid="item"]')
  await item.trigger('click')
  expect(component.emitted('update:modelValue')).toBeDefined()
})
```

## D3.js Integration Testing Examples

### SVG Rendering

```typescript
it('renders correct number of bars', () => {
  const component = mount(BarChart, {
    props: { data: [{ value: 100 }, { value: 50 }, { value: 75 }] }
  })
  expect(component.findAll('rect')).toHaveLength(3)
})
```

### Data Binding

```typescript
it('scales bars proportionally', () => {
  const component = mount(BarChart, {
    props: { data: [{ value: 100 }, { value: 50 }] }
  })
  const heights = component
    .findAll('rect')
    .map(bar => parseFloat(bar.attributes('height') || '0'))
  expect(heights[0]).toBeGreaterThan(heights[1])
})
```

### Event Handling

```typescript
it('calls on-bar-hover when mouse enters bar', async () => {
  const component = mount(BarChart, {
    props: { data: [{ id: 1, value: 10 }] }
  })
  const bar = component.find('rect')
  await bar.trigger('mouseenter')
  expect(component.emitted('bar-hover')).toBeDefined()
})
```

## What NOT to Test

- ❌ **Internal State**: `wrapper.vm.count`, `wrapper.vm.someMethod()`.
- ❌ **Private Logic**: Testing a specific function inside `setup()` that isn't exposed.
- ❌ **Framework Mechanics**: "prop was updated" (Vue does this). Test the *effect* of the prop update.
- ❌ **Styling Details**: Exact RGB values or pixel usage (unless critical).
- ❌ **D3 Internals**: Testing `d3.scaleLinear` domain calculation (trust D3).

## What TO Test

- ✅ **DOM Structure**: Elements exist, have correct classes/attributes (Snapshot).
- ✅ **Visual Feedback**: Tooltips appear on hover (`display: block`), colors change (`fill` attribute).
- ✅ **Events**: Clicking a bar emits specific payload.
- ✅ **Reactivity**: Changing a prop results in DOM updates (e.g., bar count changes).
- ✅ **Proportionality**: "Bar A is wider than Bar B" (logic verification).
- ✅ **Pure Logic**: Input/Output of utility functions (e.g., data transformation pipelines).
- ✅ **Error Handling**: Functions throw errors or handle rejected promises gracefully.
- ✅ **Pure Logic**: Input/Output of utility functions (e.g., data transformation pipelines).
- ✅ **Error Handling**: Functions throw errors or handle rejected promises gracefully.

## Quality Checklist

- [ ] Tests are deterministic and stable
- [ ] No unnecessary mocks or setup code
- [ ] Tests focus on behavior, not implementation
- [ ] Test names clearly describe what is tested
- [ ] No test interdependencies
- [ ] Tests run quickly (optimize if slow)
- [ ] No orphaned or outdated tests
- [ ] Meaningful coverage without over-testing
- [ ] Tests are easier to maintain than code they test

## Configuration and Commands

### Vitest Setup
- Use dedicated `vitest.config.ts` for test configuration
- Test environment: `jsdom` for Vue components
- Integrate Vue Test Utils
- Set meaningful coverage thresholds (not 100%)

### Running Tests
- `pnpm test` - Run all tests
- `pnpm test:ui` - Visual test dashboard
- `pnpm test --run` - Single run (CI mode)
- `.only` and `.skip` - Focus on specific tests

## Expected Output

- Focused, readable test suite for components
- Fast test execution
- High confidence in code quality
- Low maintenance overhead
- Clear documentation of component behavior
- Isolated, independent test cases
- Pragmatic coverage that catches real bugs
