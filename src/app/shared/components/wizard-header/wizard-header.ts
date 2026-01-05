import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';

/**
 * Wizard card header component with title and close button.
 *
 * Displays a styled header bar for wizard steps with optional title and exit functionality.
 *
 * @selector app-wizard-header
 *
 * @remarks
 * Used in multi-step wizards (COOPAPPI, checkout) to provide consistent header styling.
 * Close button shows a tooltip on hover and emits an event when clicked.
 *
 * @example
 * ```html
 * <app-wizard-header
 *   [cardTitle]="'PASO 1 - BUSQUEDA'"
 *   (buttonClose)="goToHome()"
 * />
 * ```
 */
@Component({
  selector: 'app-wizard-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './wizard-header.html',
})
export class WizardHeaderComponent {
  /**
   * Optional title text to display in the header.
   *
   * @example "PASO 1 - BUSQUEDA DE SOCIO"
   */
  readonly cardTitle = input<string | undefined>();

  /**
   * Event emitted when the close button is clicked.
   *
   * @remarks
   * Parent component should handle navigation (e.g., return to home page).
   */
  readonly buttonClose = output<void>();

  /**
   * Controls visibility of the close button tooltip.
   *
   * @internal
   */
  protected readonly showTooltip = signal(false);
}
