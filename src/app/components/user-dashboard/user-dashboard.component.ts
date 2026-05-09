import {
  Component, OnInit, OnDestroy, ViewChild, ElementRef,
  NgZone, ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgComponentOutlet } from '@angular/common';
import { combineLatest, Subject, BehaviorSubject, takeUntil } from 'rxjs';
import { map, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';

type SortField = 'name' | 'email' | 'role' | 'joinedAt';
type SortDir = 'asc' | 'desc';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, NgComponentOutlet, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="dashboard">
      <!-- Stats -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-label">Total Users</div>
          <div class="stat-value">{{ (users$ | async)?.length || 0 }}</div>
          <div class="stat-sub">registered accounts</div>
          <div class="stat-glow total"></div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Admins</div>
          <div class="stat-value accent-blue">{{ (roleStats$ | async)?.Admin || 0 }}</div>
          <div class="stat-sub">full access</div>
          <div class="stat-glow admin"></div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Editors</div>
          <div class="stat-value accent-green">{{ (roleStats$ | async)?.Editor || 0 }}</div>
          <div class="stat-sub">content access</div>
          <div class="stat-glow editor"></div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Viewers</div>
          <div class="stat-value accent-purple">{{ (roleStats$ | async)?.Viewer || 0 }}</div>
          <div class="stat-sub">read-only access</div>
          <div class="stat-glow viewer"></div>
        </div>
      </div>

      <div class="content-row">
        <!-- Table Section -->
        <div class="table-section">
          <div class="section-header">
            <div class="section-title">
              <span class="live-dot"></span>
              User Registry
              <span class="badge-lazy">lazy-loaded</span>
            </div>
            <div class="header-actions">
              <div class="search-box">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/><path d="m21 21-4.35-4.35" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
                <input [(ngModel)]="searchQuery" (ngModelChange)="onSearch($event)" placeholder="Search users..." class="search-input" />
              </div>
              <button class="add-btn" (click)="openForm()">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>
                Add User
              </button>
            </div>
          </div>

          <!-- Role filters -->
          <div class="filter-tabs">
            <button [class.active]="activeFilter === 'all'" (click)="setFilter('all')" class="filter-tab">
              All ({{ (users$ | async)?.length || 0 }})
            </button>
            <button [class.active]="activeFilter === 'Admin'" (click)="setFilter('Admin')" class="filter-tab admin">
              Admin ({{ (roleStats$ | async)?.Admin || 0 }})
            </button>
            <button [class.active]="activeFilter === 'Editor'" (click)="setFilter('Editor')" class="filter-tab editor">
              Editor ({{ (roleStats$ | async)?.Editor || 0 }})
            </button>
            <button [class.active]="activeFilter === 'Viewer'" (click)="setFilter('Viewer')" class="filter-tab viewer">
              Viewer ({{ (roleStats$ | async)?.Viewer || 0 }})
            </button>
          </div>

          <!-- Table -->
          <div class="table-wrap">
            <table class="user-table">
              <thead>
                <tr>
                  <th (click)="sort('name')" class="sortable">
                    NAME <span class="sort-icon">{{ getSortIcon('name') }}</span>
                  </th>
                  <th (click)="sort('email')" class="sortable">
                    EMAIL <span class="sort-icon">{{ getSortIcon('email') }}</span>
                  </th>
                  <th (click)="sort('role')" class="sortable">
                    ROLE <span class="sort-icon">{{ getSortIcon('role') }}</span>
                  </th>
                  <th (click)="sort('joinedAt')" class="sortable">
                    JOINED <span class="sort-icon">{{ getSortIcon('joinedAt') }}</span>
                  </th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let user of pagedUsers; trackBy: trackById" class="user-row">
                  <td>
                    <div class="user-cell">
                      <div class="avatar" [class]="'avatar-' + user.role.toLowerCase()">{{ user.avatar }}</div>
                      <span class="user-name">{{ user.name }}</span>
                    </div>
                  </td>
                  <td class="email-cell">{{ user.email }}</td>
                  <td>
                    <span class="role-badge" [class]="'role-' + user.role.toLowerCase()">{{ user.role }}</span>
                  </td>
                  <td class="date-cell">{{ user.joinedAt | date:'MMM d, yyyy' }}</td>
                  <td>
                    <button class="delete-btn" (click)="removeUser(user.id)" title="Remove user">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    </button>
                  </td>
                </tr>
                <tr *ngIf="pagedUsers.length === 0">
                  <td colspan="5" class="empty-state">No users found</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div class="pagination" *ngIf="totalPages > 1">
            <button class="page-btn" [disabled]="currentPage === 1" (click)="goPage(currentPage - 1)">←</button>
            <button *ngFor="let p of pageNumbers" class="page-btn" [class.active]="p === currentPage" (click)="goPage(p)">{{ p }}</button>
            <button class="page-btn" [disabled]="currentPage === totalPages" (click)="goPage(currentPage + 1)">→</button>
          </div>
        </div>

        <!-- Right column -->
        <div class="right-col">
          <!-- Chart -->
          <div class="chart-card">
            <div class="card-header">
              <span class="live-dot"></span>
              Role Distribution
              <span class="badge-rxjs">RxJS</span>
            </div>
            <div class="chart-container">
              <canvas #chartCanvas></canvas>
            </div>
            <div class="chart-legend">
              <div class="legend-item" *ngFor="let item of legendItems">
                <span class="legend-dot" [style.background]="item.color"></span>
                <span class="legend-label">{{ item.label }}</span>
                <span class="legend-count">{{ item.count }}</span>
                <span class="legend-pct">{{ item.pct }}%</span>
                <div class="legend-bar"><div class="legend-fill" [style.width.%]="item.pct" [style.background]="item.color"></div></div>
              </div>
            </div>
          </div>

          <!-- Activity Log -->
          <div class="activity-card">
            <div class="card-header">
              <span class="live-dot"></span>
              Activity Log
              <span class="activity-badge">{{ (activityLog$ | async)?.length || 0 }}</span>
            </div>
            <div class="activity-list">
              <div *ngFor="let log of (activityLog$ | async)?.slice(0,5)" class="activity-item">
                <div class="activity-avatar">{{ log.user }}</div>
                <div class="activity-info">
                  <div class="activity-action">{{ log.action }}</div>
                  <div class="activity-time">{{ log.time | date:'MMM d, h:mm a' }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <div class="modal-backdrop" *ngIf="showModal" (click)="closeModal()">
      <div class="modal-container" (click)="$event.stopPropagation()">
        <ng-container *ngIf="formComponent">
          <ng-container *ngComponentOutlet="formComponent; inputs: formInputs"></ng-container>
        </ng-container>
        <div *ngIf="!formComponent" class="modal-loading">
          <div class="spinner"></div>
          <span>Loading form...</span>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./user-dashboard.component.css']
})
export class UserDashboardComponent implements OnInit, OnDestroy {
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;

