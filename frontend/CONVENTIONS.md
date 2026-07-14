# Subhan Care HMS — Project Conventions

> Follow every rule in this file for every new file and every change.  
> When in doubt: simpler, smaller, no duplication.

---

## Folder Structure

```
src/
├── assets/          # Images, icons, fonts
├── components/      # Reusable UI components
├── constants/       # Static data, enums, config constants
├── context/         # React context providers
├── hooks/           # Custom React hooks
├── layouts/         # Page layout wrappers (sidebar + topbar shell)
├── pages/           # Route-level page components
├── routes/          # Route config / path constants
├── services/        # API call functions (fetch wrappers)
├── styles/          # Global CSS and shared page-component CSS
├── types/           # JSDoc type definitions (no TypeScript)
└── utils/           # Pure helper and formatter functions
```

---

## Naming Conventions

| Target             | Convention   | Example                        |
|--------------------|--------------|--------------------------------|
| Component files    | PascalCase   | `PatientCard.jsx`              |
| Page files         | PascalCase   | `Patients.jsx`                 |
| CSS files          | PascalCase   | `Patients.css`                 |
| Hook files         | camelCase    | `useToast.js`                  |
| Service files      | camelCase    | `api.js`                       |
| Util/helper files  | camelCase    | `helpers.js`                   |
| Functions          | camelCase    | `getPatient()`, `formatDate()` |
| Variables          | camelCase    | `patientList`, `activeTab`     |
| Constants          | UPPER_CASE   | `NAVIGATION_ITEMS`, `ROLES`    |
| Folder names       | lowercase    | `components/`, `hooks/`        |
| CSS class names    | kebab-case   | `.patient-card`, `.btn-primary`|

---

## CSS Class Prefix System

Every page and role-specific component owns a **2–3 letter prefix** to prevent class name collisions.

| Prefix | File                    | Scope                        |
|--------|-------------------------|------------------------------|
| `bd-`  | `BillingDashboard.css`  | Billing Staff dashboard       |
| `dh-`  | `DoctorHome.css`        | Doctor work queue             |
| `rh-`  | `ReceptionistHome.css`  | Receptionist work queue       |
| `ph-`  | `PharmacistHome.css`    | Pharmacist dispensing queue   |
| `lp-`  | `LoginPage.css`         | Login / auth screen           |

Global shared classes (no prefix) live in `src/styles/pages.css`.  
Design tokens live in `src/styles/global.css`.

---

## Code Rules

### Components
- Functional components **only** — no class components
- One component per file (except small inline sub-components inside a page file)
- Use React Hooks (`useState`, `useEffect`, `useCallback`, `useMemo`)
- Export the component as the **default** export

### CSS
- **No inline styles** — all styles belong in `.css` files  
  _Exception_: Recharts `ResponsiveContainer` wrapper requires `style={{ width: '100%', height: N }}` — this is the only legitimate inline style
- Page-specific CSS → `src/pages/PageName.css` (imported by that page only)
- Shared / reusable CSS → `src/styles/pages.css`
- Global tokens & reset → `src/styles/global.css`
- CSS variables (design tokens) defined in `:root` in `global.css`

### No Duplicate Code
- Extract any logic used in 2+ places into a custom hook (`src/hooks/`) or utility (`src/utils/`)
- Extract any JSX pattern used in 2+ places into a shared component (`src/components/`)
- Examples: `ConfirmModal`, `useToast`, `StatusBadge`, `EmptyState`, `LoadingSkeleton` are shared

### Meaningful Names
- Names must describe **intent**, not implementation
- Prefer `filteredPatients` over `arr`, `handleSave` over `submit`, `isAdmin` over `flag`

---

## Theme / Design Tokens

All tokens are CSS variables declared in `src/styles/global.css`:

| Token                    | Value       | Usage                          |
|--------------------------|-------------|--------------------------------|
| `--color-primary`        | `#2563EB`   | Primary actions, active states |
| `--color-primary-light`  | `rgba(37,99,235,0.08)` | Tinted backgrounds  |
| `--color-primary-dark`   | `#1D4ED8`   | Hover state for primary        |
| `--color-secondary`      | `#22C55E`   | Success, positive KPIs         |
| `--color-danger`         | `#EF4444`   | Errors, destructive actions    |
| `--color-warning`        | `#F59E0B`   | Alerts, caution states         |
| `--color-background`     | `#F8FAFC`   | Page background                |
| `--color-card`           | `#FFFFFF`   | Card / panel background        |
| `--color-border`         | `#E2E8F0`   | Borders, dividers              |
| `--color-text`           | `#1E293B`   | Primary text                   |
| `--color-text-secondary` | `#64748B`   | Subtext, labels                |
| `--color-text-muted`     | `#94A3B8`   | Timestamps, metadata           |
| `--border-radius`        | `10px`      | Cards, containers              |
| `--border-radius-lg`     | `16px`      | Modals                         |
| `--button-radius`        | `8px`       | Buttons                        |
| `--border-radius-sm`     | `6px`       | Inputs, badges, small items    |
| `--input-height`         | `45px`      | All form inputs                |
| `--card-padding`         | `20px`      | Card inner padding             |
| `--spacing-sm`           | `8px`       | Tight spacing                  |
| `--spacing-md`           | `16px`      | Base spacing unit              |
| `--spacing-lg`           | `24px`      | Section gaps                   |
| `--font-family`          | `'Poppins'` | All text                       |
| `--sidebar-width`        | `260px`     | Expanded sidebar               |
| `--sidebar-collapsed-width` | `72px`   | Collapsed sidebar              |
| `--topbar-height`        | `64px`      | Top bar                        |
| `--transition-fast`      | `150ms ease`| Micro-interactions             |
| `--transition-base`      | `250ms ease`| Standard transitions           |

