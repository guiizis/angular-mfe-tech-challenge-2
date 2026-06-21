import { ChangeDetectorRef, Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { Color, PieChartModule, ScaleType } from '@swimlane/ngx-charts';
import { financialVisibility } from './data';
import type { FinancialVisibilityData } from './financial-visibility.interface';

@Component({
  selector: 'app-root',
  imports: [PieChartModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  private _financialVisibilityData?: FinancialVisibilityData;

  @Input()
  set financialVisibilityData(value: FinancialVisibilityData | undefined) {
    this._financialVisibilityData = value;
    this.onFinancialVisibilityDataChange(value);
  }

  get financialVisibilityData(): FinancialVisibilityData | undefined {
    return this._financialVisibilityData;
  }

  @Input() customerId?: string;
  @Output() visibilityItemSelected = new EventEmitter<unknown>();

  financialVisibility = financialVisibility;
  shouldShowFinancialVisibility = true;
  view: [number, number] = [900, 420];

  // options
  gradient: boolean = false;
  showLegend: boolean = false;
  showLabels: boolean = true;
  trimLabels: boolean = false;
  maxLabelLength: number = 24;
  isDoughnut: boolean = false;

  colorScheme: Color = {
    name: 'custom',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#ff2f7d', '#8f38f4']
  };

  chartLegend = this.financialVisibility.map((item, index) => ({
    ...item,
    color: this.colorScheme.domain[index]
  }));

  private onFinancialVisibilityDataChange(value: FinancialVisibilityData | undefined): void {
    console.log('financialVisibilityData recebido do shell:', value);

    if (!value) {
      return;
    }

    const hasFinancialVisibilityData = value.transfersTotal > 0 || value.depositsTotal > 0;
    this.shouldShowFinancialVisibility = hasFinancialVisibilityData;

    if (!hasFinancialVisibilityData) {
      this.financialVisibility = [];
      this.chartLegend = [];
      this.changeDetectorRef.markForCheck();
      return;
    }

    this.financialVisibility = [
      {
        name: 'Transferencias',
        value: value.transfersTotal
      },
      {
        name: 'Depositos',
        value: value.depositsTotal
      }
    ];

    this.chartLegend = this.financialVisibility.map((item, index) => ({
      ...item,
      color: this.colorScheme.domain[index]
    }));

    this.changeDetectorRef.markForCheck();
  }

  onSelect(data: any): void {
    this.visibilityItemSelected.emit(data);
    console.log('Item clicked', JSON.parse(JSON.stringify(data)));
  }

  onActivate(data: any): void {
    console.log('Activate', JSON.parse(JSON.stringify(data)));
  }

  onDeactivate(data: any): void {
    console.log('Deactivate', JSON.parse(JSON.stringify(data)));
  }
}
