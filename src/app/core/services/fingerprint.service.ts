import { Injectable, signal } from '@angular/core';

/**
 * Cached fingerprint data structure.
 *
 * @internal
 */
interface FingerprintCache {
  fingerprint: string;
  timestamp: number;
}

/**
 * Screen information for fingerprinting.
 *
 * @internal
 */
interface ScreenInfo {
  width: number;
  height: number;
  availWidth: number;
  availHeight: number;
  pixelRatio: number;
  colorDepth: number;
}

/**
 * Components collected for browser fingerprinting.
 *
 * @internal
 */
interface FingerprintComponents {
  screen: ScreenInfo;
  timezone: string;
  language: string;
  platform: string;
  hardwareConcurrency: number;
  deviceMemory: number;
  webgl: string;
  canvas: string;
  fonts: string;
  userAgent: string;
}

/**
 * Generates unique browser fingerprints for fraud prevention.
 *
 * Collects browser and device characteristics to create a SHA-256 hash fingerprint.
 * Used in payment requests to identify devices without cookies.
 *
 * @remarks
 * - Fingerprints are cached in sessionStorage for 5 minutes
 * - Uses multiple techniques: Canvas, WebGL, fonts, screen info, timezone, etc.
 * - Normalizes user agent to reduce fingerprint volatility
 * - Returns empty string on any error (graceful degradation)
 *
 * @see {@link PagoRequest.browserFingerprint}
 */
@Injectable({
  providedIn: 'root',
})
export class FingerprintService {
  private readonly CACHE_KEY = 'browser_fingerprint_cache';
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  private readonly fingerprint = signal<string>('');

  /**
   * Readonly signal containing the most recently generated fingerprint.
   */
  readonly currentFingerprint = this.fingerprint.asReadonly();

  /**
   * Generates a unique browser fingerprint.
   *
   * @returns Promise resolving to SHA-256 hash fingerprint (64 hex characters) or empty string on error
   *
   * @remarks
   * **Flow:**
   * 1. Checks sessionStorage cache (5 min TTL)
   * 2. If not cached, collects device/browser components
   * 3. Generates SHA-256 hash of components
   * 4. Caches result in sessionStorage
   * 5. Updates the currentFingerprint signal
   *
   * **Components collected:**
   * - Screen dimensions, pixel ratio, color depth
   * - Timezone, language, platform
   * - Hardware concurrency, device memory
   * - WebGL renderer info
   * - Canvas fingerprint
   * - Available fonts
   * - Normalized user agent
   *
   * @example
   * ```typescript
   * const fingerprint = await this.fingerprintService.generate();
   * console.log(fingerprint); // "a3f5e8d9c2b1..."
   * ```
   */
  async generate(): Promise<string> {
    try {
      // 1. Check cache first
      const cached = this.getCached();
      if (cached) {
        this.fingerprint.set(cached);
        return cached;
      }

      // 2. Collect components
      const components = await this.collectComponents();

      // 3. Generate SHA-256 hash
      const fp = await this.hashComponents(components);

      // 4. Cache result
      if (fp) {
        this.setCached(fp);
        this.fingerprint.set(fp);
      }

      return fp;
    } catch {
      return '';
    }
  }

  private async collectComponents(): Promise<FingerprintComponents> {
    return {
      screen: {
        width: screen.width,
        height: screen.height,
        availWidth: screen.availWidth,
        availHeight: screen.availHeight,
        pixelRatio: window.devicePixelRatio,
        colorDepth: screen.colorDepth,
      },
      timezone: this.getTimezone(),
      language: navigator.language || '',
      platform: navigator.platform || '',
      hardwareConcurrency: navigator.hardwareConcurrency || 0,
      deviceMemory: (navigator as Navigator & { deviceMemory?: number }).deviceMemory || 0,
      webgl: this.getWebGLFingerprint(),
      canvas: this.getCanvasFingerprint(),
      fonts: this.getFontsFingerprint(),
      userAgent: this.normalizeUserAgent(navigator.userAgent || ''),
    };
  }

  private getTimezone(): string {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    } catch {
      return 'UTC';
    }
  }

  private getCanvasFingerprint(): string {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 200;
      canvas.height = 50;
      const ctx = canvas.getContext('2d');

      if (!ctx) return 'canvas_no_context';

      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillStyle = '#f60';
      ctx.fillRect(125, 1, 62, 20);
      ctx.fillStyle = '#069';
      ctx.fillText('OpenWeb', 2, 15);

      ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
      ctx.fillRect(100, 5, 80, 30);

      return canvas.toDataURL();
    } catch {
      return 'canvas_error';
    }
  }

  private getWebGLFingerprint(): string {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || (canvas.getContext('experimental-webgl') as WebGLRenderingContext | null);

      if (!gl) return 'webgl_not_supported';

      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (!debugInfo) return 'webgl_no_debug';

      const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || 'unknown';
      const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || 'unknown';

      return `${vendor}~${renderer}`;
    } catch {
      return 'webgl_error';
    }
  }

  private getFontsFingerprint(): string {
    const baseFonts = ['monospace', 'sans-serif', 'serif'];
    const testFonts = ['Arial', 'Verdana', 'Georgia', 'Courier New', 'Times New Roman', 'Comic Sans MS', 'Impact', 'Trebuchet MS', 'Arial Black', 'Palatino', 'Lucida Console', 'Tahoma'];

    const detectedFonts: string[] = [];

    for (const font of testFonts) {
      if (this.isFontAvailable(font, baseFonts)) {
        detectedFonts.push(font);
      }
    }

    return detectedFonts.join(',') || 'no_fonts_detected';
  }

  private isFontAvailable(fontName: string, baseFonts: string[]): boolean {
    try {
      const testString = 'mmmmmmmmmmlli';
      const testSize = '72px';
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) return false;

      for (const baseFont of baseFonts) {
        ctx.font = `${testSize} ${baseFont}`;
        const baseWidth = ctx.measureText(testString).width;

        ctx.font = `${testSize} "${fontName}",${baseFont}`;
        const testWidth = ctx.measureText(testString).width;

        if (baseWidth !== testWidth) {
          return true;
        }
      }

      return false;
    } catch {
      return false;
    }
  }

  private normalizeUserAgent(ua: string): string {
    return ua.replace(/\d+\.\d+\.\d+\.\d+/g, 'X.X.X.X').replace(/rv:\d+\.\d+/g, 'rv:X.X');
  }

  private async hashComponents(components: FingerprintComponents): Promise<string> {
    try {
      const jsonString = JSON.stringify(components);

      if (window.crypto && window.crypto.subtle) {
        const encoder = new TextEncoder();
        const data = encoder.encode(jsonString);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
      }

      return '';
    } catch {
      return '';
    }
  }

  private getCached(): string | null {
    try {
      const cached = sessionStorage.getItem(this.CACHE_KEY);
      if (!cached) return null;

      const { fingerprint, timestamp } = JSON.parse(cached) as FingerprintCache;

      if (Date.now() - timestamp > this.CACHE_DURATION) {
        sessionStorage.removeItem(this.CACHE_KEY);
        return null;
      }

      return fingerprint;
    } catch {
      return null;
    }
  }

  private setCached(fingerprint: string): void {
    try {
      const data: FingerprintCache = {
        fingerprint,
        timestamp: Date.now(),
      };
      sessionStorage.setItem(this.CACHE_KEY, JSON.stringify(data));
    } catch {
      // Ignore storage errors
    }
  }
}
