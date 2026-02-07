---
name: vue3-best-practices
description: Vue 3 performance optimization and best practices guidelines for modern frontend applications. This skill should be used when writing, reviewing, or refactoring Vue 3 code to ensure optimal performance patterns, proper Composition API usage, and modern development practices. Triggers on tasks involving Vue 3 components, Composition API, reactivity, state management, or performance optimization.
license: MIT
metadata:
  author: Eva
  version: "1.0.0"
---

# Vue 3 Best Practices

Comprehensive performance optimization and development guide for Vue 3 applications. Contains 13 carefully curated rules across 6 categories, prioritized by impact to guide automated refactoring and code generation.

## When to Apply

Reference these guidelines when:
- Writing new Vue 3 components or composables
- Implementing reactive data and computed properties
- Reviewing code for performance issues
- Refactoring from Vue 2 to Vue 3
- Optimizing bundle size or load times
- Working with state management (Pinia/Vuex)
- Implementing async operations in components

## Rule Categories by Priority

| Priority | Category | Impact | Rules | Prefix |
|----------|----------|--------|--------|--------|
| 1 | Core Reactivity | CRITICAL | 2 rules | `reactivity-` |
| 2 | Component Architecture | CRITICAL | 3 rules | `component-`, `composition-` |
| 3 | Type Safety & State | CRITICAL | 2 rules | `typescript-`, `state-` |
| 4 | Bundle Optimization | HIGH | 2 rules | `bundle-` |
| 5 | Template & Testing | HIGH | 2 rules | `template-`, `testing-` |
| 6 | Build & Development | HIGH | 2 rules | `vite-`, `template-` |

## Quick Reference

### 1. Core Reactivity (CRITICAL - 2 rules)

- `reactivity-ref-vs-reactive` - Use ref for primitives, reactive for objects
- `reactivity-computed-caching` - Leverage computed property caching for performance

### 2. Component Architecture (CRITICAL - 3 rules)

- `composition-script-setup` - Prefer `<script setup>` for better performance and DX
- `component-async-components` - Use defineAsyncComponent for heavy components
- `component-props-events` - Implement type-safe component communication

### 3. Type Safety & State (CRITICAL - 2 rules)

- `typescript-integration` - Implement comprehensive TypeScript best practices  
- `state-management` - Optimize Pinia stores for performance and maintainability

### 4. Bundle Optimization (HIGH - 2 rules)

- `bundle-tree-shaking` - Structure imports for optimal tree-shaking
- `bundle-lazy-loading` - Implement proper lazy loading and code splitting

### 5. Template & Testing (HIGH - 2 rules)

- `template-performance` - Optimize template structures and directives
- `testing-best-practices` - Comprehensive testing strategies for Vue 3

### 6. Build & Development (HIGH - 2 rules)

- `composition-api-patterns` - Advanced patterns for reusable composables
- `vite-optimization` - Optimize Vite configuration for development and production

## Framework Integration

### Vite Integration
- Utilize Vite's fast HMR and build optimizations
- Configure proper chunk splitting strategies
- Use Vite plugins for Vue-specific optimizations

### TypeScript Integration
- Leverage Vue 3's improved TypeScript support
- Use proper type definitions for better DX
- Configure TypeScript for optimal build performance

### Testing Integration
- Use Vue Test Utils with Composition API
- Implement efficient component testing strategies
- Optimize test performance and reliability

## How to Use

Read individual rule files for detailed explanations and code examples:

```
# Core Reactivity
rules/reactivity-ref-vs-reactive.md
rules/reactivity-computed-caching.md

# Component Architecture  
rules/composition-script-setup.md
rules/component-async-components.md
rules/component-props-events.md

# Type Safety & State
rules/typescript-integration.md
rules/state-management.md

# Bundle Optimization
rules/bundle-tree-shaking.md
rules/bundle-lazy-loading.md

# Template & Testing
rules/template-performance.md
rules/testing-best-practices.md

# Build & Development
rules/composition-api-patterns.md
rules/vite-optimization.md
```

Each rule file contains:
- Brief explanation of why it matters  
- Incorrect Vue 3 code example with explanation
- Correct Vue 3 code example with explanation
- Performance impact and measurements
- Additional context and Vue 3-specific considerations
- TypeScript integration examples where applicable

## Framework Integration

### Vue 3 + TypeScript + Vite
- Leverages Vue 3's excellent TypeScript support
- Optimized Vite configuration for fast development
- Modern build tooling with optimal tree-shaking

### State Management with Pinia  
- Type-safe store definitions
- Composition-based store patterns
- Optimal performance with minimal boilerplate

### Testing with Vitest
- Fast unit and integration testing
- Vue Test Utils 2 for component testing
- E2E testing patterns with Playwright

### Project-Specific Optimizations
- OxLint integration for fast linting
- D3.js optimization patterns (see vue3-d3-integration skill)
- Bundle analysis and size monitoring

## Performance Impact Summary

These 13 carefully selected rules provide:
- **Critical Performance Gains**: 6 CRITICAL rules covering reactivity, components, and type safety
- **High Impact Optimizations**: 7 HIGH rules for bundle size, testing, and development workflow  
- **Real-World Applicability**: All rules tested against modern Vue 3 + TypeScript + D3.js projects
- **Measurable Benefits**: Each rule includes specific performance metrics and impact data