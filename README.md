# OpenWeb Frontend

[![Angular](https://img.shields.io/badge/Angular-21-DD0031?style=for-the-badge&logo=angular&logoColor=white)](https://angular.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-Private-red?style=for-the-badge)]()

Modern web application built with **Angular 21** and **Tailwind CSS 4**, featuring a modular architecture, lazy-loaded routes, and responsive design.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Development](#development)
- [Building](#building)
- [Testing](#testing)
- [Documentation](#documentation)
- [Code Quality](#code-quality)
- [Contributing](#contributing)

## Features

- **Standalone Components** - Modern Angular 21 architecture without NgModules
- **Signal-based State Management** - Reactive state with Angular Signals
- **Lazy Loading** - Optimized bundle size with route-based code splitting
- **Responsive Design** - Mobile-first approach with Tailwind CSS 4
- **Accessibility** - WCAG AA compliant with AXE validation
- **Type Safety** - Strict TypeScript configuration
- **Optimized Images** - Using `NgOptimizedImage` for performance

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Angular | 21.x | Frontend framework |
| Tailwind CSS | 4.x | Utility-first CSS |
| TypeScript | 5.9 | Type-safe JavaScript |
| RxJS | 7.8 | Reactive programming |
| Vitest | 4.x | Unit testing |
| Compodoc | 1.1 | Documentation |

## Project Structure

```
src/app/
├── core/                   # Singleton services and models
│   ├── interceptors/       # HTTP interceptors
│   ├── models/             # TypeScript interfaces/types
│   └── services/           # Application-wide services
├── shared/                 # Reusable components
│   └── components/         # Shared UI components
├── layouts/                # Page layouts (header, footer)
├── features/               # Feature modules (lazy loaded)
│   ├── home/               # Home page
│   ├── cart/               # Shopping cart
│   ├── business/           # Business logic
│   ├── support/            # Support/Help
│   └── errors/             # Error pages
├── app.ts                  # Root component
├── app.routes.ts           # Application routes
└── app.config.ts           # Application configuration
```

## Prerequisites

- **Node.js** >= 20.x
- **npm** >= 11.x
- **Angular CLI** >= 21.x

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/openweb-frontend.git
   cd openweb-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:4200`

## Development

### Development Server

```bash
# Start development server
npm start
# or
ng serve
```

The application will automatically reload when you modify any source files.

### Environment Configuration

| Environment | API URL |
|-------------|---------|
| Development | `http://localhost:8000/api` |
| Production | `/api` |

### Code Scaffolding

```bash
# Generate a new component
ng generate component features/my-feature/components/my-component

# Generate a new service
ng generate service core/services/my-service

# Generate a new pipe
ng generate pipe shared/pipes/my-pipe
```

## Building

### Development Build

```bash
npm run build
```

### Production Build

```bash
ng build --configuration production
```

Build artifacts are stored in the `dist/` directory.

## Testing

### Unit Tests

```bash
# Run tests
npm test

# Run tests in watch mode
ng test --watch
```

Tests are executed with [Vitest](https://vitest.dev/).

## Documentation

### Generate Documentation

```bash
# Build documentation
npm run doc:build

# Serve documentation locally
npm run doc:serve
```

Documentation is available at `http://localhost:8080` when running the serve command.

### View Generated Docs

Static documentation is generated in the `./documentation/` directory.

## Code Quality

### Formatting

This project uses **Prettier** with the `prettier-plugin-tailwindcss` for automatic class sorting.

```bash
# Format all files
npm run format

# Check formatting without modifying
npm run format:check
```

### Tailwind CSS Class Order

Tailwind classes are automatically sorted following the official order:
- Base utilities first
- Modifiers order: `hover:` → `focus:` → `sm:` → `md:` → `lg:` → `dark:`

See `docs/TAILWIND_CLASS_ORDER.md` for complete documentation.

### Angular Best Practices

This project follows [Angular 21 best practices](https://angular.dev/ai/develop-with-ai):

- Standalone components (default in Angular 21+)
- `input()` and `output()` functions instead of decorators
- `inject()` function instead of constructor injection
- `signal()` and `computed()` for reactive state
- Native control flow (`@if`, `@for`, `@switch`)
- `ChangeDetectionStrategy.OnPush` for performance
- Direct imports (no barrel files)

## Contributing

1. Create a feature branch from `main`
2. Make your changes following the code style guidelines
3. Run `npm run format` before committing
4. Ensure all tests pass with `npm test`
5. Submit a pull request

### Commit Messages

Follow conventional commits:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Test updates
- `chore:` Maintenance tasks

---

<p align="center">
  Built with Angular 21 + Tailwind CSS 4
</p>
