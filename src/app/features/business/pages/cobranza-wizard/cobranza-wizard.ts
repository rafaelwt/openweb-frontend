import { ChangeDetectionStrategy, Component, OnInit, inject, signal, computed } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { of, EMPTY } from 'rxjs';
import { switchMap, tap, catchError, finalize } from 'rxjs/operators';

import Decimal from 'decimal.js-light';

import { ApiService, CartService, ErrorModalService, ConfirmationModalService } from '@core/services';
import { ServicioConfig, Contrato, DatosAsociado, PagoPendiente, ItemCarrito, DatosFacturacion, DeudaSeleccionada } from '@models/index';
import { LoadingComponent } from '@shared/components/loading/loading';
import { ErrorAlertComponent } from '@features/business/components/error-alert/error-alert';
import { WizardProgressComponent } from '@features/business/components/wizard-progress/wizard-progress';
import { WizardNavComponent } from '@features/business/components/wizard-nav/wizard-nav';
import { WizardHeaderComponent } from '@shared/components/wizard-header/wizard-header';
import { SearchAssociateComponent } from '@features/business/components/search-associate/search-associate';
import { ContractSelectorComponent } from '@features/business/components/contract-selector/contract-selector';
import { DebtTableComponent } from '@features/business/components/debt-table/debt-table';

/**
 * Generic multi-step wizard for cobranza (debt collection) services.
 *
 * Handles the following workflow:
 * 1. **Step 1 (BUSQUEDA)**: Search for associate by debt code
 * 2. **Step 2 (SELECCION CONTRATO)**: Select contract if multiple found
 * 3. **Step 3 (SELECCION DEUDAS)**: Select debts to pay with cascading selection logic
 *
 * @remarks
 * **Routing:**
 * - Route: `/servicio/:aliasServicio`
 * - Extracts `aliasServicio` from ActivatedRoute params
 * - Only works for services with `formaOperaciones: "C"`
 * - Redirects to "proximamente" page for R/P services
 *
 * **API Endpoints (v1 cobranzas):**
 * - `/api/v1/cobranzas/{servicio}/contratos`
 * - `/api/v1/cobranzas/{servicio}/deudas`
 *
 * **Key features:**
 * - Auto-advances to step 3 when only one contract is found
 * - Uses reactive forms for step 1 (searchForm)
 * - Uses signals for steps 2-3 state management
 * - Implements cascading debt selection (selecting N auto-selects 0 to N-1)
 * - Integrates with CartService to add selected debts to cart
 * - Uses Decimal.js for precise currency calculations
 *
 * @selector app-cobranza-wizard
 *
 * @see {@link CartService}
 * @see {@link ApiService}
 * @see {@link ItemCarrito}
 */
