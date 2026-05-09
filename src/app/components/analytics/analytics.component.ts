import {
  Component, OnInit, OnDestroy, ViewChild, ElementRef, NgZone,
  ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Subject, takeUntil, combineLatest } from 'rxjs';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="analytics">
      <div class="page-header">
        <div class="page-title-wrap">
          <div class="page-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </div>
          <div>
            <h1 class="page-title">Analytics</h1>
            <p class="page-sub">Insights and trends from your user data</p>
          </div>
        </div>
        <div class="live-indicator">
          <span class="live-dot"></span>
          Live Data
        </div>
      </div>

      <!-- KPI row -->
      <div class="kpi-row">
        <div class="kpi-card" *ngFor="let kpi of kpis">
          <div class="kpi-header">
            <span class="kpi-label">{{ kpi.label }}</span>
            <span class="kpi-change" [class.up]="kpi.change > 0" [class.down]="kpi.change < 0">
              {{ kpi.change > 0 ? '↑' : '↓' }} {{ kpi.changeLabel }}
            </span>
          </div>
          <div class="kpi-value" [style.color]="kpi.color">{{ kpi.value }}</div>
          <div class="kpi-bar">
            <div class="kpi-fill" [style.width.%]="kpi.pct" [style.background]="kpi.color"></div>
          </div>
        </div>
      </div>

      <div class="charts-grid">
        <!-- Bar chart - monthly signups -->
        <div class="chart-card wide">
          <div class="card-header">
            <span class="live-dot"></span>
            User Growth by Month
            <span class="chart-badge">2024</span>
          </div>
          <div class="bar-chart">
            <div class="bar-wrap" *ngFor="let bar of monthlyData">
              <div class="bar-col">
                <div class="bar-val" *ngIf="bar.count > 0">{{ bar.count }}</div>
                <div class="bar" [style.height.px]="bar.height" [style.background]="bar.color" [class.highlight]="bar.highlight"></div>
              </div>
              <div class="bar-label">{{ bar.month }}</div>
            </div>
          </div>
        </div>

        <!-- Role donut -->
        <div class="chart-card">
          <div class="card-header">
            <span class="live-dot"></span>
            Role Breakdown
          </div>
          <div class="donut-wrap">
            <canvas #donutCanvas></canvas>
            <div class="donut-center">
              <div class="donut-total">{{ totalUsers }}</div>
              <div class="donut-label">Users</div>
            </div>
          </div>
          <div class="donut-legend">
            <div class="dl-item" *ngFor="let d of donutLegend">
              <span class="dl-dot" [style.background]="d.color"></span>
              <span class="dl-name">{{ d.label }}</span>
              <span class="dl-count">{{ d.count }}</span>
              <span class="dl-pct">{{ d.pct }}%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent additions table -->
      <div class="recent-card">
        <div class="card-header">
          <span class="live-dot"></span>
          Recent Additions
          <span class="table-badge">Last {{ recentUsers.length }} users</span>
        </div>
        <div class="recent-table-wrap">
          <table class="recent-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let user of recentUsers">
                <td>
                  <div class="u-cell">
                    <div class="u-av" [class]="'av-' + user.role.toLowerCase()">{{ user.avatar }}</div>
                    {{ user.name }}
                  </div>
                </td>
                <td class="mono">{{ user.email }}</td>
                <td><span class="r-badge" [class]="'r-' + user.role.toLowerCase()">{{ user.role }}</span></td>
                <td class="mono">{{ user.joinedAt | date:'MMM d, yyyy' }}</td>
                <td><span class="status-active">● Active</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./analytics.component.css']
})
export class AnalyticsComponent implements OnInit, OnDestroy {
  @ViewChild('donutCanvas') donutCanvas!: ElementRef<HTMLCanvasElement>;

  totalUsers = 0;
  kpis: any[] = [];
  monthlyData: any[] = [];
  donutLegend: any[] = [];
  recentUsers: User[] = [];

