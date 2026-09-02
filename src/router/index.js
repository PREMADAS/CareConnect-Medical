import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const roleHome = {
  'super-admin': '/super-admin/dashboard',
  doctor: '/doctor/dashboard',
  pharmacist: '/pharmacist/dashboard',
  patient: '/patient/dashboard',
  caretaker: '/caretaker/dashboard',
}

function roleRoutes(role, base) {
  return [
    { path: `${base}/dashboard`, name: `${role}-dashboard`, component: () => import(`@/pages/${role}/Dashboard.vue`) },
    { path: `${base}/profile`, name: `${role}-profile`, component: () => import('@/pages/shared/Profile.vue') },
    { path: `${base}/settings`, name: `${role}-settings`, component: () => import('@/pages/shared/Settings.vue') },
    { path: `${base}/notifications`, name: `${role}-notifications`, component: () => import('@/pages/shared/Notifications.vue') },
  ]
}

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', name: 'login', component: () => import('@/pages/auth/Login.vue'), meta: { guestOnly: true } },
  { path: '/register', name: 'register', component: () => import('@/pages/auth/Register.vue'), meta: { guestOnly: true } },
  { path: '/forgot-password', name: 'forgot-password', component: () => import('@/pages/auth/ForgotPassword.vue'), meta: { guestOnly: true } },
  { path: '/reset-password', name: 'reset-password', component: () => import('@/pages/auth/ResetPassword.vue'), meta: { guestOnly: true } },
  { path: '/verify-otp', name: 'verify-otp', component: () => import('@/pages/auth/VerifyOtp.vue'), meta: { guestOnly: true } },

  // Super Admin
  {
    path: '/super-admin', meta: { role: 'super-admin' },
    children: [
      ...roleRoutes('super-admin', '/super-admin'),
      { path: 'users', name: 'super-admin-users', component: () => import('@/pages/super-admin/Users.vue') },
      { path: 'facilities', name: 'super-admin-facilities', component: () => import('@/pages/super-admin/Facilities.vue') },
      { path: 'analytics', name: 'super-admin-analytics', component: () => import('@/pages/super-admin/Analytics.vue') },
      { path: 'reports', name: 'super-admin-reports', component: () => import('@/pages/shared/Reports.vue') },
      { path: 'billing', name: 'super-admin-billing', component: () => import('@/pages/super-admin/Billing.vue') },
      { path: 'access-control', name: 'super-admin-access-control', component: () => import('@/pages/super-admin/AccessControl.vue') },
    ],
  },
  // Doctor
  {
    path: '/doctor', meta: { role: 'doctor' },
    children: [
      ...roleRoutes('doctor', '/doctor'),
      { path: 'appointments', name: 'doctor-appointments', component: () => import('@/pages/shared/Appointments.vue') },
      { path: 'prescriptions', name: 'doctor-prescriptions', component: () => import('@/pages/shared/Prescriptions.vue') },
      { path: 'patients', name: 'doctor-patients', component: () => import('@/pages/doctor/Patients.vue') },
      { path: 'patients/:id', name: 'doctor-patient-detail', component: () => import('@/pages/shared/MedicalHistory.vue') },
      { path: 'reports', name: 'doctor-reports', component: () => import('@/pages/shared/Reports.vue') },
      { path: 'prescriptions/new', name: 'prescription-create', component: () => import('@/views/PrescriptionCreate.vue') }
    ],
  },
  // Pharmacist
  {
    path: '/pharmacist', meta: { role: 'pharmacist' },
    children: [
      ...roleRoutes('pharmacist', '/pharmacist'),
      { path: 'prescriptions', name: 'pharmacist-prescriptions', component: () => import('@/pages/shared/Prescriptions.vue') },
      { path: 'inventory', name: 'pharmacist-inventory', component: () => import('@/pages/pharmacist/Inventory.vue') },
      { path: 'scan', name: 'pharmacist-scan', component: () => import('@/pages/pharmacist/ScanQr.vue') },
    ],
  },
  // Patient
  {
    path: '/patient', meta: { role: 'patient' },
    children: [
      ...roleRoutes('patient', '/patient'),
      { path: 'schedule', name: 'patient-schedule', component: () => import('@/pages/shared/MedicineSchedule.vue') },
      { path: 'prescriptions', name: 'patient-prescriptions', component: () => import('@/pages/shared/Prescriptions.vue') },
      { path: 'medical-history', name: 'patient-medical-history', component: () => import('@/pages/shared/MedicalHistory.vue') },
      { path: 'appointments', name: 'patient-appointments', component: () => import('@/pages/shared/Appointments.vue') },
      { path: 'pharmacy-search', name: 'patient-pharmacy-search', component: () => import('@/pages/patient/PharmacySearch.vue') },
      { path: 'qr-code', name: 'patient-qr-code', component: () => import('@/pages/patient/QrCode.vue') },
    ],
  },
  // Caretaker
  {
    path: '/caretaker', meta: { role: 'caretaker' },
    children: [
      ...roleRoutes('caretaker', '/caretaker'),
      { path: 'recipients', name: 'caretaker-recipients', component: () => import('@/pages/caretaker/Recipients.vue') },
      { path: 'schedule', name: 'caretaker-schedule', component: () => import('@/pages/shared/MedicineSchedule.vue') },
      { path: 'appointments', name: 'caretaker-appointments', component: () => import('@/pages/shared/Appointments.vue') },
    ],
  },

  { path: '/maintenance', name: 'maintenance', component: () => import('@/pages/errors/Maintenance.vue') },
  { path: '/500', name: 'server-error', component: () => import('@/pages/errors/ServerError.vue') },
  { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('@/pages/errors/NotFound.vue') },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

router.beforeEach((to, from, next) => {
  const auth = useAuthStore()

  if (to.meta.guestOnly && auth.isAuthenticated) {
    return next(roleHome[auth.role] || '/login')
  }

  if (to.meta.role) {
    if (!auth.isAuthenticated) return next('/login')
    if (auth.role !== to.meta.role) return next(roleHome[auth.role] || '/login')
  }

  next()
})

export default router