@Component({
  selector: 'app-cobranza-wizard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './cobranza-wizard.html',
  imports: [LoadingComponent, ErrorAlertComponent, WizardProgressComponent, WizardNavComponent, WizardHeaderComponent, SearchAssociateComponent, ContractSelectorComponent, DebtTableComponent],
})
export class CobranzaWizardComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly cart = inject(CartService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly errorModal = inject(ErrorModalService);
  private readonly confirmModal = inject(ConfirmationModalService);
  private readonly fb = inject(FormBuilder);

  /**
   * Service alias extracted from route params.
   * Used to identify which service to load and for API calls.
   */
  private aliasServicio = '';

  // Service configuration
  protected readonly config = signal<ServicioConfig | null>(null);

  // Wizard status
  protected readonly currentStep = signal(1);
  protected readonly totalSteps = 3;
  protected readonly loading = signal(false);
  protected readonly errors = signal<string[]>([]);

  // Reactive Form - Step 1
  protected readonly searchForm = this.fb.group({
    codigoDeuda: [''],
  });

  // Form Data - Step 2
  protected readonly contracts = signal<Contrato[]>([]);
  protected readonly selectedContract = signal<Contrato | null>(null);

  // Form Data - Step 3
  protected readonly outstandingDebts = signal<PagoPendiente[]>([]);
  protected readonly selectedDebts = signal<boolean[]>([]);
  protected readonly associateData = signal<DatosAsociado | null>(null);

  // Computed
  protected readonly stepLabel = computed(() => {
    switch (this.currentStep()) {
      case 1:
        return 'BUSQUEDA';
      case 2:
        return 'SELECCION CONTRATO';
      case 3:
        return 'SELECCION DEUDAS';
      default:
        return '';
    }
  });

  protected readonly hasOutstandingDebts = computed(() => this.outstandingDebts().length > 0);

  protected readonly totalService = computed(() => {
    const outstandingDebts = this.outstandingDebts();
    const selectedDebts = this.selectedDebts();
    return outstandingDebts
      .filter((_, i) => selectedDebts[i])
      .reduce((sum, p) => sum.plus(p.periodoServicio), new Decimal(0))
      .toDecimalPlaces(2)
      .toNumber();
  });

  protected readonly totalCommission = computed(() => {
    const outstandingDebts = this.outstandingDebts();
    const selectedDebts = this.selectedDebts();
    return outstandingDebts
      .filter((_, i) => selectedDebts[i])
      .reduce((sum, p) => sum.plus(p.periodoComision), new Decimal(0))
      .toDecimalPlaces(2)
      .toNumber();
  });

  protected readonly totalGeneral = computed(() => new Decimal(this.totalService()).plus(this.totalCommission()).toDecimalPlaces(2).toNumber());

  /**
   * Computed quantity of selected debts.
   */
  protected readonly quantitySelectedDebts = computed(() => this.selectedDebts().filter((s) => s).length);

  /**
   * Determines if the user can advance to the next step.
   *
   * @returns `true` if the current step has valid data, `false` otherwise
   *
   * @remarks
   * **Validation by step:**
   * - Step 1: Debt code must not be empty
   * - Step 2: A contract must be selected
   * - Step 3: At least one debt must be selected
   */
  protected canAdvance(): boolean {
    const step = this.currentStep();
    switch (step) {
      case 1:
        return (this.searchForm.get('codigoDeuda')?.value ?? '').trim().length > 0;
      case 2:
        return this.selectedContract() !== null;
      case 3:
        return this.quantitySelectedDebts() > 0;
      default:
        return false;
    }
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const alias = params.get('aliasServicio');
      if (alias) {
        this.aliasServicio = alias;
        this.checkServiceStatusAndLoadConfig();
      } else {
        this.router.navigate(['/']);
      }
    });
  }

  private loadServicioConfig(): void {
    this.loading.set(true);
    this.api.getServiceConfig(this.aliasServicio).subscribe({
      next: (response) => {
        if (response?.success && response.data) {
          const config = response.data;

          // Validate formaOperaciones - only "C" (cobranza) is supported
          if (config.formaOperaciones !== 'C') {
            this.router.navigate(['/servicio', this.aliasServicio, 'proximamente']);
            return;
          }

          this.config.set(config);
        } else {
          this.addError('Servicio no encontrado');
        }
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.handleApiError(error, 'Error al cargar configuración del servicio');
        this.loading.set(false);
      },
    });
  }

  /**
   * Verifies service status and loads configuration if service is active.
   *
   * @remarks
   * **Flow:**
   * 1. Calls `checkServiceStatus()` API to verify service availability
   * 2. If service is inactive or invalid: shows error modal and redirects to home
   * 3. If service is active: proceeds to load service configuration
   * 4. If API call fails: shows error modal and redirects to home
   *
   * **Error handling:**
   * - Invalid response → Treated as inactive service
   * - Network error → Handled via `handleApiError()` and redirects to home
   * - Service inactive → Shows specific modal with service name
   *
   * Uses RxJS chain with `switchMap`, `tap`, `catchError`, and `finalize` operators.
   *
   * @internal
   */
  private checkServiceStatusAndLoadConfig(): void {
    this.loading.set(true);

    this.api
      .checkServiceStatus(this.aliasServicio)
      .pipe(
        switchMap((response) => {
          // 1. Validate response structure
          if (!response?.success || !response.data) {
            // Invalid response - treat as inactive
            this.showInactiveServiceModal(this.aliasServicio);
            return EMPTY;
          }

          // 2. Check service status
          if (!response.data.estadoServicio) {
            // Service is inactive
            this.showInactiveServiceModal(response.data.nombreServicio);
            return EMPTY;
          }

          // 3. Service is active - proceed to load config
          return of(true);
        }),
        tap(() => {
          // Service is active, now load configuration
          this.loadServicioConfig();
        }),
        catchError((error: unknown) => {
          this.handleApiError(error, 'Error al verificar estado del servicio');
          return EMPTY;
        }),
        finalize(() => {
          this.loading.set(false);
        }),
      )
      .subscribe();
  }

  /**
   * Step 1: Queries contracts associated with the entered debt code.
   *
   * @remarks
   * **Flow:**
   * 1. Validates debt code is not empty
   * 2. Calls API to fetch contracts
   * 3. If 1 contract found: auto-selects it and advances to step 3 (loads debts)
   * 4. If multiple contracts found: advances to step 2 (contract selection)
   * 5. If no contracts found: displays error
   *
   * Uses RxJS `switchMap` to conditionally chain debt consultation.
   *
   * @internal
   */
  consultContracts(): void {
    if (this.loading()) return;
    const debtCode = this.searchForm.get('codigoDeuda')?.value ?? '';
    if (!debtCode.trim()) {
      this.addError('Ingrese el código de socio');
      return;
    }

    this.loading.set(true);
    this.clearErrors();

    this.api
      .consultCollectionContracts(
        {
          codigoEncriptado: '',
          medioPago: 'Q',
          codigoDeuda: debtCode,
        },
        this.aliasServicio,
      )
      .pipe(
        switchMap((response) => {
          // 1. Validate response
          if (!response?.success || !response.data?.contratosAsociado?.length) {
            this.addError('No se encontraron contratos');
            return of(null);
          }

          const contracts = response.data.contratosAsociado;
          this.contracts.set(contracts);

          // 2. Branching: 1 contract → step 3, multiple → step 2
          if (contracts.length === 1) {
            this.selectedContract.set(contracts[0]);
            return this.consultDebts$(contracts[0]);
          }

          this.currentStep.set(2);
          return of(null);
        }),
        catchError((error: unknown) => {
          this.handleApiError(error, 'Error al consultar contratos');
          return EMPTY;
        }),
        finalize(() => this.loading.set(false)),
      )
      .subscribe();
  }

  /**
   * Step 2: Sets the selected contract.
   *
   * @param contract - The contract to select
   *
   * @internal
   */
  selectContract(contract: Contrato): void {
    this.selectedContract.set(contract);
  }

  /**
   * Step 2: Confirms the selected contract and advances to step 3.
   *
   * @remarks
   * Loads outstanding debts for the selected contract via API.
   * Advances to step 3 after successful debt retrieval.
   *
   * @internal
   */
  confirmContract(): void {
    const contract = this.selectedContract();
    if (!contract) {
      this.addError('Seleccione un contrato');
      return;
    }

    this.loading.set(true);
    this.clearErrors();

    this.consultDebts$(contract)
      .pipe(
        catchError((error: unknown) => {
          this.handleApiError(error, 'Error al consultar deudas');
          return EMPTY;
        }),
        finalize(() => this.loading.set(false)),
      )
      .subscribe();
  }

  // Observable for checking debts (reusable)
  private consultDebts$(contract: Contrato) {
    return this.api
      .consultCollectionDebts(
        {
          codigoContrato: contract.codigoContrato,
          checksumContrato: contract.checksumContrato,
        },
        this.aliasServicio,
      )
      .pipe(
        tap((response) => {
          if (response?.success && response.data?.pagosPendientes) {
            const outstandingDebts = response.data.pagosPendientes;
            this.outstandingDebts.set(outstandingDebts);
            this.associateData.set(contract.datosAsociado);
            this.selectedDebts.set(outstandingDebts.map(() => true));
            this.currentStep.set(3);
          } else {
            this.outstandingDebts.set([]);
            this.selectedDebts.set([]);
            this.currentStep.set(3);
          }
        }),
      );
  }

  /**
   * Step 3: Toggles debt selection with cascading logic.
   *
   * @param index - Zero-based index of the debt to toggle
   * @param checked - New checked state
   *
   * @remarks
   * **Cascading rules:**
   * - **Selecting debt N:** Auto-selects all previous debts (0 to N-1)
   * - **Deselecting debt N:** Auto-deselects all following debts (N+1 to end)
   *
   * This ensures debts are paid in chronological order without gaps.
   *
   * @example
   * ```typescript
   * // User selects debt at index 3
   * toggleDeuda(3, true);
   * // Result: debts [0,1,2,3] are now selected
   *
   * // User deselects debt at index 2
   * toggleDeuda(2, false);
   * // Result: debts [2,3,4,...] are now deselected, [0,1] remain selected
   * ```
   *
   * @internal
   */
  toggleDeuda(index: number, checked: boolean): void {
    const selectedDebts = [...this.selectedDebts()];

    if (checked) {
      // CASCADE SELECTION: When you select N, auto-select all the previous ones (0 to N-1)
      for (let i = 0; i <= index; i++) {
        selectedDebts[i] = true;
      }
    } else {
      // CASCADE DESELECTION: When you deselect N, automatically deselect all the following ones (N+1 to end)
      for (let i = index; i < selectedDebts.length; i++) {
        selectedDebts[i] = false;
      }
    }

    this.selectedDebts.set(selectedDebts);
  }

  /**
   * Step 3: Toggles selection for all debts.
   *
   * @param checked - `true` to select all, `false` to deselect all
   *
   * @internal
   */
  toggleTodasDeudas(checked: boolean): void {
    const selectedDebts = this.outstandingDebts().map(() => checked);
    this.selectedDebts.set(selectedDebts);
  }

  /**
   * Step 3: Adds selected debts to the shopping cart and navigates to /carrito.
   *
   * @remarks
   * **Process:**
   * 1. Validates at least one debt is selected
   * 2. Checks for duplicate items (same service + contract)
   * 3. If duplicate found:
   *    - Shows confirmation modal with old vs new amounts
   *    - If user cancels, aborts operation
   *    - If user confirms, proceeds to replace
   * 4. Builds DeudaSeleccionada[] from selected debts
   * 5. Creates DatosFacturacion from associate data
   * 6. Builds ItemCarrito with totals calculated via Decimal.js
   * 7. Adds/replaces item in cart via CartService
   * 8. Navigates to /carrito on success
   *
   * **Totals calculation:**
   * - Uses Decimal.js for precision
   * - totalServicio = sum of periodoServicio
   * - totalComision = sum of periodoComision
   * - totalGeneral = totalServicio + totalComision
   *
   * @internal
   */
  async addToCart(): Promise<void> {
    if (this.quantitySelectedDebts() === 0) {
      this.addError('Seleccione al menos una deuda');
      return;
    }

    const selectedContract = this.selectedContract();
    const associateData = this.associateData();
    const cfg = this.config();

    if (!selectedContract || !associateData || !cfg) {
      this.addError('Datos incompletos');
      return;
    }

    // Validate currency
    const currencyValidation = this.cart.canAddItemWithCurrency(cfg.abreviacionMoneda);

    if (!currencyValidation.canAdd) {
      // Show error modal with currency mismatch details
      this.errorModal.showWarning({
        code: 'WARN_CURRENCY',
        message: `El carrito contiene pagos en ${currencyValidation.existingCurrency}. No se pueden mezclar diferentes monedas en una misma transacción.`,
        details: {
          'Moneda del carrito': currencyValidation.existingCurrency ?? '',
          'Moneda del nuevo pago': cfg.abreviacionMoneda,
          Servicio: cfg.nombreServicio,
          Contrato: selectedContract.codigoContrato,
        },
        buttonText: 'Entendido',
        redirectToMain: false,
      });
      return;
    }

    // Check for duplicates
    const duplicateIndex = this.cart.findDuplicateIndex(cfg.aliasServicio, selectedContract.codigoContrato);

    if (duplicateIndex !== -1) {
      // Duplicate found - show confirmation modal
      const existingItem = this.cart.items()[duplicateIndex];

      const confirmed = await this.confirmModal.confirm({
        title: 'Pago duplicado detectado',
        message: `Ya existe un pago pendiente para el contrato "${selectedContract.codigoContrato}" del servicio "${cfg.nombreServicio}". Si continúa, el pago anterior será reemplazado por esta nueva selección.`,
        details: {
          Contrato: selectedContract.codigoContrato,
          Socio: associateData.nombreAsociado,
          'Monto anterior': `${cfg.abreviacionMoneda} ${existingItem.totalGeneral.toFixed(2)}`,
          'Monto nuevo': `${cfg.abreviacionMoneda} ${this.totalGeneral().toFixed(2)}`,
        },
        confirmText: 'Continuar y reemplazar',
        cancelText: 'Cancelar',
      });

      if (!confirmed) {
        // User cancelled - do nothing
        return;
      }

      // User confirmed - will replace below
    }

    // Build selected debts
    const outstandingDebts = this.outstandingDebts();
    const selectedDebts = this.selectedDebts();
    const debtsForCart: DeudaSeleccionada[] = outstandingDebts
      .filter((_, i) => selectedDebts[i])
      .map((p) => ({
        documentoPago: p.documentoPago,
        periodoGestion: p.periodoGestion,
        periodoMes: p.periodoMes,
        periodoCobro: p.periodoCobro,
        periodoServicio: p.periodoServicio,
        periodoComision: p.periodoComision,
        periodoTotal: p.periodoTotal,
        periodoCode: p.periodoCode,
      }));

    // Build billing data
    const billingData: DatosFacturacion = {
      tipoDocumento: associateData.tipoDocumento,
      complementoDocumento: associateData.complementoDocumento,
      numeroDocumento: associateData.numeroDocumento,
      nombreRazonsocial: associateData.nombreRazonsocial,
      correoElectronico: associateData.correoElectronico,
      numeroTelefono: associateData.numeroTelefono,
    };

    // Build cart item
    const itemCart: ItemCarrito = {
      fechaAdicion: Date.now(),
      aliasServicio: cfg.aliasServicio,
      nombreServicio: cfg.nombreServicio,
      abreviacionMoneda: cfg.abreviacionMoneda,
      descripcionDocOficial: cfg.descripcionDocOficial,
      codigoDeuda: this.searchForm.get('codigoDeuda')?.value ?? '',
      codigoContrato: selectedContract.codigoContrato,
      nombreAsociado: associateData.nombreAsociado,
      datosFacturacion: billingData,
      totalServicio: this.totalService(),
      totalComision: this.totalCommission(),
      totalGeneral: this.totalGeneral(),
      deudasSeleccionadas: debtsForCart,
    };

    // Add or replace in cart
    let success = false;
    if (duplicateIndex !== -1) {
      success = this.cart.replaceItem(duplicateIndex, itemCart);
    } else {
      success = this.cart.addItem(itemCart);
    }

    if (success) {
      // Redirect to cart
      this.router.navigate(['/carrito']);
    } else {
      this.addError('Error al agregar al carrito');
    }
  }

  // Navigation
  prevStep(): void {
    if (this.currentStep() > 1) {
      this.clearErrors();
      this.currentStep.update((s) => s - 1);
    }
  }

  goToHome(): void {
    this.router.navigate(['/']);
  }

  // Errores
  private addError(message: string): void {
    this.errors.update((errs) => [...errs, message]);
  }

  private clearErrors(): void {
    this.errors.set([]);
  }

  // API error handling
  private handleApiError(error: unknown, fallbackMessage: string): void {
    if (!this.errorModal.handleHttpError(error)) {
      this.addError(fallbackMessage);
    }
  }

  /**
   * Displays an error modal when a service is inactive or unavailable.
   *
   * @param serviceName - Name of the inactive service
   *
   * @remarks
   * This method shows an error modal with:
   * - Service name and inactive status
   * - Suggested action for the user
   * - Auto-redirect to home page on modal close
   *
   * @internal
   */
  private showInactiveServiceModal(serviceName: string): void {
    this.errorModal.showError({
      code: 'ERR_SERVICE_INACTIVE',
      message: `El servicio "${serviceName}" no se encuentra habilitado en este momento. Por favor inténtelo más tarde.`,
      details: {
        Servicio: serviceName,
        Estado: 'Inactivo',
        'Acción sugerida': 'Aguardar e intentar acceder al servicio más tarde o contactarse con personal de soporte.',
      },
      buttonText: 'Entendido',
      redirectToMain: true,
    });
  }
}
