import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from '@core/services';
import { ServicioConfig } from '@models/index';
import { LoadingComponent } from '@shared/components/loading/loading';
import { WizardHeaderComponent } from '@shared/components/wizard-header/wizard-header';

/**
 * Placeholder page for services not yet supported.
 *
 * Displays a "coming soon" message for services with:
 * - `formaOperaciones: "R"` (Recarga)
 * - `formaOperaciones: "P"` (Pago)
 *
 * @remarks
 * **Routing:**
 * - Route: `/servicio/:aliasServicio/proximamente`
 * - Extracts `aliasServicio` from ActivatedRoute params
 * - Loads service config to display service name and operation type
 *
 * @selector app-proximamente-page
 */
@Component({
  selector: 'app-proximamente-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './proximamente-page.html',
  imports: [LoadingComponent, WizardHeaderComponent],
})
export class ProximamentePageComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly config = signal<ServicioConfig | null>(null);
  protected readonly loading = signal(true);

  /**
   * Human-readable operation type label.
   */
  protected readonly operationType = signal<string>('');

  ngOnInit(): void {
    const alias = this.route.snapshot.paramMap.get('aliasServicio');
    if (alias) {
      this.loadServiceInfo(alias);
    } else {
      this.router.navigate(['/']);
    }
  }

  private loadServiceInfo(alias: string): void {
    this.api.getServiceConfig(alias).subscribe({
      next: (response) => {
        if (response?.success && response.data) {
          this.config.set(response.data);
          this.operationType.set(this.getOperationLabel(response.data.formaOperaciones));
        }
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.router.navigate(['/']);
      },
    });
  }

  /**
   * Returns a human-readable label for the operation type.
   *
   * @param formaOperaciones - Operation type code (C, R, P)
   * @returns Label in Spanish
   */
  private getOperationLabel(formaOperaciones: string): string {
    switch (formaOperaciones) {
      case 'R':
        return 'Recarga';
      case 'P':
        return 'Pago';
      default:
        return 'Servicio';
    }
  }

  protected goToHome(): void {
    this.router.navigate(['/']);
  }
}