  users$ = this.userService.users$;
  roleStats$ = this.userService.roleStats$;
  activityLog$ = this.userService.activityLog$;

  filteredUsers: User[] = [];
  pagedUsers: User[] = [];
  currentPage = 1;
  pageSize = 6;
  totalPages = 1;
  pageNumbers: number[] = [];

  searchQuery = '';
  activeFilter: string = 'all';
  sortField: SortField = 'joinedAt';
  sortDir: SortDir = 'desc';

  legendItems: { label: string; color: string; count: number; pct: number }[] = [];

  showModal = false;
  formComponent: any = null;
  formInputs: Record<string, unknown> = {};

  private chart: any = null;
  private destroy$ = new Subject<void>();
  private search$ = new BehaviorSubject<string>('');

  constructor(
    private userService: UserService,
    private zone: NgZone,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    combineLatest([this.users$, this.search$])
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(100),
        map(([users, q]) => {
          let list = users;
          if (q) list = list.filter(u =>
            u.name.toLowerCase().includes(q.toLowerCase()) ||
            u.email.toLowerCase().includes(q.toLowerCase())
          );
          if (this.activeFilter !== 'all') list = list.filter(u => u.role === this.activeFilter);
          return this.sortUsers(list);
        })
      )
      .subscribe(users => {
        this.filteredUsers = users;
        this.currentPage = 1;
        this.updatePage();
        this.cdr.markForCheck();
      });