---

## Shared Component Set (`src/components/`)

| Component             | Purpose                                            |
|-----------------------|----------------------------------------------------|
| `Sidebar.jsx`         | Left navigation (role-filtered by PERMISSIONS)     |
| `Topbar.jsx`          | Top bar: page title, search, user info, logout     |
| `KpiCard.jsx`         | Dashboard KPI tile with trend indicator            |
| `StatusBadge.jsx`     | Coloured pill badge for status values              |
| `EmptyState.jsx`      | Centered empty / no-results state                  |
| `LoadingSkeleton.jsx` | Skeleton loader block (text / circle / title)      |
| `ConfirmModal.jsx`    | Reusable confirm / destructive action modal        |
| `InvoiceModal.jsx`    | Create invoice form (shared: Billing + BillingDashboard) |
| `PaymentModal.jsx`    | Record payment form (shared: Billing + BillingDashboard) |

---

## Icon Library

Use **Lucide React** exclusively.

```jsx
import { Users, Plus, Edit2, Trash2, Search } from 'lucide-react';
```

- Never use emoji or raw text as icons
- Always pass `aria-hidden="true"` to decorative icons
- Always pass `aria-label` to icon-only buttons

---

## Authentication Pattern

**Context:** `src/context/AuthContext.jsx`

```jsx
const { role, user, isAuthenticated, login, logout, canView, canEdit, access } = useAuth();
```

| Value           | Type       | Description                                      |
|-----------------|------------|--------------------------------------------------|
| `role`          | `string\|null` | Active role key (`'admin'`, `'doctor'`, …)   |
| `user`          | `object\|null` | `{ name, email, role }` of logged-in user    |
| `isAuthenticated` | `boolean` | `true` after successful `login()`               |
| `login(email, pw)` | `fn`    | Returns `{ success, error? }` — no redirect     |
| `logout()`      | `fn`       | Clears auth state; UI shows `LoginPage`          |
| `canView(id)`   | `fn→bool`  | True if role has any access to module            |
| `canEdit(id)`   | `fn→bool`  | True only if role has `'F'` (full) access        |
| `access(id)`    | `fn→str\|null` | Returns `'F'`, `'R'`, `'L'`, or `null`      |

**Auth gate (`App.jsx`):**

```jsx
function AppGate() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <AppContent /> : <LoginPage />;
}
```

**Logout (always reset navigation first):**

```jsx
const { logout } = useAuth();
const { navigate } = useNavigation();

const handleLogout = () => {
  navigate('dashboard');   // reset to home before clearing role
  logout();
};
```

---

## Navigation Pattern

**Context:** `src/context/NavigationContext.jsx`

```jsx
const { currentPage, navigate } = useNavigation();
navigate('patients');   // switches the active page
```

- Do NOT pass `onNavigate` as props through the tree — use `useNavigation()` directly
- `currentPage` defaults to `'dashboard'` on mount and after logout

---

## Role-Based Access

Permission matrix defined in `AuthContext.jsx`:

```
'F' = full CRUD   'R' = read-only   'L' = limited   null = no access
```

```jsx
const { canView, canEdit } = useAuth();

if (!canView('billing')) return <AccessDenied />;
{canEdit('patients') && <button>Edit Patient</button>}
```

- Never render module UI if `canView()` returns `false`
- Sidebar items filter automatically via `NAVIGATION_ITEMS.filter(i => canView(i.id))`
- Sidebar labels/icons are role-specific via `item.roleLabels?.[role]` and `item.roleIcons?.[role]`

---

## Role-Specific Home Dashboards

Each role lands on a different home component when navigating to `'dashboard'`:

| Role          | Component         | Title                |
|---------------|-------------------|----------------------|
| `admin`       | `Dashboard`       | Administrative Overview |
| `doctor`      | `DoctorHome`      | Today's Schedule     |
| `receptionist`| `ReceptionistHome`| Today's Queue        |
| `pharmacist`  | `PharmacistHome`  | Dispensing Queue     |
| `billing`     | `BillingDashboard`| Financial Dashboard  |

