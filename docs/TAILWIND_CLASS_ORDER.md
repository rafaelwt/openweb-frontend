# Convención de Ordenamiento de Clases Tailwind CSS

## Índice
1. [Introducción](#introducción)
2. [Configuración Automática](#configuración-automática)
3. [Orden Oficial de Tailwind](#orden-oficial-de-tailwind)
4. [Ejemplos por Tipo de Componente](#ejemplos-por-tipo-de-componente)
5. [Reglas Especiales](#reglas-especiales)
6. [Casos Especiales del Proyecto](#casos-especiales-del-proyecto)
7. [Comandos Útiles](#comandos-útiles)
8. [Configuración del Editor](#configuración-del-editor)

---

## Introducción

Este proyecto utiliza el plugin oficial `prettier-plugin-tailwindcss` para ordenar automáticamente las clases Tailwind CSS según el estándar recomendado por Tailwind Labs.

**Beneficios:**
- **Consistencia automática** en todos los archivos del proyecto
- **Legibilidad mejorada** con clases en orden predecible
- **Menos conflictos en Git** causados por reordenamientos manuales
- **Colaboración más fluida** entre desarrolladores
- **Estándar oficial** mantenido por el equipo de Tailwind

---

## Configuración Automática

El plugin está configurado en `package.json`:

```json
"prettier": {
  "printWidth": 100,
  "singleQuote": true,
  "plugins": ["prettier-plugin-tailwindcss"],
  "overrides": [
    {
      "files": "*.html",
      "options": {
        "parser": "angular"
      }
    }
  ]
}
```

**No necesitas ordenar manualmente las clases.** Prettier lo hará automáticamente cuando formatees el código.

---

## Orden Oficial de Tailwind

El plugin ordena las clases siguiendo estas categorías (de primero a último):

### 1. Custom Classes
Clases personalizadas que no vienen de Tailwind aparecen primero.

```html
<div class="mi-clase-custom flex items-center">
```

### 2. Layout
Display, position, float, clear, isolation, object-fit, overflow

```html
block inline flex grid hidden
absolute relative fixed sticky
float-left float-right
clear-both
overflow-hidden overflow-auto
```

### 3. Box Model
Width, height, margin, padding

```html
w-full h-screen max-w-7xl min-h-0
m-4 mx-auto my-8 mt-2 mb-4
p-4 px-6 py-3 pt-2 pb-8
```

### 4. Flexbox & Grid
Propiedades de flex y grid, gap, justify, align, place

```html
flex-1 flex-col flex-wrap
grid-cols-3 grid-rows-2
gap-4 gap-x-2 gap-y-3
justify-center items-center place-items-center
```

### 5. Spacing
Space-x, space-y

```html
space-x-4 space-y-2
```

### 6. Sizing
Max-width, min-width, max-height, min-height (valores específicos)

```html
max-w-md min-w-0 max-h-screen min-h-full
```

### 7. Typography
Font-family, font-size, font-weight, text-align, text-color, line-height, letter-spacing, text-decoration

```html
font-sans font-bold text-lg text-center text-gray-900
leading-tight tracking-wide uppercase
underline line-through
```

### 8. Backgrounds
Background-color, background-opacity, background-gradient, background-image, background-size, background-position

```html
bg-white bg-gray-100 bg-opacity-50
bg-gradient-to-r from-blue-500 to-purple-600
bg-cover bg-center
```

### 9. Borders
Border-width, border-color, border-style, divide

```html
border border-2 border-t-4
border-gray-300 border-red-500
border-solid border-dashed
divide-x divide-gray-200
```

### 10. Effects
Border-radius, shadow, opacity, mix-blend-mode

```html
rounded rounded-lg rounded-full rounded-t-xl
shadow shadow-md shadow-lg shadow-2xl
opacity-50 opacity-100
```

### 11. Filters
Blur, brightness, contrast, grayscale, hue-rotate, invert, saturate, sepia

```html
blur-sm brightness-50 contrast-125
grayscale saturate-150 sepia
```

### 12. Tables
Border-collapse, table-layout

```html
border-collapse border-separate
table-auto table-fixed
```

### 13. Transitions & Animation
Transition, duration, ease, animate, delay

```html
transition transition-all transition-colors
duration-300 duration-500
ease-in ease-out ease-in-out
animate-spin animate-bounce
```

### 14. Transforms
Scale, rotate, translate, skew, transform-origin

```html
scale-100 scale-105 -rotate-45
translate-x-4 translate-y-2 -translate-x-1/2
skew-x-12 transform-origin-center
```

### 15. Interactivity
Appearance, cursor, pointer-events, resize, user-select, will-change

```html
appearance-none cursor-pointer
pointer-events-none resize-none
select-none will-change-transform
```

### 16. SVG
Fill, stroke

```html
fill-current stroke-current stroke-2
```

### 17. Accessibility
Screen-reader utilities

```html
sr-only not-sr-only
```

### 18. Modifiers
En orden de especificidad: pseudo-classes → responsive → dark mode

#### Pseudo-classes
```html
hover:bg-blue-600
focus:outline-none focus:ring-2
active:scale-95
disabled:opacity-50 disabled:cursor-not-allowed
first:mt-0 last:mb-0
odd:bg-gray-100 even:bg-white
```

#### Responsive Breakpoints
Siempre en orden de tamaño: `sm:` → `md:` → `lg:` → `xl:` → `2xl:`

```html
sm:px-6 md:px-8 lg:px-12 xl:px-16
```

#### Dark Mode
Siempre al final

```html
dark:bg-gray-800 dark:text-white
```

#### Combinaciones
Responsive + pseudo-classes + dark mode

```html
md:hover:scale-105
dark:md:hover:bg-gray-700
```

---

## Ejemplos por Tipo de Componente

### Botones

**ANTES (inconsistente):**
```html
<button class="bg-blue-500 text-white px-4 inline-flex items-center rounded-md py-4 gap-2 font-semibold text-lg hover:bg-blue-600 cursor-pointer transition-all disabled:opacity-50">
  Enviar
</button>
```

**DESPUÉS (ordenado automáticamente):**
```html
<button class="inline-flex items-center gap-2 rounded-md bg-blue-500 px-4 py-4 text-lg font-semibold text-white transition-all hover:bg-blue-600 disabled:opacity-50">
  Enviar
</button>
```

**Explicación del orden:**
1. Layout: `inline-flex`
2. Flexbox: `items-center`, `gap-2`
3. Effects: `rounded-md`
4. Background: `bg-blue-500`
5. Spacing: `px-4`, `py-4`
6. Typography: `text-lg`, `font-semibold`, `text-white`
7. Transitions: `transition-all`
8. Pseudo-classes: `hover:bg-blue-600`
9. State modifiers: `disabled:opacity-50`

---

### Inputs y Forms

**ANTES:**
```html
<input class="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 dark:bg-gray-700">
```

**DESPUÉS:**
```html
<input class="w-full rounded-md border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none dark:bg-gray-700">
```

**Con estados más complejos:**
```html
<input
  type="text"
  class="w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-80 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:disabled:bg-gray-800"
>
```

**Orden aplicado:**
1. Sizing: `w-full`
2. Effects: `rounded-md`
3. Borders: `border`, `border-gray-300`
4. Background: `bg-white`
5. Spacing: `px-4`, `py-3`
6. Typography: `text-sm`
7. Transitions: `transition-all`
8. Focus states: `focus:border-blue-500`, `focus:outline-none`, `focus:ring-4`, `focus:ring-blue-100`
9. Disabled states: `disabled:cursor-not-allowed`, `disabled:bg-gray-100`, `disabled:opacity-80`
10. Dark mode: `dark:border-gray-600`, `dark:bg-gray-700`, `dark:text-gray-200`, `dark:disabled:bg-gray-800`

---

### Cards

**ANTES:**
```html
<div class="bg-white rounded-2xl border border-gray-200 shadow-lg transition-all hover:shadow-2xl dark:bg-gray-900">
```

**DESPUÉS:**
```html
<div class="rounded-2xl border border-gray-200 bg-white shadow-lg transition-all hover:shadow-2xl dark:bg-gray-900">
```

**Card complejo (del proyecto):**
```html
<div class="block rounded-lg border border-gray-300 bg-gray-200 p-1 shadow-lg transition-all hover:border-redis hover:shadow-lg hover:grayscale-0 sm:px-4 sm:pb-3 sm:pt-4 sm:grayscale dark:border-gray-600 dark:bg-gray-700">
  <!-- contenido -->
</div>
```

**Orden aplicado:**
1. Layout: `block`
2. Effects: `rounded-lg`
3. Borders: `border`, `border-gray-300`
4. Background: `bg-gray-200`
5. Spacing: `p-1`
6. Shadow: `shadow-lg`
7. Transitions: `transition-all`
8. Hover states: `hover:border-redis`, `hover:shadow-lg`, `hover:grayscale-0`
9. Responsive: `sm:px-4`, `sm:pb-3`, `sm:pt-4`, `sm:grayscale`
10. Dark mode: `dark:border-gray-600`, `dark:bg-gray-700`

---

### Containers y Layout

**ANTES:**
```html
<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
```

**DESPUÉS:**
```html
<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
```

**Container completo:**
```html
<div class="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 md:py-12 lg:px-8 xl:max-w-screen-xl">
  <!-- contenido -->
</div>
```

---

### Tooltips y Popups

**ANTES:**
```html
<div class="absolute left-1/2 top-full -translate-x-1/2 z-50 mt-2 px-3 py-1.5 bg-gray-800 rounded-md shadow-lg text-sm text-white whitespace-nowrap dark:bg-gray-700">
```

**DESPUÉS:**
```html
<div class="absolute left-1/2 top-full z-50 mt-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-800 px-3 py-1.5 text-sm text-white shadow-lg dark:bg-gray-700">
```

**Orden aplicado:**
1. Position: `absolute`, `left-1/2`, `top-full`
2. Z-index: `z-50`
3. Spacing: `mt-2`
4. Transform: `-translate-x-1/2`
5. Typography: `whitespace-nowrap`
6. Effects: `rounded-md`
7. Background: `bg-gray-800`
8. Spacing: `px-3`, `py-1.5`
9. Typography: `text-sm`, `text-white`
10. Shadow: `shadow-lg`
11. Dark mode: `dark:bg-gray-700`

---

### Grids y Listas

**Grid responsive:**
```html
<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
  <!-- items -->
</div>
```

**Lista con separadores:**
```html
<ul class="divide-y divide-gray-200 dark:divide-gray-700">
  <li class="py-4 first:pt-0 last:pb-0">Item</li>
</ul>
```

---

## Reglas Especiales

### Valores Arbitrarios
Se ordenan en la misma categoría que su clase base.

```html
<!-- width arbitraria se ordena con otras clases de width -->
<div class="h-screen w-[250px] max-w-full">

<!-- color arbitrario se ordena con bg-* -->
<div class="bg-[#1a1a1a] text-[#ff6b6b]">
```

### Clases con Prefijos Negativos
Se ordenan junto con sus contrapartes positivas.

```html
<div class="mt-4 -mb-2 ml-auto -translate-x-1/2">
```

### Multiple Border Sides
```html
<!-- border de todos los lados primero, luego específicos -->
<div class="border border-t-4 border-gray-200 border-t-blue-500">
```

### Múltiples Estados del Mismo Tipo
Orden alfabético dentro de la misma categoría de estado.

```html
<!-- active antes de hover alfabéticamente -->
<button class="active:scale-95 hover:scale-105">
```

---

## Casos Especiales del Proyecto

### Service Cards (service-card.html)

**Ejemplo real del proyecto:**
```html
<!-- Card principal del servicio -->
<div
  class="block rounded-lg border border-gray-300 bg-gray-200 p-1 shadow-lg transition-all hover:border-redis hover:shadow-lg hover:grayscale-0 sm:px-4 sm:pb-3 sm:pt-4 sm:grayscale dark:border-gray-600 dark:bg-gray-700 dark:hover:border-redis"
>
  <!-- Imagen del servicio -->
  <img
    class="mx-auto h-auto w-full rounded-md object-cover sm:h-16 sm:w-16"
    [src]="imageUrl()"
    [alt]="service().name"
  >

  <!-- Nombre del servicio -->
  <h3 class="mt-2 text-center text-xs font-semibold text-gray-800 sm:mt-3 sm:text-sm dark:text-gray-200">
    {{ service().name }}
  </h3>
</div>
```

### Checkout Wizard (checkout-wizard.html)

**Navegación de pasos:**
```html
<nav class="mb-8 flex items-center justify-center gap-2 sm:gap-4">
  <button
    class="flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all hover:scale-110 sm:h-12 sm:w-12 sm:text-base"
    [class.border-blue-500]="step === i + 1"
    [class.bg-blue-500]="step === i + 1"
    [class.text-white]="step === i + 1"
  >
    {{ i + 1 }}
  </button>
</nav>
```

**Nota:** Las clases dinámicas con `[class.xxx]` NO se ordenan automáticamente por Prettier. Mantenlas agrupadas lógicamente.

### Header (header.html)

**Tooltip pattern:**
```html
<div
  class="group relative"
  (mouseenter)="showTooltip.set(true)"
  (mouseleave)="showTooltip.set(false)"
>
  <!-- Trigger -->
  <button class="rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800">
    Icono
  </button>

  <!-- Tooltip -->
  @if (showTooltip()) {
    <div class="absolute left-1/2 top-full z-50 mt-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-800 px-3 py-1.5 text-sm text-white shadow-lg dark:bg-gray-700">
      Texto del tooltip
    </div>
  }
</div>
```

---

## Comandos Útiles

### Formatear archivos

```bash
# Formatear un archivo específico
npx prettier --write src/app/features/home/pages/home-page/home-page.html

# Formatear todos los archivos HTML
npx prettier --write "src/**/*.html"

# Formatear todos los archivos del proyecto (HTML, TS, CSS)
npm run format
```

### Verificar formato

```bash
# Verificar si los archivos están formateados (sin modificar)
npx prettier --check "src/**/*.html"

# Verificar todo el proyecto
npm run format:check
```

### Formatear antes de commit

```bash
# Formatear todo antes de hacer commit
npm run format

# Luego hacer commit
git add .
git commit -m "chore: apply Tailwind class ordering"
```

---

## Configuración del Editor

### Visual Studio Code

Instala la extensión oficial de Prettier:
```
ext install esbenp.prettier-vscode
```

Agrega a tu `.vscode/settings.json`:
```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "[html]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

### WebStorm / IntelliJ

1. Ve a `Settings` → `Languages & Frameworks` → `JavaScript` → `Prettier`
2. Marca "On code reformat" y "On save"
3. Configura el path del binario de Prettier: `node_modules/prettier`

### Otros Editores

Consulta la documentación oficial de Prettier para tu editor:
https://prettier.io/docs/en/editors.html

---

## Preguntas Frecuentes

### ¿Por qué `dark:` va al final?
El plugin sigue el principio de CSS de "último en ganar" (last wins). Las clases `dark:` suelen sobrescribir otras clases, por lo que van al final para mayor claridad.

### ¿Qué pasa con las clases dinámicas `[class.xxx]`?
Prettier **NO** ordena las clases dentro de `[class.xxx]` porque son expresiones de Angular, no strings simples. Organiza estas manualmente de forma lógica.

### ¿Puedo personalizar el orden?
No es recomendable. El orden del plugin es el estándar oficial de Tailwind y es el mismo que usa el equipo de Tailwind. Personalizarlo rompería la consistencia con la documentación oficial y otros proyectos.

### ¿Funciona con clases personalizadas?
Sí. Las clases que no vienen de Tailwind se ordenan al principio, antes de cualquier clase de Tailwind.

### ¿Qué pasa si no uso Prettier?
Sin Prettier, tendrás que ordenar las clases manualmente siguiendo esta guía. Sin embargo, es altamente recomendable usar Prettier para automatización y consistencia.

---

## Referencias

- [Documentación oficial de prettier-plugin-tailwindcss](https://github.com/tailwindlabs/prettier-plugin-tailwindcss)
- [Blog de Tailwind sobre ordenamiento automático](https://tailwindcss.com/blog/automatic-class-sorting-with-prettier)
- [Documentación de Prettier](https://prettier.io/)
- [Configuración de Prettier con Angular](https://angular.dev/guide/tailwind)

---

**Última actualización:** 2025-12-27
