import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { Contrato } from '@models/index';

@Component({
  selector: 'app-contract-selector',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './contract-selector.html',
})
export class ContractSelectorComponent {
  readonly contracts = input.required<Contrato[]>();
  readonly selectedContract = input<Contrato | null>(null);
  readonly associateCode = input<string>('');

  readonly selectContract = output<Contrato>();

  isSelected(contrato: Contrato): boolean {
    return this.selectedContract()?.codigoContrato === contrato.codigoContrato;
  }
}
