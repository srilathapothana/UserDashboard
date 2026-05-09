import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface SettingToggle { label: string; desc: string; value: boolean; key: string; }

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="settings">
      <div class="page-header">
        <div class="page-title-wrap">
          <div class="page-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="currentColor" stroke-width="2"/></svg>
          </div>
          <div>
            <h1 class="page-title">Settings</h1>
            <p class="page-sub">Configure your dashboard preferences</p>
          </div>
        </div>
        <button class="save-btn" (click)="saveAll()" [class.saved]="saved">
          <svg *ngIf="!saved" width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17,21 17,13 7,13 7,21"/><polyline points="7,3 7,8 15,8" stroke="currentColor" stroke-width="2"/></svg>
          <svg *ngIf="saved" width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          {{ saved ? 'Saved!' : 'Save Changes' }}
        </button>
      </div>

      <div class="settings-grid">
        <!-- Profile section -->
        <div class="settings-card">
          <div class="card-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2"/></svg>
            Profile Settings
          </div>
          <div class="field-group">
            <div class="field">
              <label class="field-label">Display Name</label>
              <div class="input-wrap" [class.focus]="focused==='dname'">
                <input [(ngModel)]="profile.displayName" class="field-input" (focus)="focused='dname'" (blur)="focused=''" />
              </div>
            </div>
            <div class="field">
              <label class="field-label">Email</label>
              <div class="input-wrap" [class.focus]="focused==='email'">
                <input [(ngModel)]="profile.email" type="email" class="field-input" (focus)="focused='email'" (blur)="focused=''" />
              </div>
            </div>
            <div class="field">
              <label class="field-label">Timezone</label>
              <div class="input-wrap" [class.focus]="focused==='tz'">
                <select [(ngModel)]="profile.timezone" class="field-input field-select" (focus)="focused='tz'" (blur)="focused=''">
                  <option>UTC+0 - London</option>
                  <option>UTC+1 - Paris</option>
                  <option>UTC+5:30 - Mumbai</option>
                  <option>UTC-5 - New York</option>
                  <option>UTC-8 - Los Angeles</option>
                  <option>UTC+9 - Tokyo</option>
                </select>
              </div>
            </div>
          </div>
          <div class="avatar-section">
            <div class="big-avatar">{{ profileInitials }}</div>
            <div class="avatar-info">
              <div class="avatar-name">{{ profile.displayName }}</div>
              <div class="avatar-role">Administrator</div>
              <button class="change-avatar-btn">Change Avatar</button>
            </div>
          </div>
        </div>

        <!-- Notifications -->
        <div class="settings-card">
          <div class="card-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            Notifications
          </div>
          <div class="toggles-list">
            <div class="toggle-item" *ngFor="let t of notifToggles">
              <div class="toggle-text">
                <div class="toggle-label">{{ t.label }}</div>
                <div class="toggle-desc">{{ t.desc }}</div>
              </div>
              <div class="toggle" [class.on]="t.value" (click)="t.value = !t.value">
                <div class="toggle-knob"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Appearance -->
        <div class="settings-card">
          <div class="card-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="2"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
            Appearance
          </div>
          <div class="field-group">
            <div class="field">
              <label class="field-label">Theme</label>
              <div class="theme-picker">
                <div class="theme-opt" [class.active]="appearance.theme==='dark'" (click)="appearance.theme='dark'">
                  <div class="theme-preview dark-prev"></div>
                  <span>Dark</span>
                </div>
                <div class="theme-opt" [class.active]="appearance.theme==='darker'" (click)="appearance.theme='darker'">
                  <div class="theme-preview darker-prev"></div>
                  <span>Darker</span>
                </div>
                <div class="theme-opt" [class.active]="appearance.theme==='midnight'" (click)="appearance.theme='midnight'">
                  <div class="theme-preview midnight-prev"></div>
                  <span>Midnight</span>
                </div>
              </div>
            </div>
            <div class="field">
              <label class="field-label">Accent Color</label>
              <div class="color-picker">
                <div *ngFor="let c of accentColors" class="color-swatch"
                  [style.background]="c" [class.active]="appearance.accent===c"
                  (click)="appearance.accent=c"></div>
              </div>
            </div>
            <div class="field">
              <label class="field-label">Density</label>
              <div class="input-wrap" [class.focus]="focused==='density'">
                <select [(ngModel)]="appearance.density" class="field-input field-select" (focus)="focused='density'" (blur)="focused=''">
                  <option>Compact</option>
                  <option>Default</option>
                  <option>Comfortable</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- Security -->
        <div class="settings-card">
          <div class="card-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" stroke-width="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
            Security
          </div>
          <div class="toggles-list">
            <div class="toggle-item" *ngFor="let t of securityToggles">
              <div class="toggle-text">
                <div class="toggle-label">{{ t.label }}</div>
                <div class="toggle-desc">{{ t.desc }}</div>
              </div>
              <div class="toggle" [class.on]="t.value" (click)="t.value = !t.value">
                <div class="toggle-knob"></div>
              </div>
            </div>
          </div>
          <div class="field" style="margin-top:16px;">
            <label class="field-label">Session Timeout</label>
            <div class="input-wrap" [class.focus]="focused==='sess'">
              <select [(ngModel)]="security.sessionTimeout" class="field-input field-select" (focus)="focused='sess'" (blur)="focused=''">
                <option>15 minutes</option>
                <option>30 minutes</option>
                <option>1 hour</option>
                <option>8 hours</option>
                <option>Never</option>
              </select>
            </div>
          </div>
          <button class="danger-btn" (click)="revokeAll()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/><path d="M4.93 4.93l14.14 14.14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
            Revoke All Sessions
          </button>
        </div>
      </div>

      <!-- Toast -->
      <div class="toast" [class.show]="showToast">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
        {{ toastMsg }}
      </div>
    </div>
  `,
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent {
  focused = '';
  saved = false;
  showToast = false;
  toastMsg = '';

  profile = {
    displayName: 'Admin User',
    email: 'admin@acme.com',
    timezone: 'UTC+5:30 - Mumbai',
  };

  appearance = {
    theme: 'dark',
    accent: '#2d6cdf',
    density: 'Default',
  };

  accentColors = ['#2d6cdf', '#10b981', '#a855f7', '#ec4899', '#f59e0b', '#06b6d4'];

  notifToggles: SettingToggle[] = [
    { label: 'New User Alerts', desc: 'Get notified when a new user is added', value: true, key: 'newUser' },
    { label: 'Role Changes', desc: 'Notify when user roles are modified', value: true, key: 'roleChange' },
    { label: 'Weekly Reports', desc: 'Receive weekly analytics summaries', value: false, key: 'weeklyReport' },
    { label: 'Login Alerts', desc: 'Alert on new login from unknown device', value: true, key: 'loginAlert' },
  ];

  securityToggles: SettingToggle[] = [
    { label: 'Two-Factor Auth', desc: 'Require 2FA for all admin logins', value: false, key: '2fa' },
    { label: 'Audit Logging', desc: 'Log all user actions for compliance', value: true, key: 'audit' },
    { label: 'IP Allowlisting', desc: 'Restrict access to trusted IPs only', value: false, key: 'ipAllow' },
  ];

  security = { sessionTimeout: '1 hour' };

  constructor(private cdr: ChangeDetectorRef) {}

  get profileInitials(): string {
    return this.profile.displayName.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();
  }

  saveAll(): void {
    this.saved = true;
    this.toast('Settings saved successfully!');
    setTimeout(() => { this.saved = false; this.cdr.markForCheck(); }, 2500);
    this.cdr.markForCheck();
  }

  revokeAll(): void {
    this.toast('All active sessions have been revoked');
  }

  private toast(msg: string): void {
    this.toastMsg = msg;
    this.showToast = true;
    this.cdr.markForCheck();
    setTimeout(() => { this.showToast = false; this.cdr.markForCheck(); }, 3000);
  }
}
