import { Component, Input, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { UserRole } from '../../models/user.model';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="modal-card">
      <div class="modal-header">
        <div class="modal-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6M22 11h-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </div>
        <div>
          <h2 class="modal-title">Add New User</h2>
          <p class="modal-sub">Fill in the details to create a user account</p>
        </div>
        <button class="close-btn" (click)="close()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        </button>
      </div>

      <form [formGroup]="form" (ngSubmit)="submit()" class="modal-form" novalidate>
        <div class="form-group">
          <label class="form-label">Full Name</label>
          <div class="input-wrap" [class.error]="isInvalid('name')" [class.focus]="focused === 'name'">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" class="input-icon"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2"/></svg>
            <input formControlName="name" type="text" placeholder="e.g. Jane Doe"
              class="form-input" (focus)="focused='name'" (blur)="focused=''" />
          </div>
          <div class="err-msg" *ngIf="isInvalid('name')">
            {{ form.get('name')?.errors?.['required'] ? 'Name is required' : 'Name must be at least 2 characters' }}
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Email Address</label>
          <div class="input-wrap" [class.error]="isInvalid('email')" [class.focus]="focused === 'email'">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" class="input-icon"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6" stroke="currentColor" stroke-width="2"/></svg>
            <input formControlName="email" type="email" placeholder="e.g. jane@company.com"
              class="form-input" (focus)="focused='email'" (blur)="focused=''" />
          </div>
          <div class="err-msg" *ngIf="isInvalid('email')">
            {{ form.get('email')?.errors?.['required'] ? 'Email is required' : 'Please enter a valid email' }}
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Role</label>
          <div class="input-wrap" [class.error]="isInvalid('role')" [class.focus]="focused === 'role'">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" class="input-icon"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" stroke-width="2"/></svg>
            <select formControlName="role" class="form-input form-select" (focus)="focused='role'" (blur)="focused=''">
              <option value="" disabled>Select a role...</option>
              <option value="Admin">Admin — Full access</option>
              <option value="Editor">Editor — Content access</option>
              <option value="Viewer">Viewer — Read only</option>
            </select>
          </div>
          <div class="err-msg" *ngIf="isInvalid('role')">Role is required</div>
        </div>

        <div class="role-preview" *ngIf="form.get('role')?.value">
          <div class="rp-icon" [class]="'rp-' + form.get('role')?.value?.toLowerCase()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" stroke-width="2" fill="currentColor" fill-opacity="0.2"/></svg>
          </div>
          <span class="rp-text">This user will have <strong>{{ getRoleDesc() }}</strong></span>
        </div>

        <div class="form-actions">
          <button type="button" class="btn-cancel" (click)="close()">Cancel</button>
          <button type="submit" class="btn-submit" [disabled]="form.invalid">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>
            Create User
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .modal-card {
      background: #141826;
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 20px;
      width: 460px;
      overflow: hidden;
      box-shadow: 0 30px 80px rgba(0,0,0,0.6);
    }
    .modal-header {
      display: flex; align-items: flex-start; gap: 14px;
      padding: 24px 24px 20px;
      border-bottom: 1px solid rgba(255,255,255,0.07);
    }
    .modal-icon {
      width: 42px; height: 42px; border-radius: 12px;
      background: linear-gradient(135deg, #1c4980, #2d6cdf);
      display: grid; place-items: center; color: #fff; flex-shrink: 0;
    }
    .modal-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 1.1rem; color: #fff; margin: 0 0 4px; }
    .modal-sub { font-size: 0.78rem; color: rgba(255,255,255,0.4); margin: 0; }
    .close-btn {
      margin-left: auto; background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.08); border-radius: 8px;
      width: 32px; height: 32px; cursor: pointer;
      color: rgba(255,255,255,0.4); display: grid; place-items: center;
      transition: all 0.2s;
    }
    .close-btn:hover { background: rgba(255,255,255,0.1); color: #fff; }

    .modal-form { padding: 24px; display: flex; flex-direction: column; gap: 18px; }
    .form-group { display: flex; flex-direction: column; gap: 6px; }
    .form-label { font-size: 0.78rem; font-weight: 700; color: rgba(255,255,255,0.5); letter-spacing: 0.05em; text-transform: uppercase; }
    .input-wrap {
      display: flex; align-items: center; gap: 10px;
      background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08);
      border-radius: 10px; padding: 0 16px; height: 48px;
      transition: all 0.2s;
    }
    .input-wrap.focus { border-color: rgba(45,108,223,0.6); background: rgba(45,108,223,0.05); box-shadow: 0 0 0 3px rgba(45,108,223,0.1); }
    .input-wrap.error { border-color: rgba(239,68,68,0.5); background: rgba(239,68,68,0.04); }
    .input-icon { color: rgba(255,255,255,0.3); flex-shrink: 0; }
    .form-input {
      flex: 1; background: none; border: none; outline: none;
      color: #fff; font-size: 0.9rem;
    }
    .form-input::placeholder { color: rgba(255,255,255,0.2); }
    .form-select { cursor: pointer; }
    .form-select option { background: #1a2035; color: #fff; }
    .err-msg { font-size: 0.75rem; color: #f87171; padding-left: 2px; }

    .role-preview {
      display: flex; align-items: center; gap: 10px;
      background: rgba(255,255,255,0.03); border-radius: 10px;
      padding: 12px 16px; border: 1px solid rgba(255,255,255,0.06);
    }
    .rp-icon { width: 28px; height: 28px; border-radius: 8px; display: grid; place-items: center; }
    .rp-admin { background: rgba(45,108,223,0.2); color: #5b96f5; }
    .rp-editor { background: rgba(16,185,129,0.2); color: #34d399; }
    .rp-viewer { background: rgba(168,85,247,0.2); color: #c084fc; }
    .rp-text { font-size: 0.8rem; color: rgba(255,255,255,0.5); }
    .rp-text strong { color: rgba(255,255,255,0.85); }

    .form-actions { display: flex; gap: 10px; padding-top: 4px; }
    .btn-cancel {
      flex: 1; height: 48px; background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.1); border-radius: 10px;
      color: rgba(255,255,255,0.6); font-size: 0.9rem; font-weight: 600;
      cursor: pointer; transition: all 0.2s;
    }
    .btn-cancel:hover { background: rgba(255,255,255,0.1); color: #fff; }
    .btn-submit {
      flex: 2; height: 48px;
      display: flex; align-items: center; justify-content: center; gap: 8px;
      background: linear-gradient(135deg, #1c4980, #2d6cdf);
      border: none; border-radius: 10px;
      color: #fff; font-size: 0.9rem; font-weight: 700;
      cursor: pointer; transition: all 0.2s;
      box-shadow: 0 4px 15px rgba(45,108,223,0.3);
    }
    .btn-submit:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(45,108,223,0.5); }
    .btn-submit:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
  `]
})
export class UserFormComponent implements OnInit {
  @Input() onSubmit?: (data: { name: string; email: string; role: UserRole }) => void;
  @Input() onClose?: () => void;

  form!: FormGroup;
  focused = '';

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      role: ['', Validators.required],
    });
  }

  isInvalid(field: string): boolean {
    const c = this.form.get(field);
    return !!(c && c.invalid && c.touched);
  }

  getRoleDesc(): string {
    const role = this.form.get('role')?.value;
    if (role === 'Admin') return 'full system access';
    if (role === 'Editor') return 'content editing access';
    return 'read-only access';
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.onSubmit?.(this.form.value as { name: string; email: string; role: UserRole });
  }

  close(): void { this.onClose?.(); }
}