    this.roleStats$.pipe(takeUntil(this.destroy$)).subscribe(stats => {
      const total = stats.Admin + stats.Editor + stats.Viewer || 1;
      this.legendItems = [
        { label: 'Admin', color: '#2d6cdf', count: stats.Admin, pct: Math.round(stats.Admin / total * 100) },
        { label: 'Editor', color: '#10b981', count: stats.Editor, pct: Math.round(stats.Editor / total * 100) },
        { label: 'Viewer', color: '#a855f7', count: stats.Viewer, pct: Math.round(stats.Viewer / total * 100) },
      ];
      this.updateChart(stats.Admin, stats.Editor, stats.Viewer);
      this.cdr.markForCheck();
    });

    this.loadChart();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.chart?.destroy();
  }

  onSearch(q: string): void { this.search$.next(q); }

  setFilter(f: string): void {
    this.activeFilter = f;
    this.search$.next(this.searchQuery);
  }

  sort(field: SortField): void {
    if (this.sortField === field) this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    else { this.sortField = field; this.sortDir = 'asc'; }
    this.search$.next(this.searchQuery);
  }

  getSortIcon(field: SortField): string {
    if (this.sortField !== field) return '↕';
    return this.sortDir === 'asc' ? '↑' : '↓';
  }

  sortUsers(users: User[]): User[] {
    return [...users].sort((a, b) => {
      let va: any = a[this.sortField], vb: any = b[this.sortField];
      if (this.sortField === 'joinedAt') { va = va.getTime(); vb = vb.getTime(); }
      else { va = String(va).toLowerCase(); vb = String(vb).toLowerCase(); }
      return this.sortDir === 'asc' ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
    });
  }

  updatePage(): void {
    this.totalPages = Math.max(1, Math.ceil(this.filteredUsers.length / this.pageSize));
    this.pageNumbers = Array.from({ length: this.totalPages }, (_, i) => i + 1);
    const start = (this.currentPage - 1) * this.pageSize;
    this.pagedUsers = this.filteredUsers.slice(start, start + this.pageSize);
  }

  goPage(p: number): void {
    if (p < 1 || p > this.totalPages) return;
    this.currentPage = p;
    this.updatePage();
  }

  trackById(_: number, u: User): string { return u.id; }

  removeUser(id: string): void { this.userService.removeUser(id); }

  async openForm(): Promise<void> {
    this.showModal = true;
    if (!this.formComponent) {
      const { UserFormComponent } = await import('../user-form/user-form.component');
      this.formComponent = UserFormComponent;
    }
    this.formInputs = {
      onSubmit: (data: { name: string; email: string; role: any }) => {
        this.userService.addUser(data);
        this.closeModal();
      },
      onClose: () => this.closeModal(),
    };
    this.cdr.markForCheck();
  }

  closeModal(): void {
    this.showModal = false;
    this.cdr.markForCheck();
  }

  private async loadChart(): Promise<void> {
    const { Chart, ArcElement, Tooltip, Legend, DoughnutController } = await import('chart.js');
    Chart.register(ArcElement, Tooltip, Legend, DoughnutController);

    setTimeout(() => {
      if (!this.chartCanvas?.nativeElement) return;
      const stats = this.userService.snapshot;
      const admin = stats.filter(u => u.role === 'Admin').length;
      const editor = stats.filter(u => u.role === 'Editor').length;
      const viewer = stats.filter(u => u.role === 'Viewer').length;

      this.zone.runOutsideAngular(() => {
        this.chart = new Chart(this.chartCanvas.nativeElement, {
          type: 'doughnut',
          data: {
            labels: ['Admin', 'Editor', 'Viewer'],
            datasets: [{
              data: [admin, editor, viewer],
              backgroundColor: ['#2d6cdf', '#10b981', '#a855f7'],
              borderColor: ['#1a3d80', '#059669', '#7c3aed'],
              borderWidth: 2,
              hoverOffset: 8,
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '65%',
            plugins: {
              legend: { display: false },
              tooltip: {
                backgroundColor: 'rgba(15,20,35,0.95)',
                titleColor: '#fff',
                bodyColor: 'rgba(255,255,255,0.7)',
                borderColor: 'rgba(255,255,255,0.1)',
                borderWidth: 1,
                padding: 12,
              }
            },
            animation: { animateRotate: true, duration: 600 }
          }
        });
      });
    }, 50);
  }

  private updateChart(admin: number, editor: number, viewer: number): void {
    if (!this.chart) return;
    this.zone.runOutsideAngular(() => {
      this.chart.data.datasets[0].data = [admin, editor, viewer];
      this.chart.update('active');
    });
  }
}
