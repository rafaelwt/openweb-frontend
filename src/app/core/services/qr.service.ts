import { Injectable } from '@angular/core';

/**
 * Processes and enhances QR codes with branding logos.
 *
 * Provides methods to:
 * - Add branded headers and logos to QR codes
 * - Download QR code images
 *
 * @remarks
 * Uses HTML Canvas API to composite QR codes with logos.
 */
@Injectable({
  providedIn: 'root',
})
export class QrService {
  /**
   * Processes a base64 QR code by adding branded logos and header.
   *
   * @param qrBase64 - Base64-encoded QR code string (without data URI prefix)
   * @returns Promise resolving to complete data URI of the enhanced QR image
   *
   * @remarks
   * **Processing steps:**
   * 1. Loads QR image and logo images (Redis + OpenWeb)
   * 2. Creates canvas with fixed dimensions (365x425)
   * 3. Draws QR code centered with size adjustments
   * 4. Draws blue header bar (#3b80f9)
   * 5. Overlays Redis logo (left) and OpenWeb logo (right)
   * 6. Returns canvas as PNG data URI
   *
   * **Image sources:**
   * - QR code: from parameter
   * - Redis logo: `/img/logo-redis.png`
   * - OpenWeb logo: `/img/logo-openweb.png`
   *
   * @example
   * ```typescript
   * const qrBase64 = 'iVBORw0KGgoAAAANSUhEUgAA...';
   * const enhancedQr = await qrService.processQrWithLogos(qrBase64);
   * console.log(enhancedQr); // "data:image/png;base64,..."
   * ```
   */
  async processQrWithLogos(qrBase64: string): Promise<string> {
    const dataBase64 = 'data:image/png;base64,' + qrBase64;

    const imgQR = new Image();
    imgQR.src = dataBase64;

    const imgLogo = new Image();
    imgLogo.src = '/img/logo-redis.png';

    const imgPlatform = new Image();
    imgPlatform.src = '/img/logo-openweb.png';

    await Promise.all([this.loadImage(imgQR), this.loadImage(imgLogo), this.loadImage(imgPlatform)]);

    // Dimensions and offsets according to QR code size
    const imgWidth = imgQR.width < 300 ? 415 : 350;
    const imgHeight = imgQR.width < 300 ? 410 : 350;
    const offsetX = imgQR.width < 300 ? -25 : 7;
    const offsetY = imgQR.width < 300 ? 20 : 50;

    // Create canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    canvas.width = 365;
    canvas.height = 425;

    // Draw QR
    ctx.drawImage(imgQR, offsetX, offsetY, imgWidth, imgHeight);

    // Draw blue header
    ctx.fillStyle = '#3b80f9';
    ctx.fillRect(0, 0, 365, 45);

    // Drawing logos
    ctx.drawImage(imgLogo, 5, 5, 164, 37);
    ctx.drawImage(imgPlatform, 325, 5, 35, 35);

    // Convert to base64
    return canvas.toDataURL('image/png');
  }

  /**
   * Triggers download of a QR code image.
   *
   * @param imageBase64 - Complete data URI of the image (e.g., "data:image/png;base64,...")
   * @param filename - Optional custom filename (default: "QR-OPENWEB-{timestamp}.png")
   *
   * @remarks
   * Creates a temporary anchor element and triggers a download.
   * Works in all modern browsers.
   *
   * @example
   * ```typescript
   * const qrDataUri = await qrService.processQrWithLogos(qrBase64);
   * qrService.downloadQr(qrDataUri, 'my-payment-qr.png');
   * ```
   */
  downloadQr(imageBase64: string, filename?: string): void {
    const link = document.createElement('a');
    link.href = imageBase64;
    link.download = filename || `QR-OPENWEB-${Date.now()}.png`;
    link.click();
  }

  private loadImage(img: HTMLImageElement): Promise<void> {
    return new Promise((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = reject;
    });
  }
}
