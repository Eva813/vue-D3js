# GitHub Copilot Instructions

## Project Overview

This is a Vue 3 + TypeScript + Vite project with D3.js integration. The project uses modern Vue 3 Composition API with `<script setup>` syntax and follows TypeScript best practices.

## Tech Stack

- **Framework**: Vue 3.5+ with Composition API
- **Language**: TypeScript ~5.9.3
- **Build Tool**: Vite 7.2+
- **Linting**: Dual-linting system (Oxlint + ESLint)
- **Visualization**: D3.js (planned/integrated)

## Code Style & Standards

### Vue Components

1. **Always use `<script setup lang="ts">`** for new components
2. **Component naming**: Use PascalCase for component names
3. **Props**: Define with TypeScript interfaces
4. **Template**: Follow Vue 3 best practices with proper attribute formatting

Example:
```vue
<script setup lang="ts">
interface Props {
  msg: string
  count?: number
}

const props = defineProps<Props>()
</script>

<template>
  <div>
    <h1>{{ msg }}</h1>
  </div>
</template>
```

### TypeScript

1. **Use explicit types** for function parameters and return values
2. **Avoid `any` type** - use `unknown` or proper types
3. **Use interfaces** for object shapes
4. **Enable strict mode** - the project uses strict TypeScript settings

### Linting

This project uses a **dual-linting system**:

#### Development (Fast Feedback)
```bash
pnpm run lint:oxlint
```
- ⚡ Ultra-fast (16-24ms)
- Checks correctness, suspicious patterns, and performance issues
- Use this during active development

#### Pre-commit (Complete Check)
```bash
pnpm run lint
```
- Runs both Oxlint + ESLint
- Comprehensive rule checking including Vue templates
- Use before committing code

#### Auto-fix
```bash
pnpm run lint:fix:all
```
- Automatically fixes most linting issues
- Runs both Oxlint and ESLint fixes

### Key Rules to Follow

1. **No unused variables or imports** - ESLint will catch these
2. **Proper Vue template syntax** - ESLint handles `<template>` section
3. **TypeScript correctness** - Oxlint catches logical errors fast
4. **Performance patterns** - Oxlint includes performance checks

## Development Workflow

### Starting Development
```bash
pnpm run dev
```

### Building
```bash
pnpm run build
```
- Runs TypeScript type checking (`vue-tsc -b`)
- Builds production bundle

### Preview Production Build
```bash
pnpm run preview
```

## File Organization

```
src/
├── components/     # Vue components
├── assets/        # Static assets (images, styles)
├── App.vue        # Root component
├── main.ts        # Application entry point
└── style.css      # Global styles
```

## Best Practices for Copilot

### When Generating Code

1. **Check existing patterns** - Follow the code style used in `src/components/`
2. **Use TypeScript** - Always include proper type annotations
3. **Lint-friendly** - Generate code that passes both Oxlint and ESLint
4. **Vue 3 Composition API** - Use `<script setup>` syntax, not Options API
5. **Imports** - Use ES6 imports, organize them logically

### When Suggesting Changes

1. **Run linting** after changes: `pnpm run lint`
2. **Type check** with build: `pnpm run build`
3. **Test in dev mode**: `pnpm run dev`

### D3.js Integration

When working with D3.js:
1. Import D3 modules specifically: `import { select, scaleLinear } from 'd3'`
2. Use TypeScript types for D3 selections and data
3. Integrate D3 with Vue lifecycle hooks (`onMounted`, `onUnmounted`)
4. Use `ref()` for DOM element references

Example:
```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { select } from 'd3'

const chartRef = ref<HTMLDivElement>()

onMounted(() => {
  if (chartRef.value) {
    select(chartRef.value)
      .append('svg')
      // ... D3 code
  }
})
</script>

<template>
  <div ref="chartRef"></div>
</template>
```

## Common Commands Quick Reference

| Command | Purpose |
|---------|---------|
| `pnpm run dev` | Start development server |
| `pnpm run build` | Build for production |
| `pnpm run preview` | Preview production build |
| `pnpm run lint` | Full lint check (Oxlint + ESLint) |
| `pnpm run lint:oxlint` | Fast lint check |
| `pnpm run lint:fix:all` | Auto-fix linting issues |

## Additional Resources

- [LINT_GUIDE.md](../LINT_GUIDE.md) - Detailed linting system documentation
- [Vue 3 Docs](https://vuejs.org/)
- [TypeScript Docs](https://www.typescriptlang.org/)
- [Vite Docs](https://vite.dev/)
- [D3.js Docs](https://d3js.org/)

## Notes

- The project uses `pnpm` as the package manager
- Always test changes with `pnpm run dev` before committing
- Keep dependencies up to date but test thoroughly
- Follow the existing code patterns in the repository
