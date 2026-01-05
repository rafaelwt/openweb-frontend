import { ChangeDetectionStrategy, Component, input, output, computed } from '@angular/core';

import Decimal from 'decimal.js-light';

import { PagoPendiente, DatosAsociado } from '@models/index';

@Component({
  selector: 'app-debt-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './debt-table.html',
})
export class DebtTableComponent {
  readonly outstandingDebts = input.required<PagoPendiente[]>();
  readonly selectedDebts = input.required<boolean[]>();
  readonly currencyAbbreviation = input<string>('Bs');
  readonly officialDocDescription = input<string>('Factura');
  readonly associateCode = input<string>('');
  readonly associateData = input<DatosAsociado | null>(null);

  readonly toggleOne = output<{ index: number; checked: boolean }>();
  readonly toggleAll = output<boolean>();

  protected readonly allSelectedDebts = computed(() => {
    const s = this.selectedDebts();
    return s.length > 0 && s.every((v) => v);
  });

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

  protected readonly hasCommissions = computed(() => this.totalCommission() > 0);

  protected readonly hasOutstandingDebts = computed(() => this.outstandingDebts().length > 0);

  formatNumber(value: number, decimals: number = 2): string {
    return value.toLocaleString('es-BO', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }
}
