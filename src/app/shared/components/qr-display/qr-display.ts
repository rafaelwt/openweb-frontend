import { ChangeDetectionStrategy, Component, effect, inject, input, signal } from '@angular/core';
import { QrService } from '@core/services';
import { LoadingComponent } from '@shared/components/loading/loading';

/**
 * QR code display component with logo overlay and download functionality.
 *
 * Displays a payment QR code with validity information.
 * Automatically processes the QR code to add bank logos via canvas manipulation.
 *
 * @selector app-qr-display
 *
 * @remarks
 * **Features:**
 * - Receives base64 QR image from API
 * - Processes QR to add bank logos using QrService
 * - Shows loading spinner during processing
 * - Provides download button for processed QR image
 * - Displays validity time and recipient email
 *
 * @see {@link QrService}
 */
@Component({
  selector: 'app-qr-display',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './qr-display.html',
  imports: [LoadingComponent],
})
export class QrDisplayComponent {
  private readonly qrService = inject(QrService);

  /**
   * Base64-encoded QR code image received from the payment API.
   *
   * @required
   */
  readonly qrImage = input.required<string>();

  /**
   * Human-readable validity duration for the QR code.
   *
   * @example "24 hours"
   * @required
   */
  readonly validity = input.required<string>();

  /**
   * Email address where the invoice will be sent.
   *
   * @default ''
   */
  readonly email = input<string>('');

  /**
   * Processed QR image with bank logos overlaid.
   *
   * @internal
   */
  protected readonly processedImage = signal<string>('');

  /**
   * Loading state while processing the QR code.
   *
   * @internal
   */
  protected readonly isProcessing = signal(true);

  constructor() {
    /**
     * Automatically processes QR code when input image changes.
     *
     * @remarks
     * Uses effect() to reactively respond to qrImage signal changes.
     */
    effect(() => {
      const qr = this.qrImage();
      if (qr) {
        this.processQr(qr);
      }
    });
  }

  /**
   * Processes the raw QR code image by adding bank logos.
   *
   * @param qrBase64 - Base64-encoded QR image from API
   *
   * @remarks
   * Delegates to QrService.processQrWithLogos for canvas manipulation.
   * Sets isProcessing signal during processing.
   *
   * @internal
   */
  private async processQr(qrBase64: string): Promise<void> {
    this.isProcessing.set(true);
    try {
      const processed = await this.qrService.processQrWithLogos(qrBase64);
      this.processedImage.set(processed);
    } finally {
      this.isProcessing.set(false);
    }
  }

  /**
   * Triggers download of the processed QR code image.
   *
   * @remarks
   * Downloads as a PNG file with timestamp filename.
   * Only downloads if processing is complete.
   *
   * @internal
   */
  downloadQr(): void {
    const image = this.processedImage();
    if (image) {
      this.qrService.downloadQr(image);
    }
  }
}
