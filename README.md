# CareConnect — AI-Powered Centralized Healthcare & Smart Medicine Reminder System

Frontend UI/UX for CareConnect, built with Vue 3, Vite, Pinia, Vue Router, Tailwind CSS,
Chart.js, and Heroicons. Backend-integration-ready (Laravel / Inertia.js compatible).

## Quick start

```bash
npm install
npm run dev       # http://localhost:5173
npm run build      # production build -> dist/
```

## Demo accounts

All demo accounts use the password `password`. Accounts with 2FA enabled (Super Admin,
Doctor) will be routed through the OTP screen — the demo code is `123456`.

| Role         | Email                     |
|--------------|----------------------------|
| Super Admin  | admin@careconnect.io       |
| Doctor       | doctor@careconnect.io      |
| Pharmacist   | pharmacist@careconnect.io  |
| Patient      | patient@careconnect.io     |
| Caretaker    | caretaker@careconnect.io   |

## Design system

- **Colors** — Meridian Teal (`#0e7c66`) primary, Pulse Coral (`#ff6b5b`) accent for
  reminders/alerts, deep pine-ink darks for the dark theme.
- **Type** — Space Grotesk (display), Inter (body), JetBrains Mono (dosages/codes).
- **Signature motif** — a "pulse-line" ECG trace used as a divider and loading element,
  tying the visual language back to the medicine-reminder theme (`PulseLine.vue`).
- **Material** — glassmorphism panels (`.glass`, `.glass-panel`) over flat cards
  (`.card-base`) for modals, navbars, and auth screens.
- Full light/dark mode via Tailwind's `class` strategy, toggled in `stores/theme.js`.

## Folder structure

```
src/
  assets/          global CSS, design tokens
  components/
    ui/            Button, Input primitives, Badge, Avatar, Modal, Toast, EmptyState…
    forms/          BaseInput, BaseSelect, BaseTextarea, BaseCheckbox, ToggleSwitch
    layout/         AppSidebar, AppNavbar
    cards/          StatCard, ChartCard
    charts/         LineChart, BarChart, DoughnutChart (Chart.js wrappers)
    tables/         DataTable (sortable, slot-based)
    modals/         BaseModal, ConfirmModal
    skeletons/      SkeletonLine, SkeletonCard, SkeletonTable
  composables/       useNavigation (role-based nav config)
  data/               dummy JSON datasets (users, medicines, prescriptions, schedule…)
  layouts/            AuthLayout, DashboardLayout
  pages/
    auth/             Login, Register, ForgotPassword, ResetPassword, VerifyOtp
    super-admin/       Dashboard, Users, Facilities, Analytics, AccessControl
    doctor/             Dashboard, Patients
    pharmacist/         Dashboard, Inventory, ScanQr
    patient/            Dashboard, PharmacySearch, QrCode
    caretaker/          Dashboard, Recipients
    shared/             Profile, Settings, Notifications, Prescriptions,
                        Appointments, MedicineSchedule, Reports
    errors/             NotFound, ServerError, Maintenance
  router/             route definitions + role guards
  services/           api.js (Axios instance), authService.js
  stores/             auth, theme, ui (toasts), notifications
  utils/              simulateLatency.js
```

## Wiring up a real backend

Every store calls through a service file (`services/authService.js`, or `services/api.js`
directly). Each dummy resolver has a commented-out real API call right next to it, e.g.:

```js
// Real call: return (await api.post('/auth/login', { email, password })).data
```

Swap the dummy body for the real call and no component code needs to change — stores,
props, and templates are already written against the final shape of the data. Axios
(`services/api.js`) already auto-attaches a JWT bearer token from `localStorage` and
clears it on a 401, so it's Laravel Sanctum / Inertia-ready out of the box.

## Accessibility

- Visible focus rings (`btn-focus-ring`) on all interactive elements.
- Labelled form fields with `aria-invalid` / `aria-describedby` wiring.
- `prefers-reduced-motion` respected globally.
- Semantic table markup, `role="dialog"` + `aria-modal` on modals, live region on toasts.
