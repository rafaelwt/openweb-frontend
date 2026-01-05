import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ConfirmationModalService } from '@core/services/confirmation-modal.service';

/**
 * Reusable confirmation modal component with two-button layout (Cancel/Confirm).
 *
 * Displays a blocking modal dialog asking the user to confirm or cancel an operation.
 * The modal state and configuration are managed by {@link ConfirmationModalService}.
 *
 * @remarks
 * **Features:**
 * - Promise-based API for async user decisions
 * - Two-button layout (Cancel + Confirm)
 * - Optional details section for key-value pairs
 * - Responsive design (stacked on mobile, side-by-side on desktop)
 * - Matches ErrorModal visual design (backdrop blur, animations, Tailwind styling)
 * - OnPush change detection for optimal performance
 *
 * **Usage:**
 * Component is registered globally in MainLayoutComponent and controlled via service.
 *
 * @example
 * ```typescript
 * // In your component:
 * private readonly confirmModal = inject(ConfirmationModalService);
 *
 * async deleteItem() {
 *   const confirmed = await this.confirmModal.confirm({
 *     title: 'Eliminar item',
 *     message: '¿Está seguro?',
 *     confirmText: 'Eliminar',
 *     cancelText: 'Cancelar'
 *   });
 *
 *   if (confirmed) {
 *     // Proceed with deletion
 *   }
 * }
 * ```
 *
 * @selector app-confirmation-modal
 *
 * @see {@link ConfirmationModalService}
 * @see {@link ConfirmationModalConfig}
 */
@Component({
  selector: 'app-confirmation-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './confirmation-modal.html',
})
export class ConfirmationModalComponent {
  /**
   * Injected confirmation modal service managing state and configuration.
   */
  protected readonly modal = inject(ConfirmationModalService);

  /**
   * Converts the details object to an array of [key, value] tuples for template iteration.
   *
   * @returns Array of key-value pairs from the details object
   *
   * @internal
   */
  protected getDetailEntries(): [string, string][] {
    const details = this.modal.config().details;
    return details ? Object.entries(details) : [];
  }
}
