---
name: vue3-d3-integration
description: Vue 3 and D3.js integration best practices for data visualization components. This skill should be used when building, optimizing, or reviewing Vue 3 components that use D3.js for data visualization, charts, or interactive graphics. Triggers on tasks involving D3.js integration, SVG manipulation, data binding, performance optimization, or accessibility in Vue 3 visualization components.
license: MIT
metadata:
  author: Eva
  version: "1.0.0"
---

# Vue 3 + D3.js Integration Best Practices

Comprehensive guide for seamlessly integrating D3.js with Vue 3 for high-performance, maintainable data visualization components.

## When to Apply

Use this skill when:
- Building Vue 3 components with D3.js visualizations
- Integrating reactive data binding with D3.js charts
- Optimizing performance for large datasets in D3 visualizations
- Implementing accessible data visualization components
- Managing DOM manipulation conflicts between Vue and D3
- Creating reusable chart components with TypeScript
- Handling lifecycle management for D3 resources

## Core Principles

### 1. **Separation of Concerns**
- Vue manages component state and reactive data
- D3 handles DOM manipulation and visualization rendering
- Clear boundaries prevent conflicts and improve maintainability

### 2. **Reactive Data Flow** 
- Vue's reactive system drives D3 updates
- Efficient data transformation and binding patterns
- Optimal re-rendering strategies for performance

### 3. **Lifecycle Integration**
- Proper initialization and cleanup of D3 resources
- Coordinated updates between Vue's reactivity and D3's DOM manipulation
- Memory leak prevention and resource management

### 4. **Performance First**
- Optimized for large datasets and real-time updates
- Efficient update patterns and transition management
- Canvas vs SVG selection strategies

## Rule Categories by Priority

| Priority | Category | Impact | Rules | Focus Area |
|----------|----------|--------|--------|------------|
| 1 | Lifecycle Management | CRITICAL | 1 rule | Component initialization/cleanup |
| 2 | Data Binding | CRITICAL | 1 rule | Reactive data integration |
| 3 | Component Architecture | CRITICAL | 1 rule | Reusable component patterns |
| 4 | Performance | HIGH | 1 rule | Large dataset optimization |
| 5 | Type Safety | HIGH | 1 rule | TypeScript integration |
| 6 | Accessibility | MEDIUM-HIGH | 1 rule | Inclusive design patterns |

## Quick Reference

### 1. Lifecycle Management (CRITICAL)
- `d3-vue-lifecycle` - Coordinate Vue lifecycle with D3 initialization/cleanup

### 2. Data Binding (CRITICAL)  
- `d3-reactive-data` - Implement reactive data binding between Vue and D3

### 3. Component Architecture (CRITICAL)
- `d3-component-composition` - Structure reusable D3 chart components

### 4. Performance Optimization (HIGH)
- `d3-performance-optimization` - Optimize for large datasets and real-time updates

### 5. Type Safety (HIGH)
- `d3-typescript-integration` - Comprehensive TypeScript patterns for D3 + Vue 3

### 6. Accessibility (MEDIUM-HIGH)
- `d3-accessibility` - Implement accessible data visualization patterns

## Integration Patterns

### Vue 3 Composition API + D3.js
- Leverage `ref` and `reactive` for D3 data management
- Use `watchEffect` and `watch` for coordinated updates
- Implement custom composables for D3 logic encapsulation

### TypeScript Support
- Full type safety for D3 selections and data binding
- Interface definitions for chart data and configuration
- Generic components for flexible chart types

### Performance Strategies
- Canvas rendering for high-density data
- SVG optimization techniques
- Efficient update patterns and transitions
- Memory management and resource cleanup

## Common Integration Challenges

### 1. **DOM Ownership Conflicts**
- **Problem**: Vue and D3 both manipulate DOM elements
- **Solution**: Clear ownership boundaries with ref elements

### 2. **Reactivity Performance**
- **Problem**: Excessive re-renders with large datasets
- **Solution**: Optimized watchers and update strategies

### 3. **Memory Leaks**
- **Problem**: D3 event listeners and resources not cleaned up
- **Solution**: Proper lifecycle management and cleanup

### 4. **TypeScript Complexity**
- **Problem**: Complex D3 typing with Vue 3 patterns
- **Solution**: Simplified type definitions and utilities

## Architecture Recommendations

### For Simple Charts (< 1000 data points)
```typescript
// Single-file Vue component with embedded D3 logic
const SimpleChart = defineComponent({
  // Embedded D3 rendering logic
})
```

### For Complex Visualizations (> 1000 data points)
```typescript
// Separate composables and optimized rendering
const useD3Chart = () => { /* D3 logic */ }
const ComplexVisualization = defineComponent({
  setup() {
    return useD3Chart()
  }
})
```

### For Chart Libraries
```typescript
// Reusable chart components with plugin architecture
export const ChartComponents = {
  BarChart, LineChart, ScatterPlot, NetworkGraph
}
```

## Performance Benchmarks

Target performance metrics for Vue 3 + D3.js integration:
- **Initial Render**: < 100ms for 1K data points
- **Update Performance**: < 50ms for data changes
- **Memory Usage**: < 10MB for complex visualizations
- **Bundle Size**: < 200KB additional overhead

## Framework Integration

### Vite Optimization
- Proper D3 tree-shaking configuration
- Canvas and SVG loader optimization
- Development server HMR for D3 components

### Testing Strategies
- Component testing with Vue Test Utils
- Visual regression testing for charts
- Performance testing for large datasets

## Migration Patterns

### From Vue 2 + D3
- Composition API migration strategies  
- Reactivity system updates
- TypeScript adoption patterns

### From Vanilla D3
- Vue component wrapping techniques
- State management integration
- Lifecycle adaptation

## Getting Started

1. **Read the Rules**: Start with `d3-vue-lifecycle` for foundation patterns
2. **Check Examples**: Review rule examples for your use case
3. **Apply Incrementally**: Implement one rule at a time
4. **Measure Performance**: Use provided benchmarks for validation
5. **Test Thoroughly**: Follow accessibility and testing guidelines

Each rule provides:
- **Problem/Solution**: Clear issue identification and resolution
- **Code Examples**: Complete Vue 3 + D3.js implementations  
- **Performance Impact**: Measurable optimization benefits
- **TypeScript Support**: Full type safety patterns
- **Testing Strategies**: Component and integration test examples
- **Accessibility**: WCAG 2.1 compliance patterns

## Resources

### D3.js Version Compatibility
- Optimized for D3.js v7+ with Vue 3.3+
- ES modules and tree-shaking support
- Modern JavaScript features utilization

### Browser Support
- Modern browsers with ES2020+ support
- Canvas API and SVG 2.0 features
- WebGL support for high-performance rendering

### Performance Tools
- Vue DevTools integration
- D3 performance profiling techniques
- Bundle analysis for D3 imports