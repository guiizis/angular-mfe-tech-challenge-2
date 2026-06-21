import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { financialVisibility } from './data';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the pie chart', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('ngx-charts-pie-chart')).toBeTruthy();
  });

  it('should update chart data when financialVisibilityData input changes', () => {
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;

    app.financialVisibilityData = {
      balance: 700,
      depositsTotal: 500,
      transfersTotal: 200,
      transactions: [
        {
          id: 1,
          type: 'DEPOSIT',
          date: '2026-06-20T12:00:00.000Z',
          value: 500
        },
        {
          id: 2,
          type: 'TRANSFER',
          date: '2026-06-20T12:00:00.000Z',
          value: 200
        }
      ]
    };

    expect(app.financialVisibility).toEqual([
      { name: 'Transferencias', value: 200 },
      { name: 'Depositos', value: 500 }
    ]);
    expect(app.chartLegend).toEqual([
      { name: 'Transferencias', value: 200, color: '#ff2f7d' },
      { name: 'Depositos', value: 500, color: '#8f38f4' }
    ]);
    expect(consoleLogSpy).toHaveBeenCalledWith(
      'financialVisibilityData recebido do shell:',
      app.financialVisibilityData
    );

    consoleLogSpy.mockRestore();
  });

  it('should keep current chart data when financialVisibilityData input is undefined', () => {
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;

    app.financialVisibilityData = undefined;

    expect(app.financialVisibility).toEqual(financialVisibility);
    expect(app.chartLegend).toEqual([
      { ...financialVisibility[0], color: '#ff2f7d' },
      { ...financialVisibility[1], color: '#8f38f4' }
    ]);
    expect(consoleLogSpy).toHaveBeenCalledWith(
      'financialVisibilityData recebido do shell:',
      undefined
    );

    consoleLogSpy.mockRestore();
  });

  it('should hide chart and legend when financial visibility totals are zero', async () => {
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;

    app.financialVisibilityData = {
      balance: 0,
      depositsTotal: 0,
      transfersTotal: 0,
      transactions: []
    };
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(app.shouldShowFinancialVisibility).toBe(false);
    expect(app.financialVisibility).toEqual([]);
    expect(app.chartLegend).toEqual([]);
    expect(compiled.querySelector('ngx-charts-pie-chart')).toBeNull();
    expect(compiled.querySelector('.financial-chart__legend')).toBeNull();

    consoleLogSpy.mockRestore();
  });
});
