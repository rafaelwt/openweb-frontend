import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '@environments/environment';
import { ConsultarContratosRequest, ConsultarDeudasRequest, PagoRequest, ServiciosResponse, ServicioConfigResponse, EstadoServicioResponse, ContratosResponse, DeudasResponse, PagoResponse, NITResponse } from '../models';

/**
 * Core API service for backend communication.
 *
 * Provides methods for:
 * - Service management (listing, configuration, status)
 * - Debt and contract operations (COOPAPPI)
 * - Payment processing (cart, QR generation)
 * - Document verification (NIT)
 *
 * @remarks
 * All endpoints use the base URL from environment configuration.
 * Credentials are automatically injected via CredentialsInterceptor.
 *
 * @see {@link CredentialsInterceptor}
 */
@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  /**
   * Retrieves the list of available services with their categories.
   *
   * @returns Observable with the services response containing servicios and categorias arrays
   *
   * @example
   * ```typescript
   * this.api.getServices().subscribe(response => {
   *   if (response.success) {
   *     console.log(response.data.servicios);
   *   }
   * });
   * ```
   */
  getServices(): Observable<ServiciosResponse> {
    return this.http.get<ServiciosResponse>(`${this.baseUrl}/servicios`);
  }

  /**
   * Fetches the configuration for a specific service by its alias.
   *
   * @param aliasServicio - The service alias identifier (e.g., 'coopappi')
   * @returns Observable with the service configuration including aliasServicio, nombreServicio, etc.
   */
  getServiceConfig(aliasServicio: string): Observable<ServicioConfigResponse> {
    return this.http.get<ServicioConfigResponse>(`${this.baseUrl}/configuracion`, {
      params: { aliasServicio: aliasServicio },
    });
  }

  /**
   * Checks if a service is currently active/available.
   *
   * @param aliasServicio - The service alias to verify
   * @returns Observable with service status response
   */
  checkServiceStatus(aliasServicio: string): Observable<EstadoServicioResponse> {
    return this.http.post<EstadoServicioResponse>(`${this.baseUrl}/verificar/estado`, {
      aliasServicio
    });
  }

  // ============================================================
  // COLLECTION ENDPOINTS (v1)
  // ============================================================

  /**
   * Queries contracts for a collection (debt collection) service.
   *
   * @param params - Request containing codigoDeuda and medioPago
   * @param aliasServicio - Service alias (e.g., 'coopappi', 'sajuba')
   * @returns Observable with contracts response
   *
   * @remarks
   * **API Endpoint:** POST /api/v1/cobranzas/{aliasServicio}/contratos
   *
   * Used in collection-wizard step 1 to find all contracts for an associate.
   */
  consultCollectionContracts(params: ConsultarContratosRequest, aliasServicio: string): Observable<ContratosResponse> {
    return this.http.post<ContratosResponse>(`${this.baseUrl}/cobranzas/${aliasServicio}/contratos`, params);
  }

  /**
   * Retrieves outstanding debts for a collection service contract.
   *
   * @param params - Request containing codigoContrato and checksumContrato
   * @param aliasServicio - Service alias (e.g., 'coopappi', 'sajuba')
   * @returns Observable with debts response containing payment periods and amounts
   *
   * @remarks
   * **API Endpoint:** POST /api/v1/cobranzas/{aliasServicio}/deudas
   *
   * Used in collection-wizard step 3 after contract selection.
   */
  consultCollectionDebts(params: ConsultarDeudasRequest, aliasServicio: string): Observable<DeudasResponse> {
    return this.http.post<DeudasResponse>(`${this.baseUrl}/cobranzas/${aliasServicio}/deudas`, params);
  }

  /**
   * Processes payment for cart items and generates transaction QR code.
   *
   * @param payment - Payment request containing cart items, billing data, and browser fingerprint
   * @returns Observable with payment response including QR code data and transaction details
   *
   * @remarks
   * This endpoint validates cart items, generates invoices, and creates a QR code for payment.
   * The QR code can be scanned by banking apps for instant payment.
   */
  generateQRcode(payment: PagoRequest): Observable<PagoResponse> {
    return this.http.post<PagoResponse>(`${this.baseUrl}/pagos/qr`, payment);
  }

  /**
   * Verifies if a NIT (tax ID number) is valid according to SIN registry.
   *
   * @param documentSIN - The NIT number to verify
   * @returns Observable with verification response containing estadoDocumento field
   *
   * @remarks
   * Special NITs (99001, 99002, 99003) are reserved for "Tax Control" and don't require verification.
   * Used in checkout wizard to validate billing information.
   */
  verifyNIT(documentoSIN: string): Observable<NITResponse> {
    return this.http.post<NITResponse>(`${this.baseUrl}/verificar/nit`, { documentoSIN });
  }
}
