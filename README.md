# 📊 User Dashboard

A modern **User Management Admin Panel** built with **Angular 17**, featuring lazy loading, RxJS state management, dynamic Chart.js charts, and a fully responsive dark UI.

Live Demo: https://user-dashboard-64rut1aa7-pothana-srilathas-projects.vercel.app/dashboard

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm (v9+)
- Angular CLI (`npm install -g @angular/cli`)

### Installation

```bash
# 1. Clone or extract the project
cd user-dashboard

# 2. Install dependencies
npm install

# 3. Start the dev server
npm start

# 4. Open in browser
# http://localhost:4200
```

> ⚠️ Always open in **Chrome or Edge** at `http://localhost:4200` — do not use VS Code's built-in browser preview.

---

## 🏗️ Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── navbar/                  # Top navigation bar
│   │   ├── user-dashboard/          # Main dashboard (lazy-loaded)
│   │   ├── user-form/               # Add user modal (lazy-loaded)
│   │   ├── analytics/               # Analytics page (lazy-loaded)
│   │   └── settings/                # Settings page (lazy-loaded)
│   ├── models/
│   │   └── user.model.ts            # User, UserRole, RoleStats interfaces
│   ├── services/
│   │   └── user.service.ts          # RxJS BehaviorSubject state management
│   ├── app.component.ts             # Root component
│   └── app.routes.ts                # Lazy-loaded route definitions
├── styles.css                       # Global styles + CSS variables
└── main.ts                          # App bootstrap
```

---

## ✨ Features

### Dashboard (Overview)
- 📋 **User table** with columns: Name, Email, Role, Joined, Actions
- 🔍 **Real-time search** with `debounceTime` optimization
- 🏷️ **Role filter tabs** — All / Admin / Editor / Viewer
- ↕️ **Sortable columns** — click any header to sort asc/desc
- 📄 **Pagination** — 6 users per page, auto-resets on filter
- 🥧 **Live doughnut chart** — role distribution updates instantly
- 📝 **Activity log** — tracks every add/remove action
- ➕ **Add User button** — opens lazy-loaded modal form

### Add User Form (Modal)
- Name, Email, Role fields
- Full validation (required, minLength, email format)
- Role preview tooltip
- Animated modal with backdrop blur

### Analytics
- KPI cards with percentage bars
- Monthly bar chart (built from real user join dates)
- Role breakdown doughnut chart
- Recent additions table

### Settings
- Profile form (name, email, timezone)
- Notification toggles (4 options)
- Appearance — theme picker + accent color swatches
- Security — 2FA, audit logging, session timeout
- Save with animated toast notification

---

## 🧠 Architecture & Key Concepts

### RxJS State Management
```
UserService (BehaviorSubject)
       ↓
   users$ stream
  ┌────┴────────┐
  ↓             ↓
Table         Chart
updates       updates
```

A single `BehaviorSubject<User[]>` in `UserService` is the **single source of truth**. Every component subscribes to the same stream — add a user and the table, chart, stats, and activity log all update simultaneously.

### Lazy Loading Strategy

| Chunk | Loaded When |
|-------|-------------|
| `user-dashboard-component` | User visits `/dashboard` |
| `analytics-component` | User visits `/analytics` |
| `settings-component` | User visits `/settings` |
| `user-form-component` | User clicks "Add User" (first time) |
| `chart` (Chart.js 430KB) | Dashboard first initializes |

### Change Detection
All components use `ChangeDetectionStrategy.OnPush` — Angular only re-renders when an observable emits, not on every browser event. This significantly improves performance.

---

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| Angular | 17 | Framework |
| TypeScript | 5.2 | Language |
| RxJS | 7.8 | State management & async |
| Chart.js | 4.4 | Pie/doughnut charts |
| @fontsource/syne | latest | Display font |
| @fontsource/dm-sans | latest | Body font |

---

## 📐 Design System

| Token | Value |
|-------|-------|
| Background | `#0e1220` |
| Surface | `rgba(255,255,255,0.03)` |
| Primary Blue | `#2d6cdf` |
| Success Green | `#10b981` |
| Purple | `#a855f7` |
| Border | `rgba(255,255,255,0.07)` |
| Button/Input height | `48px` |

---

## 📦 Build

```bash
# Development build
npm run build

# Production build
ng build --configuration production
```

Build output goes to `dist/user-dashboard/`.

---

## 🔮 Future Enhancements

- [ ] Connect to a real REST API (`HttpClient`)
- [ ] Add JWT authentication + route guards
- [ ] Role-based UI (hide Add User for non-admins)
- [ ] Server-side pagination and filtering
- [ ] Export users to CSV
- [ ] Dark/light theme toggle

---

## 👨‍💻 What This Project Demonstrates

- ✅ Angular 17 standalone components (no NgModules)
- ✅ Lazy loading via router + dynamic `import()`
- ✅ RxJS `BehaviorSubject`, `combineLatest`, `debounceTime`
- ✅ Reactive Forms with custom validation
- ✅ Dynamic component rendering with `NgComponentOutlet`
- ✅ `OnPush` change detection strategy
- ✅ Chart.js tree-shaken dynamic import
- ✅ `trackBy` optimization in `*ngFor`
- ✅ CSS custom properties + dark theme design