**Wiring in `App.jsx`:**

```jsx
const ROLE_DASHBOARD = {
  doctor: DoctorHome, receptionist: ReceptionistHome,
  pharmacist: PharmacistHome, billing: BillingDashboard,
};
const ROLE_DASHBOARD_TITLE = {
  doctor: "Today's Schedule", receptionist: "Today's Queue",
  pharmacist: 'Dispensing Queue', billing: 'Financial Dashboard',
};
// In AppContent:
const PageComponent = isDashboard ? (ROLE_DASHBOARD[role] ?? Dashboard) : PAGE_COMPONENTS[currentPage];
```

---

## Button Classes (from `pages.css`)

| Class               | Usage                                  |
|---------------------|----------------------------------------|
| `.btn.btn-primary`  | Primary CTA (blue)                     |
| `.btn.btn-secondary`| Positive / confirm (green)             |
| `.btn.btn-ghost`    | Secondary / cancel (outlined)          |
| `.btn.btn-danger`   | Destructive action (red)               |
| `.btn.btn-sm`       | Smaller variant (font 13px, less pad)  |
| `.icon-btn`         | Square 32×32 icon-only button          |

---

## Form Pattern

```jsx
<div className={`form-field ${errors.name ? 'has-error' : ''}`}>
  <label htmlFor="field-id">Label *</label>
  <input
    id="field-id"
    value={form.name}
    onChange={(e) => set('name', e.target.value)}
  />
  {errors.name && <span className="field-error">{errors.name}</span>}
</div>
```

---

## Toast Pattern

Use the `useToast` hook — never duplicate the toast state pattern inline.

```jsx
import useToast from '../hooks/useToast';

const { toast, showToast } = useToast();

showToast('Record saved.');

// In JSX:
{toast && <div className="toast toast--success" role="status">{toast}</div>}
```

---

## Confirm / Destructive Action Pattern

Use the shared `ConfirmModal` component — never write inline confirm modals.

```jsx
import ConfirmModal from '../components/ConfirmModal';

{modal?.type === 'delete' && (
  <ConfirmModal
    title="Delete Record"
    message="Are you sure you want to delete this record?"
    confirmLabel="Delete"
    variant="danger"
    onConfirm={() => handleDelete(modal.data)}
    onClose={() => setModal(null)}
  />
)}
```

---

## Loading & Empty States

```jsx
// Loading skeletons
{loading && (
  <div aria-busy="true" aria-label="Loading…">
    {[1, 2, 3].map(n => (
      <div key={n} className="skeleton-row">
        <LoadingSkeleton variant="text" width="120px" />
        <LoadingSkeleton variant="text" width="200px" />
      </div>
    ))}
  </div>
)}

// Empty state
{!loading && items.length === 0 && (
  <EmptyState
    icon={CalendarX}
    message="No appointments booked for today."
    actionLabel="Book Appointment"     // optional
    onAction={() => setModal('book')}  // optional
  />
)}
```

---

## Accessibility Checklist

- All form inputs must have an associated `<label htmlFor="id">`
- All icon-only buttons must have `aria-label`
- Decorative icons must have `aria-hidden="true"`
- Status indicators must **never** rely on color alone — pair with icon + text label
- Alert rows: use `inset box-shadow` for the color border; badge carries the text meaning
- Modal dialogs must have `role="dialog"`, `aria-modal="true"`, `aria-labelledby`
- Tables must have `aria-label`
- Active nav links use `aria-current="page"`
- Use `aria-live="polite"` on regions that update dynamically (stock alerts, toast)
- Focus management: modals use `aria-modal`; keyboard list items use `tabIndex=0` + `onKeyDown`
- Loading regions use `aria-busy="true"` and `aria-label`

---

## Shared Data / Constants

| File                          | Exports                                                        |
|-------------------------------|----------------------------------------------------------------|
| `src/constants/billingData.js`| `INITIAL_INVOICES`, `STATUS_META`, `subtotalOf`, `totalOf`, `outstandingOf`, `PATIENTS`, `PAYMENT_METHODS`, `SERVICE_CATALOG` |
| `src/constants/navigation.js` | `NAVIGATION_ITEMS` (with `roleLabels`, `roleIcons`)            |
| `src/context/AuthContext.jsx` | `ROLES`, `ROLE_LABELS`, `useAuth`, `AuthProvider`              |

---

## Demo Credentials (Development)

| Role          | Email                          | Password     |
|---------------|-------------------------------|--------------|
| Administrator | `admin@subhancare.pk`         | `Admin@123`  |
| Doctor        | `doctor@subhancare.pk`        | `Doctor@123` |
| Receptionist  | `receptionist@subhancare.pk`  | `Recept@123` |
| Pharmacist    | `pharmacist@subhancare.pk`    | `Pharma@123` |
| Billing Staff | `billing@subhancare.pk`       | `Billing@123`|

These are defined in `MOCK_USERS` inside `src/context/AuthContext.jsx`.
