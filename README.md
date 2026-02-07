# Vue 3 + TypeScript + Vite

This template should help get you started developing with Vue 3 and TypeScript in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

Learn more about the recommended Project Setup and IDE Support in the [Vue Docs TypeScript Guide](https://vuejs.org/guide/typescript/overview.html#project-setup).

---

## 🚀 Quick Start

### Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### Linting

```bash
# Run all linters (Oxlint + ESLint)
npm run lint

# Run Oxlint only (fast)
npm run lint:oxlint

# Run ESLint only
npm run lint:eslint

# Auto-fix issues
npm run lint:fix:all
```

See [LINT_GUIDE.md](./LINT_GUIDE.md) for detailed linting configuration and best practices.

---

## 📦 Build & Deployment

### GitHub Pages

This project is configured for automatic deployment to GitHub Pages:

1. **Automatic Deployment**: On every push to `main` branch
2. **Manual Deployment**: Via GitHub Actions workflow dispatch
3. **Build on PR**: Validates builds on pull requests

### Configuration Files

- `.github/workflows/build-and-deploy.yml` - CI/CD pipeline
- `vite.config.ts` - Build configuration with GitHub Pages base path

### Local Build

```bash
# Production build
NODE_ENV=production npm run build

# The output will be in the `dist/` directory
```

---

## 🛠️ Technology Stack

- **Framework**: Vue 3.5.24
- **Build Tool**: Vite 7.2.4
- **Language**: TypeScript 5.9.3
- **Linters**: Oxlint 1.35.0 + ESLint 9.39.2
- **Type Checking**: vue-tsc 3.1.4

---

## 📚 Additional Resources

- [Vite Documentation](https://vite.dev/)
- [Vue 3 Documentation](https://vuejs.org/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Lint Guide](./LINT_GUIDE.md)
