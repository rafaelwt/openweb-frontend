import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorType, ErrorModalConfig, ErrorModalInput } from '../models/error-modal.model';

/**
 * API error response structure from backend.
 *
 * @internal
 */
interface ApiErrorResponse {
  type: ErrorType;
  code?: string;
  message?: string;
  details?: Record<string, string>;
}

/**
 * Default configurations for each error type.
 *
 * @remarks
 * Provides pre-configured styling and behavior based on severity level.
 *
 * @internal
 */
const DEFAULT_CONFIGS: Record<ErrorType, ErrorModalConfig> = {
  error: {
    type: 'error',
    code: 'ERR_500',
    message: 'Se ha producido un error crítico en el sistema que impide continuar con la operación actual.',
    details: {},
    buttonText: 'Volver al inicio',
    redirectToMain: true,
    headerClass: 'bg-red-50 dark:bg-red-900',
    iconClass: 'bg-red-600 text-white',
    buttonClass: 'bg-red-600 hover:bg-red-700',
    borderClass: 'border-red-300 dark:border-red-700',
  },
  warning: {
    type: 'warning',
    code: 'WARN_400',
    message: 'Se ha detectado una situación que requiere su atención antes de continuar.',
    details: {},
    buttonText: 'Entendido',
    redirectToMain: false,
    headerClass: 'bg-amber-50 dark:bg-amber-900',
    iconClass: 'bg-amber-500 text-white',
    buttonClass: 'bg-amber-500 hover:bg-amber-600',
    borderClass: 'border-amber-300 dark:border-amber-700',
  },
  alert: {
    type: 'alert',
    code: 'ALERT_300',
    message: 'El sistema ha detectado una actividad inusual que debe ser revisada.',
    details: {},
    buttonText: 'Continuar',
    redirectToMain: false,
    headerClass: 'bg-gray-50 dark:bg-gray-800',
    iconClass: 'bg-gray-600 text-white',
    buttonClass: 'bg-gray-600 hover:bg-gray-700',
    borderClass: 'border-gray-300 dark:border-gray-600',
  },
  info: {
    type: 'info',
    code: 'INFO_100',
    message: 'Le informamos sobre una circunstancia importante del sistema.',
    details: {},
    buttonText: 'Aceptar',
    redirectToMain: false,
    headerClass: 'bg-blue-50 dark:bg-blue-900',
    iconClass: 'bg-blue-600 text-white',
    buttonClass: 'bg-blue-600 hover:bg-blue-700',
    borderClass: 'border-blue-300 dark:border-blue-700',
  },
};

/**
 * Manages the error modal component state and configuration.
 *
 * Provides methods to show different types of error/warning/info modals with customizable content.
 * Automatically handles HTTP errors from API responses.
 *
 * @remarks
 * - Uses reactive signals for modal visibility and configuration
 * - Supports 4 severity levels: error, warning, alert, info
 * - Can auto-redirect to home page after dismissal (configurable)
 * - Extracts structured errors from HttpErrorResponse automatically
 *
 * @see {@link ErrorModalConfig}
 * @see {@link ErrorModalComponent}
 */
@Injectable({
  providedIn: 'root',
})
export class ErrorModalService {
  private readonly router = inject(Router);

  private readonly _isVisible = signal(false);
  private readonly _config = signal<ErrorModalConfig>(DEFAULT_CONFIGS.error);

  /**
   * Readonly signal indicating whether the modal is currently visible.
   */
  readonly isVisible = this._isVisible.asReadonly();

  /**
   * Readonly signal containing the current modal configuration.
   */
  readonly config = this._config.asReadonly();

  /**
   * Computed signal for modal title based on error type.
   */
  readonly title = computed(() => {
    const type = this._config().type;
    const titles: Record<ErrorType, string> = {
      error: 'Error Crítico',
      warning: 'Advertencia',
      alert: 'Alerta del Sistema',
      info: 'Información',
    };
    return titles[type];
  });

  /**
   * Shows the error modal with a specific type and custom configuration.
   *
   * @param type - Error severity level
   * @param customConfig - Optional custom configuration to override defaults
   *
   * @remarks
   * Merges the custom configuration with default settings for the specified type.
   * Sets the modal visible after configuring.
   */
  show(type: ErrorType, customConfig?: ErrorModalInput): void {
    const baseConfig = DEFAULT_CONFIGS[type];
    const mergedConfig: ErrorModalConfig = {
      ...baseConfig,
      ...customConfig,
      type,
      details: { ...baseConfig.details, ...(customConfig?.details ?? {}) },
    };
    this._config.set(mergedConfig);
    this._isVisible.set(true);
  }

  /**
   * Hides the error modal.
   *
   * @remarks
   * If the current configuration has `redirectToMain: true`, navigates to the home page.
   */
  hide(): void {
    const shouldRedirect = this._config().redirectToMain;
    this._isVisible.set(false);

    if (shouldRedirect) {
      this.router.navigate(['/']);
    }
  }

  /**
   * Shows an error modal with 'error' severity.
   *
   * @param customConfig - Optional custom configuration
   */
  showError(customConfig?: ErrorModalInput): void {
    this.show('error', customConfig);
  }

  /**
   * Shows a warning modal with 'warning' severity.
   *
   * @param customConfig - Optional custom configuration
   */
  showWarning(customConfig?: ErrorModalInput): void {
    this.show('warning', customConfig);
  }

  /**
   * Shows an alert modal with 'alert' severity.
   *
   * @param customConfig - Optional custom configuration
   */
  showAlert(customConfig?: ErrorModalInput): void {
    this.show('alert', customConfig);
  }

  /**
   * Shows an info modal with 'info' severity.
   *
   * @param customConfig - Optional custom configuration
   */
  showInfo(customConfig?: ErrorModalInput): void {
    this.show('info', customConfig);
  }

  /**
   * Handles HTTP errors from API calls.
   *
   * @param error - The error object (typically HttpErrorResponse)
   * @returns `true` if the modal was shown, `false` if the error wasn't a structured API error
   *
   * @remarks
   * Extracts structured error information from HttpErrorResponse and displays the modal.
   * Works with errors that follow the ApiErrorResponse structure (type, code, message, details).
   *
   * @example
   * ```typescript
   * this.api.getServices().subscribe({
   *   error: (error) => {
   *     if (!this.errorModal.handleHttpError(error)) {
   *       // Handle non-API errors
   *       console.error('Unexpected error:', error);
   *     }
   *   }
   * });
   * ```
   */
  handleHttpError(error: unknown): boolean {
    const apiError = this.extractApiError(error);

    if (apiError) {
      this.show(apiError.type, {
        code: apiError.code,
        message: apiError.message,
        details: apiError.details,
      });
      return true;
    }

    return false;
  }

  private extractApiError(error: unknown): ApiErrorResponse | null {
    // HttpErrorResponse: el body está en error.error
    if (error instanceof HttpErrorResponse && this.isApiError(error.error)) {
      return error.error;
    }

    // Direct error with API structure
    if (this.isApiError(error)) {
      return error;
    }

    return null;
  }

  private isApiError(error: unknown): error is ApiErrorResponse {
    return typeof error === 'object' && error !== null && 'type' in error && typeof (error as { type: unknown }).type === 'string' && ['error', 'warning', 'alert', 'info'].includes((error as { type: string }).type);
  }
}
