# Vue 3 D3 Visualization Constitution

## Core Principles

### I. Test-First Development (NON-NEGOTIABLE)
Test-driven development is mandatory for all features. Tests MUST be written and FAIL before implementation begins. The Red-Green-Refactor cycle is strictly enforced: unit tests cover individual components and utilities; integration tests verify component interactions and data flow; visual regression tests validate D3 rendering correctness. All PRs require test coverage reporting with minimum 80% coverage threshold.

### II. Code Quality & TypeScript Strictness
All code MUST be written in TypeScript with strict mode enabled. Type safety is non-negotiable; any type as not permitted. ESLint configuration enforces consistent formatting and code standards. Imports must be explicitly typed. Component props and return types must be fully annotated. Breaking changes or unsafe patterns require architectural review and documentation before approval.

### III. User Experience Consistency
All components MUST follow a unified design system and interaction model. Visual elements must be consistently styled using CSS variables defined in a central theme. All interactive components MUST be accessible (WCAG AA minimum); keyboard navigation is required for all complex visualizations. Hover states, loading indicators, and error messages MUST follow standard patterns. User feedback (success/error notifications) MUST be consistent across features.

### IV. Performance Requirements
Vue components MUST render within 16ms for 60fps smoothness. D3 transitions MUST complete within 1000ms to keep users engaged. Bundle size MUST NOT increase by more than 50KB per feature (gzipped). Large datasets (>10k items) MUST use virtualization or pagination. Initial page load (Time to Interactive) MUST be under 2 seconds on 4G networks. Performance metrics MUST be tracked in CI/CD pipeline and prevent regressions.

## Quality Standards & Dependencies

**TypeScript**: Strict mode required; tsconfig.json enforces noImplicitAny, strict property initialization
**Testing Framework**: Vitest for unit tests; component tests use Vue Test Utils
**Linting**: ESLint + Prettier for code formatting; rules enforced in pre-commit hooks
**Performance Monitoring**: Lighthouse CI for page load metrics; component render profiling required
**Vue Version**: Vue 3 with Composition API; no Options API; use `<script setup>` exclusively
**D3 Integration**: D3 v7+; use Composition API wrappers for D3 lifecycle management to avoid conflicts with Vue reactivity

## Development Workflow & Quality Gates

All feature development follows structured phases:
1. **Phase 0 (Design)**: User stories and acceptance criteria defined; architectural review for complex visualizations
2. **Phase 1 (Tests)**: Contract tests and integration tests written and failing; user approves test scenarios
3. **Phase 2 (Implementation)**: Code written to pass tests; TypeScript strictness verified; ESLint passes
4. **Phase 3 (Validation)**: Code review verifies test coverage (≥80%), performance benchmarks pass, accessibility audit complete
5. **Phase 4 (Integration)**: Integrated tests pass; visual regression tests pass; bundle size impact acceptable

Code review MUST verify: (1) All tests pass and cover edge cases; (2) TypeScript types are strict; (3) Components follow accessibility standards; (4) Performance metrics stay within budgets; (5) CSS changes don't break visual consistency; (6) Documentation updated for API changes.

## Governance

This constitution supersedes all other development practices. Amendments require documentation of rationale, impact analysis on existing templates, and approval from project maintainers. All PRs MUST reference which principles they satisfy. Complexity deviations require justification via Complexity Tracking section in implementation plans.

Version updates follow semantic versioning: MAJOR for principle removals/redefinitions; MINOR for new principles or significant expansions; PATCH for clarifications and non-semantic refinements.

### Documentation Language:

All specifications, plans, and user-facing documentation MUST be written in Traditional Chinese (zh-TW)

Code comments and technical documentation MAY use English for technical clarity

Commit messages and internal development notes MAY use English

**Version**: 1.0.0 | **Ratified**: 2025-12-26 | **Last Amended**: 2025-12-26
