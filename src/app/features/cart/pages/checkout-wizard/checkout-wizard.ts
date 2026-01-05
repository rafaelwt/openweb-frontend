import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { from, EMPTY } from 'rxjs';
import { switchMap, tap, catchError, finalize } from 'rxjs/operators';
import { ApiService, CartService, FingerprintService, ErrorModalService } from '@core/services';

import Decimal from 'decimal.js-light';

import { ItemCarrito } from '@models/index';
import { WizardHeaderComponent } from '@shared/components/wizard-header/wizard-header';
import { LoadingComponent } from '@shared/components/loading/loading';
import { QrDisplayComponent } from '@shared/components/qr-display/qr-display';

/**
 * QR code data for payment display.
 *
 * @internal
 */
interface QRData {
  validity: string;
  qrImage: string;
}

/**
 * Multi-step checkout wizard for payment processing.
 *
 * Handles the following workflow:
 * 1. **Step 1**: Cart review (view items, remove items, add more)
 * 2. **Step 2**: Payment method selection (QR Simple / QR con Comisión)
 * 3. **Step 3**: Billing information form (NIT validation, email, phone)
 * 4. **Step 4**: Payment processing (generate QR code via API)
 * 5. **Step 5**: QR code display (download, restart)
 *
 * @remarks
 * **Key features:**
 * - Integrates with CartService for cart state
 * - Uses FingerprintService for browser identification (fraud prevention)
 * - Validates NIT via API (special NITs: 99001, 99002, 99003)
 * - Generates QR codes for bank app payment
 * - Uses Decimal.js for precise currency calculations
 * - Handles API errors via ErrorModalService
 *
 * **Payment methods:**
 * - **QR Simple**: No commission, no billing required (uses default "Control Tributario")
 * - **QR con Comisión**: Includes commission, requires valid NIT and billing data
 *
 * @selector app-checkout-wizard
 *
 * @see {@link CartService}
 * @see {@link FingerprintService}
 * @see {@link ApiService}
 */
