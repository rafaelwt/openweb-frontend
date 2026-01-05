/**
 * Billing information for invoice generation.
 *
 * @remarks
 * Used in ItemCarrito and payment requests.
 * Required when generating invoices with commissions.
 */
export interface DatosFacturacion {
  /**
   * Document type code.
   *
   * @remarks
   * Common values:
   * - 1: CI (Carnet de Identidad)
   * - 2: CEX (Carnet de Extranjero)
   * - 3: PSP (Pasaporte)
   * - 4: ODI (Otro Documento de Identificación)
   * - 5: NIT (Número de Identificación Tributaria)
   *
   * @example 5
   */
  tipoDocumento: number;

  /**
   * Document complement (optional extension for CI).
   *
   * @example "1A"
   */
  complementoDocumento: string;

  /**
   * Document number (CI or NIT).
   *
   * @example "1234567"
   */
  numeroDocumento: string;

  /**
   * Business name or full name for the invoice.
   *
   * @example "EMPRESA EJEMPLO S.R.L."
   */
  nombreRazonsocial: string;

  /**
   * Email address for invoice delivery.
   *
   * @example "cliente@example.com"
   */
  correoElectronico: string;

  /**
   * Phone number for contact.
   *
   * @example "71234567"
   */
  numeroTelefono: string;
}

/**
 * Represents a selected debt period for payment.
 *
 * @remarks
 * Used in service to represent monthly debt installments.
 */
export interface DeudaSeleccionada {
  /**
   * Payment document identifier (e.g., invoice number).
   */
  documentoPago: string;

  /**
   * Year of the debt period.
   *
   * @example 2024
   */
  periodoGestion: number;

  /**
   * Month of the debt period (1-12).
   *
   * @example 3
   */
  periodoMes: number;

  /**
   * Human-readable period description.
   *
   * @example "Marzo 2024"
   */
  periodoCobro: string;

  /**
   * Service amount to pay for this period (in Bolivianos).
   *
   * @example 150.00
   */
  periodoServicio: number;

  /**
   * Commission amount for this period (in Bolivianos).
   *
   * @example 3.00
   */
  periodoComision: number;

  /**
   * Total amount (service + commission).
   *
   * @example 153.00
   */
  periodoTotal: number;

  /**
   * Unique code identifying this debt period.
   */
  periodoCode: string;
}

/**
 * Shopping cart item containing service payment information.
 *
 * @remarks
 * One item can include multiple debt periods for the same contract.
 * Totals are calculated using Decimal.js for precision.
 */
export interface ItemCarrito {
  /**
   * Timestamp when the item was added to the cart (Date.now()).
   */
  fechaAdicion: number;

  /**
   * Service alias identifier.
   *
   * @see {@link Servicio.aliasServicio}
   */
  aliasServicio: string;

  /**
   * Service name for display.
   */
  nombreServicio: string;

  /**
   * Currency abbreviation for all amounts in this item.
   *
   * @remarks
   * Ensures all items in cart use the same currency.
   * Prevents mixing different currencies in a single transaction.
   *
   * @example "Bs."
   */
  abreviacionMoneda: string;

  /**
   * Description of the official document for this service.
   *
   * @remarks
   * Each service can have its own document type.
   *
   * @example "Código de Deuda", "Número de Factura"
   */
  descripcionDocOficial: string;

  /**
   * Associate's debt code used for search.
   */
  codigoDeuda: string;

  /**
   * Contract code selected for payment.
   */
  codigoContrato: string;

  /**
   * Full name of the associate.
   */
  nombreAsociado: string;

  /**
   * Billing information for invoice generation.
   */
  datosFacturacion: DatosFacturacion;

  /**
   * Total service amount for all selected debt periods (in Bolivianos).
   *
   * @remarks
   * Calculated using Decimal.js for precision.
   */
  totalServicio: number;

  /**
   * Total commission amount for all selected debt periods (in Bolivianos).
   *
   * @remarks
   * Calculated using Decimal.js for precision.
   */
  totalComision: number;

  /**
   * Grand total (totalServicio + totalComision) in Bolivianos.
   *
   * @remarks
   * Calculated using Decimal.js for precision.
   */
  totalGeneral: number;

  /**
   * Array of selected debt periods to pay.
   */
  deudasSeleccionadas: DeudaSeleccionada[];
}

/**
 * Shopping cart structure with session management.
 *
 * @remarks
 * - Persisted in sessionStorage with the key 'redis_cart_items'
 * - Session ID validation prevents data leakage between different sessions
 * - Managed by CartService
 *
 * @see {@link CartService}
 */
export interface Carrito {
  /**
   * Unique session identifier.
   *
   * @remarks
   * Format: `${Date.now()}-${randomString}`
   *
   * @example "1704067200000-x7k3m9p2q"
   */
  sessionId: string;

  /**
   * Array of cart items.
   */
  items: ItemCarrito[];

  /**
   * Timestamp when the cart was created (Date.now()).
   */
  createdAt: number;

  /**
   * Timestamp when the cart was last modified (Date.now()).
   */
  updatedAt: number;
}
