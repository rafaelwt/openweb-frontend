import { ChangeDetectionStrategy, Component, input, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Servicio } from '@models/index';

@Component({
  selector: 'app-service-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './business-card.html',
  imports: [RouterLink],
})
export class BusinessCardComponent {
  readonly business = input.required<Servicio>();

  protected readonly iconUrl = computed(() => {
    return this.business().iconoServicio;
  });

  /**
   * Route segment for navigation using aliasServicio.
   *
   * @remarks
   * Uses aliasServicio directly for routing to align with
   * the cobranza-wizard's route param extraction.
   */
  protected readonly routeSegment = computed(() => {
    return this.business().aliasServicio;
  });
}
