import { ChangeDetectionStrategy, Component, input, computed } from '@angular/core';

/**
 * Reusable loading spinner component with optional text and full-screen mode.
 *
 * Displays an animated SVG spinner with configurable size.
 * Can be used inline or as a full-screen overlay.
 *
 * @selector app-loading
 *
 * @example
 * ```html
 * <!-- Inline loading spinner -->
 * <app-loading size="md" text="Cargando datos..." />
 *
 * <!-- Full-screen loading overlay -->
 * <app-loading size="lg" text="Procesando pago..." [fullScreen]="true" />
 * ```
 */
@Component({
  selector: 'app-loading',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div [class]="containerClasses()">
      <svg [class]="spinnerClasses()" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      @if (text()) {
        <span class="mt-2 text-gray-600">{{ text() }}</span>
      }
    </div>
  `,
})
export class LoadingComponent {
  /**
   * Spinner size: 'sm' (6x6), 'md' (10x10), 'lg' (16x16).
   *
   * @default 'md'
   */
  readonly size = input<'sm' | 'md' | 'lg'>('md');

  /**
   * Optional text to display below the spinner.
   */
  readonly text = input<string>();

  /**
   * If true, displays as a fixed full-screen overlay with semi-transparent background.
   *
   * @default false
   */
  readonly fullScreen = input(false);

  /**
   * Computed CSS classes for the container.
   *
   * @remarks
   * When fullScreen is true, adds fixed positioning and overlay background.
   */
  protected containerClasses = computed(() => {
    const base = 'flex flex-col items-center justify-center';
    return this.fullScreen() ? `${base} fixed inset-0 bg-white/80 z-50` : base;
  });

  /**
   * Computed CSS classes for the spinner SVG.
   *
   * @remarks
   * Applies size-specific height/width classes and animation.
   */
  protected spinnerClasses = computed(() => {
    const sizeClasses: Record<string, string> = {
      sm: 'h-6 w-6',
      md: 'h-10 w-10',
      lg: 'h-16 w-16',
    };
    return `animate-spin text-blue-600 ${sizeClasses[this.size()]}`;
  });
}
