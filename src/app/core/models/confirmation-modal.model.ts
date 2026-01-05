/**
 * Configuration for the confirmation modal component.
 *
 * @remarks
 * Defines the complete structure for displaying a two-button confirmation dialog
 * with customizable content, styling, and behavior.
 *
 * @see {@link ConfirmationModalService}
 */
export interface ConfirmationModalConfig {
  /**
   * Modal title displayed in the header.
   *
   * @example "Confirmar operación"
   */
  title: string;

  /**
   * Main message explaining the situation to the user.
   *
   * @example "¿Está seguro que desea continuar con esta acción?"
   */
  message: string;

  /**
   * Optional key-value details to display in a highlighted section.
   *
   * @example
   * ```typescript
   * {
   *   'Usuario': 'Juan Pérez',
   *   'Monto': 'Bs. 150.00'
   * }
   * ```
   */
  details?: Record<string, string>;

  /**
   * Text for the confirm/continue button.
   *
   * @example "Continuar"
   */
  confirmText: string;

  /**
   * Text for the cancel button.
   *
   * @example "Cancelar"
   */
  cancelText: string;

  /**
   * CSS classes for the modal header background.
   *
   * @example "bg-amber-50 dark:bg-amber-900"
   */
  headerClass: string;

  /**
   * CSS classes for the icon container.
   *
   * @example "bg-amber-500 text-white"
   */
  iconClass: string;

  /**
   * CSS classes for the confirm button.
   *
   * @example "bg-amber-500 hover:bg-amber-600"
   */
  confirmButtonClass: string;

  /**
   * CSS classes for the cancel button.
   *
   * @example "bg-gray-200 hover:bg-gray-300 text-gray-800"
   */
  cancelButtonClass: string;

  /**
   * CSS classes for the details section border.
   *
   * @example "border-amber-300 dark:border-amber-700"
   */
  borderClass: string;
}

/**
 * Partial configuration for creating a confirmation modal.
 *
 * @remarks
 * Allows omitting styling-related properties which will be filled with defaults.
 * Only content properties (title, message, buttons) need to be specified.
 *
 * @example
 * ```typescript
 * const config: ConfirmationModalInput = {
 *   title: 'Eliminar item',
 *   message: '¿Desea eliminar este elemento?',
 *   confirmText: 'Eliminar',
 *   cancelText: 'Cancelar'
 * };
 * ```
 */
export type ConfirmationModalInput = Partial<ConfirmationModalConfig>;
