import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ErrorModalService } from '@core/services/error-modal.service';

/**
 * Global error modal component.
 *
 * Displays error messages managed by ErrorModalService.
 * Supports four severity levels: error, warning, info, success.
 *
 * @selector app-error-modal
 *
 * @remarks
 * - Automatically positioned as a fixed overlay (z-50)
 * - Visibility controlled by ErrorModalService.isOpen signal
 * - Displays title, message, and optional detail key-value pairs
 * - Auto-closes after configurable timeout (default 5s)
 *
 * @see {@link ErrorModalService}
 */
@Component({
  selector: 'app-error-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './error-modal.html',
})
export class ErrorModalComponent {
  /**
   * Reference to the error modal service managing modal state.
   */
  protected readonly modal = inject(ErrorModalService);

  /**
   * Converts the details object to an array of key-value tuples for template iteration.
   *
   * @returns Array of [key, value] tuples from the modal config details
   *
   * @internal
   */
  protected getDetailEntries(): [string, string][] {
    const details = this.modal.config().details;
    return Object.entries(details);
  }
}