  private chart: any = null;
  private destroy$ = new Subject<void>();

  constructor(
    private userService: UserService,
    private zone: NgZone,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    combineLatest([this.userService.users$, this.userService.roleStats$])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([users, stats]) => {
        this.totalUsers = users.length;
        this.recentUsers = [...users].sort((a, b) => b.joinedAt.getTime() - a.joinedAt.getTime()).slice(0, 5);

        const total = users.length || 1;
        this.kpis = [
          { label: 'Total Users', value: users.length, pct: 100, color: '#fff', change: 1, changeLabel: 'Active' },
          { label: 'Admin Users', value: stats.Admin, pct: Math.round(stats.Admin/total*100), color: '#5b96f5', change: 1, changeLabel: `${Math.round(stats.Admin/total*100)}%` },
          { label: 'Editor Users', value: stats.Editor, pct: Math.round(stats.Editor/total*100), color: '#34d399', change: 1, changeLabel: `${Math.round(stats.Editor/total*100)}%` },
          { label: 'Viewer Users', value: stats.Viewer, pct: Math.round(stats.Viewer/total*100), color: '#c084fc', change: 1, changeLabel: `${Math.round(stats.Viewer/total*100)}%` },
        ];

        // Monthly bar chart - distribute users by month
        const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        const counts = new Array(12).fill(0);
        users.forEach(u => counts[u.joinedAt.getMonth()]++);
        const maxCount = Math.max(...counts, 1);
        this.monthlyData = months.map((month, i) => ({
          month,
          count: counts[i],
          height: Math.max(counts[i] / maxCount * 120, counts[i] > 0 ? 8 : 0),
          color: counts[i] > 0 ? `hsl(${220 + i * 10}, 70%, ${50 + (counts[i]/maxCount*20)}%)` : 'rgba(255,255,255,0.06)',
          highlight: counts[i] === maxCount && counts[i] > 0,
        }));

        this.donutLegend = [
          { label: 'Admin', color: '#2d6cdf', count: stats.Admin, pct: Math.round(stats.Admin/total*100) },
          { label: 'Editor', color: '#10b981', count: stats.Editor, pct: Math.round(stats.Editor/total*100) },
          { label: 'Viewer', color: '#a855f7', count: stats.Viewer, pct: Math.round(stats.Viewer/total*100) },
        ];

        this.updateDonut(stats.Admin, stats.Editor, stats.Viewer);
        this.cdr.markForCheck();
      });

    this.loadDonut();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.chart?.destroy();
  }

  private async loadDonut(): Promise<void> {
    const { Chart, ArcElement, Tooltip, DoughnutController } = await import('chart.js');
    Chart.register(ArcElement, Tooltip, DoughnutController);
    setTimeout(() => {
      if (!this.donutCanvas?.nativeElement) return;
      const snapshot = this.userService.snapshot;
      const a = snapshot.filter(u => u.role === 'Admin').length;
      const e = snapshot.filter(u => u.role === 'Editor').length;
      const v = snapshot.filter(u => u.role === 'Viewer').length;
      this.zone.runOutsideAngular(() => {
        this.chart = new (Chart as any)(this.donutCanvas.nativeElement, {
          type: 'doughnut',
          data: {
            labels: ['Admin', 'Editor', 'Viewer'],
            datasets: [{ data: [a, e, v], backgroundColor: ['#2d6cdf','#10b981','#a855f7'], borderWidth: 0, hoverOffset: 6 }]
          },
          options: {
            cutout: '72%',
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false }, tooltip: { backgroundColor: 'rgba(15,20,35,0.95)', padding: 10 } },
            animation: { duration: 500 }
          }
        });
      });
    }, 100);
  }

  private updateDonut(a: number, e: number, v: number): void {
    if (!this.chart) return;
    this.zone.runOutsideAngular(() => {
      this.chart.data.datasets[0].data = [a, e, v];
      this.chart.update();
    });
  }
}
