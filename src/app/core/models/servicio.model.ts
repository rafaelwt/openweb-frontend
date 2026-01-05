/**
 * Represents a service available in the system.
 *
 * @remarks
 * Services are categorized and can be enabled/disabled.
 * The alias is used for routing and API configuration retrieval.
 */
export interface Servicio {
  /**
   * Unique string identifier for the service.
   *
   * @example "coopappi"
   */
  aliasServicio: string;

  /**
   * Display name of the service.
   *
   * @example "Pago de Aportes - COOPAPPI"
   */
  nombreServicio: string;

  /**
   * Relative path to the service icon image.
   *
   * @remarks
   * Icons are stored in `/img/servicio/` directory.
   * API returns paths like `/public/img/servicio/srv001.png` which must be transformed to `/img/servicio/srv001.png`.
   *
   * @example "/img/servicio/srv001.png"
   */
  iconoServicio: string;

  /**
   * Category code to which this service belongs.
   *
   * @see {@link Categoria}
   */
  categoriaServicio: number;
  /**
   * Description of how the service operates.
   * @example "C = COBRANZA , P = PAGO, R = RECARGA"
   */

  formaOperaciones: string;

  /**
   * Indicates whether the service is currently active/enabled.
   */
  estadoServicio: boolean;
}

/**
 * Represents a service category.
 */
export interface Categoria {
  /**
   * Unique numeric identifier for the category.
   */
  codigoCategoria: number;

  /**
   * Display name of the category.
   *
   * @example "Cooperativas"
   */
  nombreCategoria: string;
}

/**
 * API response structure for the GET /services endpoint.
 */
export interface ServiciosResponse {
  /**
   * Indicates if the request was successful.
   */
  success: boolean;

  /**
   * Response data containing services and categories.
   */
  data: {
    /**
     * Array of available services.
     */
    servicios: Servicio[];

    /**
     * Array of service categories.
     */
    categorias: Categoria[];
  };
}
