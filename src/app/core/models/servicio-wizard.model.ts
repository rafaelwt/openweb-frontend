/**
 * Associate personal and billing information.
 *
 * @remarks
 * Returned in ContratosResponse after searching for an associate by debt code.
 */
export interface DatosAsociado {
  /**
   * Associate's debt code used for search.
   */
  codigoDeuda: string;

  /**
   * Internal associate identifier.
   */
  codigoAsociado: string;

  /**
   * Full name of the associate.
   */
  nombreAsociado: string;

  /**
   * Document type code (CI or NIT).
   *
   * @see {@link DatosFacturacion.tipoDocumento}
   */
  tipoDocumento: number;

  /**
   * Document number.
   */
  numeroDocumento: string;

  /**
   * Document complement (optional extension for CI).
   */
  complementoDocumento: string;

  /**
   * Business name or full name for invoice.
   */
  nombreRazonsocial: string;

  /**
   * Email address for correspondence.
   */
  correoElectronico: string;

  /**
   * Phone number for contact.
   */
  numeroTelefono: string;
}

/**
 * Represents a contract associated with an associate.
 *
 * @remarks
 * Used in COOPAPPI wizard step 2 for contract selection.
 */
export interface Contrato {
  /**
   * Unique contract identifier.
   */
  codigoContrato: string;

  /**
   * Checksum for contract validation.
   *
   * @remarks
   * Required when consulting debts for this contract.
   */
  checksumContrato: string;

  /**
   * Associate information for this contract.
   */
  datosAsociado: DatosAsociado;
}

/**
 * API response for contract consultation.
 *
 * @remarks
 * Returned by ApiService.consultContracts() in COOPAPPI wizard step 1.
 */
export interface ContratosResponse {
  /**
   * Indicates if the request was successful.
   */
  success: boolean;

  /**
   * Response data.
   */
  data: {
    /**
     * Service information.
     */
    datosServicio: {
      /**
       * Service alias.
       */
      aliasServicio: string;

      /**
       * Service name.
       */
      nombreServicio: string;
    };

    /**
     * Array of contracts found for the associate.
     *
     * @remarks
     * If only one contract is found, the wizard auto-advances to step 3.
     */
    contratosAsociado: Contrato[];
  };
}

/**
 * Represents a pending payment period.
 *
 * @remarks
 * Used in COOPAPPI wizard step 3 for debt selection.
 * Similar to DeudaSeleccionada but from API perspective.
 */
export interface PagoPendiente {
  /**
   * Payment document identifier (invoice number).
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
   * Service amount for this period (in Bolivianos).
   */
  periodoServicio: number;

  /**
   * Commission amount for this period (in Bolivianos).
   */
  periodoComision: number;

  /**
   * Total amount (service + commission).
   */
  periodoTotal: number;

  /**
   * Unique code identifying this debt period.
   */
  periodoCode: string;
}

/**
 * API response for debt consultation.
 *
 * @remarks
 * Returned by ApiService.consultDebts() in COOPAPPI wizard step 3.
 */
export interface DeudasResponse {
  /**
   * Indicates if the request was successful.
   */
  success: boolean;

  /**
   * Response data.
   */
  data: {
    /**
     * Service information.
     */
    datosServicio: {
      /**
       * Service alias.
       */
      aliasServicio: string;

      /**
       * Service name.
       */
      nombreServicio: string;
    };

    /**
     * Array of pending payment periods for the selected contract.
     */
    pagosPendientes: PagoPendiente[];
  };
}

/**
 * Service configuration including endpoints and wizard settings.
 *
 * @remarks
 * Fetched by alias in ApiService.getServiceConfig()
 * Determines wizard behavior and available operations.
 */
export interface ServicioConfig {
  /**
   * Short alias for the service.
   */
  aliasServicio: string;

  /**
   * Service name.
   */
  nombreServicio: string;

  /**
   * Currency abbreviation.
   *
   * @example "Bs."
   */
  abreviacionMoneda: string;

  /**
   * Description of the official document required.
   *
   * @example "Factura"
   */
  descripcionDocOficial: string;

  /**
   * Type of operations supported by this service.
   *
   * @remarks
   * - "C" = Cobranza (debt collection) - supported by cobranza-wizard
   * - "R" = Recarga (recharge) - coming soon
   * - "P" = Pago (payment) - coming soon
   *
   * @example "C"
   */
  formaOperaciones: string;
}

/**
 * API response for service configuration.
 */
export interface ServicioConfigResponse {
  /**
   * Indicates if the request was successful.
   */
  success: boolean;

  /**
   * Service configuration data.
   */
  data: ServicioConfig;
}

/**
 * Request structure for consulting contracts.
 *
 * @remarks
 * Used in ApiService.consultContracts()
 */
export interface ConsultarContratosRequest {
  /**
   * Encrypted service code.
   */
  codigoEncriptado: string;

  /**
   * Payment method.
   *
   * @example "QR"
   */
  medioPago: string;

  /**
   * Associate's debt code.
   */
  codigoDeuda: string;
}

/**
 * Request structure for consulting debts.
 *
 * @remarks
 * Used in ApiService.consultDebts()
 */
export interface ConsultarDeudasRequest {
  /**
   * Contract code to query debts for.
   */
  codigoContrato: string;

  /**
   * Checksum for contract validation.
   */
  checksumContrato: string;
}

/**
 * API response for service status check.
 *
 * @remarks
 * Used to verify if a service is active before allowing transactions.
 */
export interface EstadoServicioResponse {
  /**
   * Indicates if the request was successful.
   */
  success: boolean;

  /**
   * Service status data.
   */
  data: {
    /**
     * Service alias.
     */
    aliasServicio: string;

    /**
     * Service name.
     */
    nombreServicio: string;

    /**
     * Whether the service is currently active.
     */
    estadoServicio: boolean;
  };
}
