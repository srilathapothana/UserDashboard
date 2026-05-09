import { Injectable } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';
import { User, UserRole, RoleStats } from '../models/user.model';

const SEED_USERS: User[] = [
  { id: '1', name: 'Alice Chen', email: 'alice@acme.com', role: 'Admin', joinedAt: new Date('2024-01-15'), avatar: 'AC' },
  { id: '2', name: 'Bob Smith', email: 'bob@acme.com', role: 'Editor', joinedAt: new Date('2024-02-03'), avatar: 'BS' },
  { id: '3', name: 'Carol White', email: 'carol@acme.com', role: 'Viewer', joinedAt: new Date('2024-03-12'), avatar: 'CW' },
  { id: '4', name: 'David Park', email: 'david@acme.com', role: 'Admin', joinedAt: new Date('2024-04-20'), avatar: 'DP' },
  { id: '5', name: 'Emma Brown', email: 'emma@acme.com', role: 'Editor', joinedAt: new Date('2024-05-08'), avatar: 'EB' },
];

@Injectable({ providedIn: 'root' })
export class UserService {
  private _users$ = new BehaviorSubject<User[]>(SEED_USERS);

  readonly users$ = this._users$.asObservable();

  readonly roleStats$ = this.users$.pipe(
    map(users => ({
      Admin: users.filter(u => u.role === 'Admin').length,
      Editor: users.filter(u => u.role === 'Editor').length,
      Viewer: users.filter(u => u.role === 'Viewer').length,
    }) as RoleStats)
  );

  readonly activityLog$ = new BehaviorSubject<{ action: string; time: Date; user: string }[]>([
    { action: 'User Alice Chen joined', time: new Date('2024-01-15'), user: 'AC' },
    { action: 'User Bob Smith joined', time: new Date('2024-02-03'), user: 'BS' },
    { action: 'User Carol White joined', time: new Date('2024-03-12'), user: 'CW' },
  ]);

  get snapshot(): User[] {
    return this._users$.getValue();
  }

  addUser(data: { name: string; email: string; role: UserRole }): void {
    const initials = data.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    const newUser: User = {
      id: crypto.randomUUID(),
      name: data.name,
      email: data.email,
      role: data.role,
      joinedAt: new Date(),
      avatar: initials,
    };
    this._users$.next([newUser, ...this._users$.getValue()]);

    const log = this.activityLog$.getValue();
    this.activityLog$.next([
      { action: `User ${data.name} added as ${data.role}`, time: new Date(), user: initials },
      ...log,
    ]);
  }

  removeUser(id: string): void {
    const user = this._users$.getValue().find(u => u.id === id);
    this._users$.next(this._users$.getValue().filter(u => u.id !== id));
    if (user) {
      const log = this.activityLog$.getValue();
      this.activityLog$.next([
        { action: `User ${user.name} removed`, time: new Date(), user: user.avatar },
        ...log,
      ]);
    }
  }

  updateUserRole(id: string, role: UserRole): void {
    const users = this._users$.getValue().map(u => u.id === id ? { ...u, role } : u);
    this._users$.next(users);
  }
}
