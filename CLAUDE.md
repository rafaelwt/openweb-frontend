# OpenWeb Frontend - Angular 21 Application

## Project Context
Migration from `redis/` (PHP + Alpine.js + Tailwind 3) to Angular 21 + Tailwind 4.
Design reference: `redis/index.php` - replicate the same visual design.

## Environment Configuration
- Development API: http://localhost:8000/api
- Production API: /api

## Tailwind CSS 4
Configured via `.postcssrc.json` following official Angular guide.
Reference: https://angular.dev/guide/tailwind

**Migration notes (Tailwind 3 → 4):**
- Most utility classes are the same
- Check dark mode classes work correctly
- Test responsive breakpoints (sm, md, lg, xl)

### Tailwind CSS Class Order

This project uses automatic class sorting via `prettier-plugin-tailwindcss`.

**Key rules:**
- Classes are automatically sorted when you run `npm run format`
- Follow the official Tailwind order (see `docs/TAILWIND_CLASS_ORDER.md`)
- Modifiers order: `hover:` → `focus:` → `sm:` → `md:` → `lg:` → `dark:`
- Always run Prettier before committing HTML changes

**Format code:**
```bash
npm run format              # Format all files
npm run format:check        # Check formatting without modifying
```

**The complete documentation has been generated to:**
- Directory: ./documentation/
```bash
npm run doc:serve           # View online: http://localhost:8080
npm run doc:build           # Build for deployment: to generate static files in ./documentation/
```

All TypeScript code now follows Angular conventions with comprehensive JSDoc/TSDoc documentation in English, including:
- Class and interface descriptions
- @param tags for all parameters
- @returns tags for all return values
- @remarks for implementation details
- @example code snippets where applicable
- @see cross-references between related components

The documentation maintains the existing Spanish variable/method names while providing clear English documentation for international collaboration and tool compatibility (Compodoc, TypeDoc, IDE intellisense).

**Important notes:**
- Prettier orders Tailwind classes automatically in `.html` files
- Dynamic classes with `[class.xxx]="condition"` are NOT auto-sorted - organize these manually
- See full documentation: `docs/TAILWIND_CLASS_ORDER.md`

## Angular 21 Best Practices
Reference: https://angular.dev/ai/develop-with-ai

### TypeScript
- Use strict type checking
- Prefer type inference when the type is obvious
- Avoid the `any` type; use `unknown` when type is uncertain

### Components
- Always use standalone components (default in Angular v20+)
- Do NOT manually set `standalone: true` - it's the default
- Components should be small and focused on a single responsibility
- Use `input()` and `output()` functions instead of `@Input()` and `@Output()` decorators
- Use the `host` object instead of `@HostBinding` and `@HostListener` decorators
- Set `changeDetection: ChangeDetectionStrategy.OnPush` in `@Component` decorator
- Prefer inline templates for small components

### Component Files
- Separate `.ts` and `.html` files for components with substantial templates
- Inline `template` only for very small components (< 10 lines, e.g., `app.ts`)
- Use `templateUrl: './component-name.html'` with paths relative to the component TS file

### State Management
- Use signals for local component state (`signal()`)
- Use `computed()` for derived state
- Keep state transformations pure and predictable
- Do NOT use `mutate` on signals, use `update` or `set` instead
- Use `inject()` function instead of constructor injection

### Templates
- Keep templates simple and avoid complex logic
- Use native control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`
- Use the async pipe to handle observables
- Do NOT use arrow functions in templates (not supported)
- Do NOT use `ngClass` - use `class` bindings instead: `[class.active]="isActive()"`
- Do NOT use `ngStyle` - use `style` bindings instead
- Do not assume globals like `new Date()` are available

### Forms
- Prefer Reactive forms instead of Template-driven ones
- Use `[ngValue]` for select options to preserve types (not `[value]`)

### Images
- Use `NgOptimizedImage` for all static images (does not work for inline base64 images)
- Static images in `public/img/`
- Service icons: `public/img/servicio/srvXXX.png`
- Transform API paths: `/public/img/...` → `/img/...` (remove `/public` prefix)

### Services
- Design services around a single responsibility
- Use `providedIn: 'root'` for singleton services
- Use `inject()` function instead of constructor injection

### Routing
- Implement lazy loading for feature routes
- Use `loadChildren` with dynamic imports

### Imports
- Do NOT use barrel files (`index.ts`) for re-exporting modules
- Use direct imports to each file: `import { X } from './path/to/x'`
- Barrels cause: circular dependencies, broken tree-shaking, slow cold starts, difficult refactoring

### Accessibility
- Code MUST pass all AXE checks
- Follow all WCAG AA minimums, including:
  - Focus management
  - Color contrast
  - ARIA attributes

## Project Structure
```
src/app/
├── core/           # Singleton services, models
├── shared/         # Reusable components, pipes
├── layouts/        # Page layouts (header, footer)
├── features/       # Feature modules (lazy loaded)
│   ├── home/
│   ├── servicios/
│   ├── carrito/
│   └── pago/
├── app.ts          # Root component (inline template OK)
├── app.routes.ts
└── app.config.ts
```

## Common Commands
```bash
# Development
ng serve

# Build
ng build

# Build production
ng build --configuration production
```
