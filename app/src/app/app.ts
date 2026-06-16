import { Component } from '@angular/core';
import { Color, PieChartModule, ScaleType } from '@swimlane/ngx-charts';
import { financialVisibility } from './data';

@Component({
  selector: 'app-root',
  imports: [PieChartModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  financialVisibility = financialVisibility;
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

  onSelect(data: any): void {
    console.log('Item clicked', JSON.parse(JSON.stringify(data)));
  }

  onActivate(data: any): void {
    console.log('Activate', JSON.parse(JSON.stringify(data)));
  }

  onDeactivate(data: any): void {
    console.log('Deactivate', JSON.parse(JSON.stringify(data)));
  }
}
