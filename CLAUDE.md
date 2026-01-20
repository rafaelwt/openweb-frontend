# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Context

Migration from `redis/` (PHP + Alpine.js + Tailwind 3) to Angular 21 + Tailwind 4.
Design reference: `redis/index.php` - replicate the same visual design.

## Common Commands

```bash
# Development server (http://localhost:4200)
ng serve

# Run tests (Vitest)
npm test
ng test --watch              # Watch mode

# Build
ng build
ng build --configuration production

# Format code (Prettier + Tailwind class sorting)
npm run format               # Format all files
npm run format:check         # Check only

# Documentation (Compodoc)
npm run doc:serve            # http://localhost:8080
npm run doc:build            # Generate static files
```

## Architecture Overview

### Data Flow
1. **API Layer**: `ApiService` (`core/services/api.service.ts`) handles all backend communication via `HttpClient`
2. **Interceptors**: `credentialsInterceptor` automatically injects credentials
3. **State Management**: Signal-based services (e.g., `CartService` uses `signal()` and `computed()`)
4. **Persistence**: `CartService` uses sessionStorage with session ID validation

### Routing Structure
All routes wrapped in `MainLayoutComponent` (header/footer):
- `/` → Home (lazy: `features/home/`)
- `/servicio/:aliasServicio` → Business wizard (lazy: `features/business/`)
- `/soporte/*` → Support pages (lazy: `features/support/`)
- `/carrito` → Cart (lazy: `features/cart/`)

### Key Services
- `ApiService`: Backend communication (servicios, cobranzas, pagos, verificar endpoints)
- `CartService`: Shopping cart with Decimal.js for currency precision
- `ThemeService`: Dark/light mode toggle
- `FingerprintService`: Browser fingerprinting for payment security
- `QrService`: QR code generation for payments

### Environment Configuration
- Development API: `http://localhost:8080/api/v1` (see `src/environments/environment.ts`)
- Production API: `/api`

## Angular 21 Conventions

### Components
- Standalone components (do NOT set `standalone: true` - it's default)
- Use `input()` and `output()` instead of `@Input()` and `@Output()`
- Use `inject()` instead of constructor injection
- Set `changeDetection: ChangeDetectionStrategy.OnPush`
- Separate `.ts` and `.html` files for substantial templates

### Templates
- Use native control flow: `@if`, `@for`, `@switch` (NOT `*ngIf`, `*ngFor`)
- Use `[class.active]="condition"` (NOT `ngClass`)
- Use `NgOptimizedImage` for static images with correct aspect ratios
- Do NOT use arrow functions in templates

### State
- Use `signal()` for local state
- Use `computed()` for derived state
- Use `update()` or `set()` on signals (NOT `mutate`)

### Imports
- Do NOT use barrel files (`index.ts`)
- Use direct imports: `import { X } from './path/to/x'`

### Forms
- Prefer Reactive forms
- Use `[ngValue]` for select options to preserve types

## Tailwind CSS 4

Configured via `.postcssrc.json`. Classes auto-sorted by `prettier-plugin-tailwindcss`.

**Note**: Dynamic classes like `[class.xxx]="condition"` are NOT auto-sorted - organize manually.

Modifiers order: `hover:` → `focus:` → `sm:` → `md:` → `lg:` → `dark:`

## Code Style

- Documentation in English (JSDoc/TSDoc), variable names may be in Spanish
- WCAG AA accessibility required (AXE checks must pass)
- Images: static in `public/img/`, transform API paths `/public/img/...` → `/img/...`
