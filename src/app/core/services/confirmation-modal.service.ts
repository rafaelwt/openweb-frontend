import { Injectable, signal } from '@angular/core';
import { ConfirmationModalConfig, ConfirmationModalInput } from '../models/confirmation-modal.model';

/**
 * Default configuration for the confirmation modal with warning styling.
 *
 * @internal
 */
const DEFAULT_CONFIG: ConfirmationModalConfig = {
  title: 'Confirmar acción',
  message: '¿Está seguro que desea continuar con esta operación?',
  confirmText: 'Continuar',
  cancelText: 'Cancelar',
  details: {},
  headerClass: 'bg-amber-50 dark:bg-amber-900',
  iconClass: 'bg-amber-500 text-white',
  confirmButtonClass: 'bg-amber-500 hover:bg-amber-600',
  cancelButtonClass: 'bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100',
  borderClass: 'border-amber-300 dark:border-amber-700',
};

/**
 * Manages the confirmation modal component state and user interactions.
 *
 * Provides a Promise-based API for displaying confirmation dialogs with two-button
 * choices (confirm/cancel). Returns true if user confirms, false if user cancels.
 *
 * @remarks
 * - Uses reactive signals for modal visibility and configuration
 * - Promise-based confirm() method allows clean async/await syntax
 * - Default styling uses warning/amber theme
 * - Supports optional key-value details display
 *
 * @example
 * ```typescript
 * const confirmed = await this.confirmModal.confirm({
 *   title: 'Eliminar item',
 *   message: '¿Desea eliminar este elemento del carrito?',
 *   confirmText: 'Eliminar',
 *   cancelText: 'Cancelar'
 * });
 *
 * if (confirmed) {
 *   // User clicked confirm - proceed with action
 * } else {
 *   // User clicked cancel - abort operation
 * }
 * ```
 *
 * @see {@link ConfirmationModalConfig}
 * @see {@link ConfirmationModalComponent}
 */
@Injectable({
  providedIn: 'root',
})
export class ConfirmationModalService {
  private readonly _isVisible = signal(false);
  private readonly _config = signal<ConfirmationModalConfig>(DEFAULT_CONFIG);
  private readonly _resolveCallback = signal<((confirmed: boolean) => void) | null>(null);

  /**
   * Readonly signal indicating whether the modal is currently visible.
   */
  readonly isVisible = this._isVisible.asReadonly();

  /**
   * Readonly signal containing the current modal configuration.
   */
  readonly config = this._config.asReadonly();

  /**
   * Shows the confirmation modal and returns a Promise that resolves when the user makes a choice.
   *
   * @param customConfig - Partial configuration to override defaults
   * @returns Promise that resolves to `true` if user confirms, `false` if user cancels
   *
   * @remarks
   * - Merges custom configuration with default settings
   * - Modal stays visible until user clicks confirm or cancel
   * - Only one modal can be shown at a time (new calls override previous)
   *
   * @example
   * ```typescript
   * const result = await this.confirmModal.confirm({
   *   title: 'Pago duplicado',
   *   message: 'Ya existe un pago para este contrato.',
   *   details: {
   *     'Contrato': '12345',
   *     'Monto anterior': 'Bs. 100.00',
   *     'Monto nuevo': 'Bs. 150.00'
   *   },
   *   confirmText: 'Reemplazar',
   *   cancelText: 'Cancelar'
   * });
   * ```
   */
  confirm(customConfig?: ConfirmationModalInput): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      this._resolveCallback.set(resolve);
      this.show(customConfig);
    });
  }

  /**
   * Shows the confirmation modal with custom configuration.
   *
   * @param customConfig - Optional custom configuration to override defaults
   *
   * @remarks
   * Merges the custom configuration with default settings and makes the modal visible.
   *
   * @internal
   */
  private show(customConfig?: ConfirmationModalInput): void {
    const mergedConfig: ConfirmationModalConfig = {
      ...DEFAULT_CONFIG,
      ...customConfig,
      details: { ...DEFAULT_CONFIG.details, ...(customConfig?.details ?? {}) },
    };
    this._config.set(mergedConfig);
    this._isVisible.set(true);
  }

  /**
   * Hides the confirmation modal without resolving the promise.
   *
   * @internal
   */
  private hide(): void {
    this._isVisible.set(false);
  }

  /**
   * Handles the confirm button click.
   *
   * @remarks
   * Resolves the pending promise with `true` and hides the modal.
   *
   * @internal
   */
  handleConfirm(): void {
    const resolve = this._resolveCallback();
    this.hide();
    if (resolve) {
      resolve(true);
      this._resolveCallback.set(null);
    }
  }

  /**
   * Handles the cancel button click.
   *
   * @remarks
   * Resolves the pending promise with `false` and hides the modal.
   *
   * @internal
   */
  handleCancel(): void {
    const resolve = this._resolveCallback();
    this.hide();
    if (resolve) {
      resolve(false);
      this._resolveCallback.set(null);
    }
  }
}
