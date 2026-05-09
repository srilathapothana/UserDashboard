export type UserRole = 'Admin' | 'Editor' | 'Viewer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  joinedAt: Date;
  avatar: string;
}

export interface RoleStats {
  Admin: number;
  Editor: number;
  Viewer: number;
}