@Component({
  selector: 'app-checkout-wizard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './checkout-wizard.html',
  imports: [ReactiveFormsModule, LoadingComponent, QrDisplayComponent, NgOptimizedImage, WizardHeaderComponent],
})
export class CheckoutWizardComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly cart = inject(CartService);
  private readonly fingerprint = inject(FingerprintService);
  private readonly router = inject(Router);
  private readonly errorModal = inject(ErrorModalService);
  private readonly fb = inject(FormBuilder);

  // Configuration
  protected readonly processCardPayments = true;
  protected readonly totalSteps = 5;

  // Wizard status
  protected readonly currentStep = signal(1);
  protected readonly loading = signal(false);
  protected readonly errors = signal<string[]>([]);

  // UI State
  protected readonly showCloseTooltip = signal(false);
  protected readonly showDeleteTooltip = signal<number | null>(null);
  protected readonly showExceptionNIT = signal(false);

  // Items in cart
  protected readonly itemsCart = signal<ItemCarrito[]>([]);

  /**
   * Computed signal with the currency abbreviation from the cart.
   *
   * @returns Currency abbreviation (e.g., "Bs.", "USD"), defaults to "Bs." if cart is empty
   *
   * @remarks
   * Uses CartService.cartCurrency() to get the currency from the first cart item.
   * All items in cart are guaranteed to have the same currency due to validation.
   */
  protected readonly currencySymbol = computed(() => {
    return this.cart.cartCurrency() ?? 'Bs.';
  });

  /**
   * Gets the plural form of officialDocDescription from the first cart item.
   * Defaults to "facturas" if no items in cart.
   * Simple pluralization by adding "s" to the end.
   *
   * @returns Plural form of document description (e.g., "códigos de deudas", "números de facturas")
   */
  protected getOfficialDocDescriptionPlural(): string {
    const firstItem = this.itemsCart()[0];
    if (!firstItem?.descripcionDocOficial) {
      return 'facturas';
    }
    // Simple pluralization: add "s" at the end
    return firstItem.descripcionDocOficial.toLowerCase() + 's';
  }

  // Reactive Form
  protected readonly form: FormGroup = this.fb.group({
    medioPago: [''],
    sinNombre: ['SI'],
    razonSocial: ['CONTROL TRIBUTARIO'],
    tipoDocumento: [5],
    documentoSIN: ['99002'],
    complementoSIN: [''],
    excepcionNIT: ['false'],
    correoElectronico: ['', [Validators.required, Validators.email]],
    numeroTelefono: [''],
  });

  // Getters for form values
  protected get medioPago(): string {
    return this.form.get('medioPago')?.value ?? '';
  }

  protected get sinNombre(): string {
    return this.form.get('sinNombre')?.value ?? 'SI';
  }

  protected get tipoDocumento(): number {
    return this.form.get('tipoDocumento')?.value ?? 5;
  }

  protected get razonSocial(): string {
    return this.form.get('razonSocial')?.value ?? '';
  }

  protected get documentoSIN(): string {
    return this.form.get('documentoSIN')?.value ?? '';
  }

  protected get complementoSIN(): string {
    return this.form.get('complementoSIN')?.value ?? '';
  }

  protected get excepcionNIT(): string {
    return this.form.get('excepcionNIT')?.value ?? 'false';
  }

  protected get correoElectronico(): string {
    return this.form.get('correoElectronico')?.value ?? '';
  }

  protected get numeroTelefono(): string {
    return this.form.get('numeroTelefono')?.value ?? '';
  }

  // QR Data
  protected readonly qrData = signal<QRData>({
    validity: '',
    qrImage: '',
  });

  // Computed
  protected readonly progress = computed(() => ((this.currentStep() - 1) / (this.totalSteps - 1)) * 100);

  protected stepLabel(): string {
    const medioPago = this.form.get('medioPago')?.value;
    let label = '';

    switch (this.currentStep()) {
      case 1:
        label = 'CARRITO DE COMPRAS';
        break;
      case 2:
        label = 'METODO DE PAGO';
        break;
      case 3:
        label = 'INFORMACION';
        break;
      case 4:
        label = 'RESUMEN FINAL';
        break;
      case 5:
        label = 'PAGO';
        break;
      default:
        label = 'PROCESANDO';
    }

    if (medioPago === 'Q') {
      return `${label} - QR`;
    } else if (medioPago === 'T') {
      return `${label} - Tarjeta`;
    }
    return label;
  }

  protected readonly hasItems = computed(() => this.itemsCart().length > 0);

  protected readonly totalServices = computed(() =>
    this.itemsCart()
      .reduce((sum, item) => sum.plus(item.totalServicio), new Decimal(0))
      .toDecimalPlaces(2)
      .toNumber(),
  );

  protected readonly totalCommissions = computed(() =>
    this.itemsCart()
      .reduce((sum, item) => sum.plus(item.totalComision), new Decimal(0))
      .toDecimalPlaces(2)
      .toNumber(),
  );

  protected readonly totalGeneral = computed(() => new Decimal(this.totalServices()).plus(this.totalCommissions()).toDecimalPlaces(2).toNumber());

  protected readonly hasCommissions = computed(() => this.totalCommissions() > 0);

  protected readonly quantitySelectedDebts = computed(() => this.itemsCart().reduce((sum, item) => sum + item.deudasSeleccionadas.length, 0));

  protected canAdvance(): boolean {
    const step = this.currentStep();

    switch (step) {
      case 1:
        return this.hasItems();
      case 2:
        return this.form.get('medioPago')?.value !== '';
      case 3:
        return this.form.get('correoElectronico')?.value?.trim() !== '';
      case 4:
        return true;
      default:
        return false;
    }
  }

  ngOnInit(): void {
    this.loadCart();
  }

  private loadCart(): void {
    const items = this.cart.items();
    this.itemsCart.set([...items]);

    // Pre-fill email from first item if available
    if (items.length > 0 && items[0].datosFacturacion?.correoElectronico) {
      this.form.patchValue({ correoElectronico: items[0].datosFacturacion.correoElectronico });
    }
  }

  // Remove item from cart
  removeItem(index: number): void {
    const items = this.itemsCart();
    if (index < 0 || index >= items.length) return;

    this.cart.removeItem(index);
    this.itemsCart.set([...this.cart.items()]);
  }

  // Add more services
  addMoreServices(): void {
    this.router.navigate(['/']);
  }

  // Navigation - Continue payment from Step 1
  handleProcessPaymentClick(): void {
    if (this.processCardPayments) {
      this.nextStep();
    } else {
      this.form.patchValue({ medioPago: 'Q' });
      this.nextStep();
    }
  }

  // Navigation - Next step
  handleNextStep(): void {
    // Validate current step
    const isValid = this.validateCurrentStep();
    if (!isValid) return;

    // If we are in step 3 and there are commissions, validate NIT
    if (this.currentStep() === 3 && this.hasCommissions() && this.form.get('tipoDocumento')?.value === 5) {
      this.validateNIT();
      return; // validateNIT will call nextStep() if valid
    }

    this.nextStep();
  }

  private nextStep(): void {
    this.clearErrors();
    if (this.currentStep() < this.totalSteps) {
      this.currentStep.update((s) => s + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  prevStep(): void {
    // Do not allow back navigation from step 5 (QR code generated)
    if (this.currentStep() === 5) return;

    this.clearErrors();
    if (this.currentStep() > 1) {
      this.currentStep.update((s) => s - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  // Validations
  private validateCurrentStep(): boolean {
    this.clearErrors();

    switch (this.currentStep()) {
      case 1:
        if (!this.hasItems()) {
          this.addError('El carrito esta vacio');
          return false;
        }
        return true;

      case 2:
        if (!this.form.get('medioPago')?.value) {
          this.addError('Debe seleccionar un metodo de pago');
          return false;
        }
        return true;

      case 3:
        return this.validateBillingShipping();

      case 4:
        return true;

      default:
        return true;
    }
  }

  private validateBillingShipping(): boolean {
    const email = this.form.get('correoElectronico')?.value || '';
    const companyName = this.form.get('razonSocial')?.value || '';
    const documentSIN = this.form.get('documentoSIN')?.value || '';

    // Validate email address
    if (!email.trim()) {
      this.addError('El correo electronico es obligatorio');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      this.addError('El correo electronico no tiene un formato valido');
      return false;
    }

    // If there are fees, validate billing information.
    if (this.hasCommissions()) {
      if (!companyName.trim()) {
        this.addError('La Razon Social es obligatoria');
        return false;
      }

      if (!documentSIN.trim()) {
        this.addError('El numero de documento es obligatorio');
        return false;
      }
    }

    return true;
  }

  private validateNIT(): void {
    const documentType = this.form.get('tipoDocumento')?.value;
    const documentSIN = this.form.get('documentoSIN')?.value || '';
    const exceptionNIT = this.form.get('excepcionNIT')?.value;

    // Skip if it's not a NIT - continue to the next step
    if (documentType !== 5) {
      this.nextStep();
      return;
    }

    // Allow special NITs (Tax Control)
    if (['99001', '99002', '99003'].includes(documentSIN)) {
      this.nextStep();
      return;
    }

    // If I already accept the exception
    if (exceptionNIT === 'true') {
      this.nextStep();
      return;
    }

    this.loading.set(true);

    this.api.verifyNIT(documentSIN).subscribe({
      next: (response) => {
        if (response?.success && response.data?.estadoDocumento === 'true') {
          this.loading.set(false);
          this.nextStep();
        } else {
          this.showExceptionNIT.set(true);
          this.addError('NIT invalido. Confirme si se realiza Excepcion de registro con ese NIT');
          this.loading.set(false);
          // If I already accepted the exception after the error, allow it to continue.
          if (this.form.get('excepcionNIT')?.value === 'true') {
            this.nextStep();
          }
        }
      },
      error: (error: unknown) => {
        this.handleApiError(error, 'Error al validar NIT');
        this.loading.set(false);
      },
    });
  }

  // Change unnamed mode
  changeBillingDataMode(unNamed: boolean): void {
    if (unNamed) {
      this.form.patchValue({
        sinNombre: 'SI',
        razonSocial: 'CONTROL TRIBUTARIO',
        tipoDocumento: 5,
        documentoSIN: '99002',
        complementoSIN: '',
        excepcionNIT: 'false',
      });
      this.showExceptionNIT.set(false);
    } else {
      this.form.patchValue({
        sinNombre: 'NO',
        razonSocial: '',
        documentoSIN: '',
        complementoSIN: '',
      });
    }
  }

  // Process payment
  processPayment(): void {
    if (this.loading()) return;

    const formValue = this.form.getRawValue();

    // Final validations
    if (!formValue.correoElectronico?.trim()) {
      this.addError('Debe ingresar un correo electronico');
      return;
    }

    if (formValue.medioPago !== 'Q') {
      this.addError('Metodo de pago no implementado');
      return;
    }

    this.loading.set(true);

    // Chain of Observables without nesting
    from(this.fingerprint.generate())
      .pipe(
        switchMap((browserFingerprint) => {
          const paymentData = {
            medioPago: formValue.medioPago,
            itemsCarrito: this.itemsCart(),
            totalServicios: this.totalServices(),
            totalComisiones: this.totalCommissions(),
            totalGeneral: this.totalGeneral(),
            tipoDocumento: formValue.tipoDocumento,
            documentoSIN: formValue.documentoSIN,
            complementoSIN: formValue.complementoSIN,
            excepcionNIT: formValue.excepcionNIT === 'true' ? '1' : '0',
            razonSocial: formValue.razonSocial,
            correoElectronico: formValue.correoElectronico,
            numeroTelefono: formValue.numeroTelefono || '0',
            browserFingerprint,
          };
          return this.api.generateQRcode(paymentData);
        }),
        tap((response) => {
          if (response?.success && response.data) {
            this.qrData.set({
              validity: response.data.validity,
              qrImage: response.data.qrImage,
            });
            this.cart.clearCart();
            this.currentStep.set(5);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } else {
            this.addError('Error al procesar el pago');
          }
        }),
        catchError((error: unknown) => {
          this.handleApiError(error, 'Error al procesar el pago. Intente nuevamente.');
          return EMPTY;
        }),
        finalize(() => this.loading.set(false)),
      )
      .subscribe();
  }

  // Exit cart
  exitCart(): void {
    this.router.navigate(['/']);
  }

  // Go to home
  goToHome(): void {
    this.router.navigate(['/']);
  }

  // Helpers
  private addError(message: string): void {
    this.errors.update((errs) => [...errs, message]);
  }

  private clearErrors(): void {
    this.errors.set([]);
  }

  formatNumber(value: number, decimals: number = 2): string {
    return value.toLocaleString('es-BO', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }

  // Template helper for payment method selection (click handler)
  setPaymentMethod(value: string): void {
    this.form.patchValue({ medioPago: value });
  }

  // Template helper for NIT exception (radio button change)
  setExceptionNIT(value: string): void {
    this.form.patchValue({ excepcionNIT: value });
  }

  // API error handling
  private handleApiError(error: unknown, fallbackMessage: string): void {
    if (!this.errorModal.handleHttpError(error)) {
      this.addError(fallbackMessage);
    }
  }
}
