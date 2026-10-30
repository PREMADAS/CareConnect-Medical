<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import DataTable from '@/components/tables/DataTable.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseModal from '@/components/modals/BaseModal.vue'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'
import prescriptionsData from '@/data/prescriptions.json'
import {
  PlusIcon,
  QrCodeIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
  ClipboardDocumentIcon,
  CalendarDaysIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  BeakerIcon,
  ClockIcon,
} from '@heroicons/vue/24/outline'

const router = useRouter()
const auth = useAuthStore()
const ui = useUiStore()
const loading = ref(true)
onMounted(() => setTimeout(() => (loading.value = false), 500))

const prescriptions = ref(prescriptionsData)
const detailOpen = ref(false)
const selected = ref(null)

const isPatient = computed(() => !['doctor', 'pharmacist'].includes(auth.role))

// ---------- staff filters (doctor / pharmacist) ----------
const search = ref('')
const statusFilter = ref('all')
const statusOptions = ['all', 'active', 'pending', 'fulfilled', 'expired']

const counts = computed(() => {
  const c = { active: 0, pending: 0, fulfilled: 0, expired: 0 }
  prescriptions.value.forEach((r) => {
    if (c[r.status] !== undefined) c[r.status]++
  })
  return c
})

const filteredRows = computed(() => {
  const q = search.value.trim().toLowerCase()
  return prescriptions.value.filter((r) => {
    const okStatus = statusFilter.value === 'all' || r.status === statusFilter.value
    const okSearch = !q || r.id.toLowerCase().includes(q) || r.patient.toLowerCase().includes(q)
    return okStatus && okSearch
  })
})

function toggleStat(status) {
  statusFilter.value = statusFilter.value === status ? 'all' : status
}

// ---------- patient tabs ----------
const tab = ref('active')

const activeRows = computed(() =>
  prescriptions.value
    .filter((r) => ['active', 'pending'].includes(r.status))
    .sort((a, b) => (daysLeft(a) ?? 999) - (daysLeft(b) ?? 999))
)
const historyRows = computed(() =>
  prescriptions.value
    .filter((r) => ['fulfilled', 'expired'].includes(r.status))
    .sort((a, b) => new Date(b.issuedOn) - new Date(a.issuedOn))
)
const patientRows = computed(() => (tab.value === 'active' ? activeRows.value : historyRows.value))

const expiringSoon = computed(() =>
  activeRows.value.filter((r) => {
    const d = daysLeft(r)
    return r.status === 'active' && d !== null && d >= 0 && d <= 7
  })
)

// ---------- table ----------
const columns = computed(() => {
  const cols = [
    { key: 'id', label: 'Rx ID', sortable: true },
    { key: 'patient', label: 'Patient', sortable: true },
  ]
  if (auth.role !== 'doctor') cols.push({ key: 'doctor', label: 'Doctor', sortable: true })
  cols.push({ key: 'status', label: 'Status' }, { key: 'actions', label: '' })
  return cols
})

const statusTone = { active: 'info', pending: 'warning', fulfilled: 'success', expired: 'danger' }

const statCards = [
  { key: 'active', label: 'Active', color: 'text-sky-600 dark:text-sky-400' },
  { key: 'pending', label: 'Pending', color: 'text-amber-600 dark:text-amber-400' },
  { key: 'fulfilled', label: 'Fulfilled', color: 'text-emerald-600 dark:text-emerald-400' },
  { key: 'expired', label: 'Expired', color: 'text-rose-600 dark:text-rose-400' },
]

// patient-friendly wording + left strip color
const patientStatus = {
  active: { label: 'Ready to use', strip: 'bg-sky-500' },
  pending: { label: 'Sent to pharmacy', strip: 'bg-amber-500' },
  fulfilled: { label: 'Picked up', strip: 'bg-emerald-500' },
  expired: { label: 'Expired', strip: 'bg-rose-500' },
}

// ---------- helpers ----------
const avatarColors = [
  'bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300',
  'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
  'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
  'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300',
  'bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300',
]

function initials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('')
}

function avatarClass(name = '') {
  let hash = 0
  for (const ch of name) hash = (hash + ch.charCodeAt(0)) % avatarColors.length
  return avatarColors[hash]
}

function patientMeta(row) {
  return [row.age, row.gender].filter(Boolean).join(' · ')
}

function formatDate(value) {
  const d = new Date(value)
  if (isNaN(d)) return value
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function daysLeft(row) {
  if (!row.expiresOn) return null
  return Math.ceil((new Date(row.expiresOn) - new Date()) / 86400000)
}

const plural = (n) => `${n} day${n === 1 ? '' : 's'}`

function statusNote(row) {
  const d = daysLeft(row)
  switch (row.status) {
    case 'fulfilled':
      return 'Dispensed'
    case 'pending':
      return 'Awaiting pharmacy'
    case 'active':
      if (d === null) return 'Ready to dispense'
      return d >= 0 ? `${plural(d)} left` : 'Expiring'
    case 'expired':
      return d === null ? 'No longer valid' : `${plural(Math.abs(d))} ago`
    default:
      return ''
  }
}

function isUrgent(row) {
  const d = daysLeft(row)
  return row.status === 'active' && d !== null && d >= 0 && d <= 7
}

function medicineSummary(row) {
  const names = (row.items || []).map((i) => i.medicine)
  if (!names.length) return 'Prescription'
  if (names.length <= 2) return names.join(', ')
  return `${names.slice(0, 2).join(', ')} +${names.length - 2} more`
}

// ---------- actions ----------
function openDetail(row) {
  selected.value = row
  detailOpen.value = true
}
function fulfill(row) {
  row.status = 'fulfilled'
  ui.toast({ type: 'success', title: 'Prescription fulfilled', message: `${row.id} marked as dispensed.` })
  detailOpen.value = false
}
function goToCreate() {
  router.push({ name: 'prescription-create' })
}
async function copyId(id) {
  try {
    await navigator.clipboard.writeText(id)
    ui.toast({ type: 'success', title: 'Copied', message: `${id} copied to clipboard.` })
  } catch {
    ui.toast({ type: 'warning', title: 'Could not copy', message: 'Please copy it manually.' })
  }
}
function addToSchedule(row) {
  // TODO: hook into your schedule store / route, e.g. router.push({ name: 'schedule' })
  ui.toast({
    type: 'success',
    title: 'Added to schedule',
    message: `${(row.items || []).length} medicine(s) from ${row.id} added to your reminders.`,
  })
}
function requestRefill(row) {
  ui.toast({ type: 'success', title: 'Refill requested', message: `Your request for ${row.id} was sent to ${row.doctor}.` })
  detailOpen.value = false
}
</script>

<template>
  <DashboardLayout>
    <!-- header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="font-display text-2xl font-semibold text-meridian-900 dark:text-white">
          {{ isPatient ? 'My prescriptions' : 'Prescriptions' }}
        </h1>
        <p class="text-sm text-meridian-500 dark:text-meridian-400 mt-1">
          <template v-if="auth.role === 'doctor'">Prescriptions you have issued.</template>
          <template v-else-if="auth.role === 'pharmacist'">
            Incoming prescriptions to fulfill<span v-if="counts.pending"> · {{ counts.pending }} pending</span>.
          </template>
          <template v-else>
            {{ activeRows.length }} active<span v-if="expiringSoon.length"> · {{ expiringSoon.length }} expiring soon</span>
          </template>
        </p>
      </div>
      <BaseButton v-if="auth.role === 'doctor'" @click="goToCreate">
        <template #icon-left><PlusIcon class="h-5 w-5" /></template>New prescription
      </BaseButton>
    </div>

    <!-- ================= PATIENT VIEW ================= -->
    <template v-if="isPatient">
      <!-- expiring soon banner -->
      <div
        v-if="!loading && expiringSoon.length"
        class="mb-5 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-500/30 dark:bg-amber-500/10"
      >
        <ExclamationTriangleIcon class="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
        <p class="text-sm text-amber-800 dark:text-amber-200">
          <span class="font-semibold">{{ expiringSoon.length }} prescription{{ expiringSoon.length > 1 ? 's' : '' }}</span>
          will expire within 7 days. Visit the pharmacy soon.
        </p>
      </div>

      <!-- tabs -->
      <div class="mb-5 inline-flex rounded-full bg-meridian-50 p-1 dark:bg-white/5">
        <button
          v-for="t in [{ key: 'active', label: 'Active', n: activeRows.length }, { key: 'history', label: 'History', n: historyRows.length }]"
          :key="t.key"
          type="button"
          @click="tab = t.key"
          class="rounded-full px-5 py-1.5 text-sm font-medium transition"
          :class="tab === t.key
            ? 'bg-white text-meridian-900 shadow-sm dark:bg-white/10 dark:text-white'
            : 'text-meridian-500 hover:text-meridian-700 dark:text-meridian-300'"
        >
          {{ t.label }}
          <span class="ml-1 text-xs text-meridian-400">{{ t.n }}</span>
        </button>
      </div>

      <!-- skeleton cards -->
      <div v-if="loading" class="space-y-3">
        <div v-for="i in 3" :key="i" class="h-28 animate-pulse rounded-2xl bg-meridian-50 dark:bg-white/5" />
      </div>

      <!-- cards -->
      <div v-else-if="patientRows.length" class="space-y-3">
        <article
          v-for="row in patientRows"
          :key="row.id"
          class="group relative overflow-hidden rounded-2xl border border-meridian-100 bg-white p-5 pl-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-white/5"
          :class="tab === 'history' ? 'opacity-80' : ''"
        >
          <span class="absolute inset-y-0 left-0 w-1.5" :class="patientStatus[row.status]?.strip" />

          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <h3 class="flex items-center gap-2 text-base font-semibold text-meridian-900 dark:text-white">
                <BeakerIcon class="h-5 w-5 shrink-0 text-pulse-500" />
                <span class="truncate">{{ medicineSummary(row) }}</span>
              </h3>
              <p class="mt-1 text-xs text-meridian-500 dark:text-meridian-400">
                {{ row.doctor }} · {{ formatDate(row.issuedOn) }}
              </p>
            </div>
            <BaseBadge :tone="statusTone[row.status]">{{ patientStatus[row.status]?.label }}</BaseBadge>
          </div>

          <div class="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p
              class="flex items-center gap-1.5 text-xs font-medium"
              :class="isUrgent(row) ? 'text-amber-600 dark:text-amber-400' : 'text-meridian-500 dark:text-meridian-400'"
            >
              <ClockIcon class="h-4 w-4" />
              {{ statusNote(row) }}
            </p>
            <div class="flex gap-2">
              <BaseButton size="sm" variant="outline" @click="openDetail(row)">Details</BaseButton>
              <BaseButton v-if="row.status === 'active'" size="sm" @click="openDetail(row)">
                <template #icon-left><QrCodeIcon class="h-4 w-4" /></template>Show QR
              </BaseButton>
            </div>
          </div>
        </article>
      </div>

      <!-- empty -->
      <div
        v-else
        class="rounded-2xl border border-dashed border-meridian-200 p-10 text-center dark:border-white/10"
      >
        <BeakerIcon class="mx-auto h-8 w-8 text-meridian-400" />
        <p class="mt-3 text-sm font-medium text-meridian-800 dark:text-meridian-100">
          {{ tab === 'active' ? 'No active prescriptions' : 'No past prescriptions yet' }}
        </p>
        <p class="mt-1 text-xs text-meridian-500">When your doctor prescribes something, it will appear here.</p>
      </div>
    </template>

    <!-- ================= STAFF VIEW (doctor / pharmacist) ================= -->
    <template v-else>
      <!-- summary strip -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <button
          v-for="s in statCards"
          :key="s.key"
          type="button"
          @click="toggleStat(s.key)"
          class="text-left rounded-xl border px-4 py-3 transition bg-white dark:bg-white/5 hover:border-meridian-300 dark:hover:border-white/20"
          :class="statusFilter === s.key ? 'border-pulse-500 ring-1 ring-pulse-500/30' : 'border-meridian-100 dark:border-white/10'"
        >
          <p class="text-xs text-meridian-500 dark:text-meridian-400">{{ s.label }}</p>
          <p class="mt-0.5 text-2xl font-semibold" :class="s.color">{{ counts[s.key] }}</p>
        </button>
      </div>

      <!-- search + filter chips -->
      <div class="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
        <div class="relative flex-1">
          <MagnifyingGlassIcon class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-meridian-400" />
          <input
            v-model="search"
            type="text"
            placeholder="Search patient or Rx ID"
            class="w-full rounded-xl border border-meridian-100 dark:border-white/10 bg-white dark:bg-white/5 py-2 pl-9 pr-3 text-sm text-meridian-900 dark:text-white placeholder:text-meridian-400 focus:outline-none focus:ring-2 focus:ring-pulse-500/40"
          />
        </div>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="opt in statusOptions"
            :key="opt"
            type="button"
            @click="statusFilter = opt"
            class="rounded-full border px-3 py-1 text-xs font-medium capitalize transition"
            :class="statusFilter === opt
              ? 'border-pulse-500 bg-pulse-500/10 text-pulse-600 dark:text-pulse-400'
              : 'border-meridian-200 dark:border-white/10 text-meridian-600 dark:text-meridian-300 hover:bg-meridian-50 dark:hover:bg-white/5'"
          >
            {{ opt }}
          </button>
        </div>
      </div>

      <!-- table -->
      <DataTable
        :columns="columns"
        :rows="filteredRows"
        :loading="loading"
        empty-title="No prescriptions found"
        empty-message="Try a different search or filter."
        @row-click="openDetail"
      >
        <template #cell-id="{ row }">
          <div>
            <span class="font-mono text-[13px] text-meridian-800 dark:text-meridian-100">{{ row.id }}</span>
            <p class="text-xs text-meridian-500 mt-0.5">{{ formatDate(row.issuedOn) }}</p>
          </div>
        </template>

        <template #cell-patient="{ row }">
          <div class="flex items-center gap-3">
            <div class="h-9 w-9 shrink-0 rounded-full flex items-center justify-center text-xs font-semibold" :class="avatarClass(row.patient)">
              {{ initials(row.patient) }}
            </div>
            <div>
              <p class="text-sm font-medium text-meridian-900 dark:text-white">{{ row.patient }}</p>
              <p v-if="patientMeta(row)" class="text-xs text-meridian-500">{{ patientMeta(row) }}</p>
            </div>
          </div>
        </template>

        <template #cell-status="{ row, value }">
          <div>
            <BaseBadge :tone="statusTone[value]">{{ value }}</BaseBadge>
            <p class="text-xs text-meridian-500 mt-1">{{ statusNote(row) }}</p>
          </div>
        </template>

        <template #cell-actions>
          <ChevronRightIcon class="h-4 w-4 text-meridian-400 group-hover:text-pulse-500" />
        </template>
      </DataTable>
    </template>

    <!-- ================= DETAIL MODAL ================= -->
    <BaseModal v-model="detailOpen" :title="isPatient ? 'Prescription details' : selected?.id" size="md">
      <template v-if="selected">
        <!-- patient: QR block -->
        <div
          v-if="isPatient && selected.status !== 'expired'"
          class="mb-5 rounded-2xl bg-meridian-50 p-5 text-center dark:bg-white/5"
        >
          <div class="mx-auto flex h-40 w-40 items-center justify-center rounded-xl bg-white shadow-sm dark:bg-white/10">
            <!-- swap with <QrcodeVue :value="selected.qrCode" :size="144" /> if you use qrcode.vue -->
            <QrCodeIcon class="h-28 w-28 text-meridian-800 dark:text-white" />
          </div>
          <p class="mt-3 text-xs text-meridian-500">Show this code at the pharmacy</p>
          <button
            type="button"
            class="mt-1 inline-flex items-center gap-1.5 font-mono text-sm text-meridian-700 hover:text-pulse-600 dark:text-meridian-200"
            @click="copyId(selected.id)"
          >
            {{ selected.id }}
            <ClipboardDocumentIcon class="h-4 w-4" />
          </button>
        </div>

        <!-- who / status -->
        <div class="flex items-center justify-between mb-4">
          <div>
            <p class="text-sm font-medium text-meridian-900 dark:text-white">{{ isPatient ? selected.doctor : selected.patient }}</p>
            <p class="text-xs text-meridian-500">
              <template v-if="isPatient">Issued {{ formatDate(selected.issuedOn) }}</template>
              <template v-else>Issued by {{ selected.doctor }} · {{ selected.issuedOn }}</template>
            </p>
          </div>
          <BaseBadge :tone="statusTone[selected.status]">
            {{ isPatient ? patientStatus[selected.status]?.label : selected.status }}
          </BaseBadge>
        </div>

        <!-- medicines -->
        <div class="space-y-2.5 mb-4">
          <div
            v-for="(item, i) in selected.items"
            :key="i"
            class="rounded-xl border border-meridian-100 dark:border-white/10 p-3.5"
          >
            <p class="flex items-center gap-2 text-sm font-medium text-meridian-800 dark:text-meridian-100">
              <BeakerIcon class="h-4 w-4 text-pulse-500" />{{ item.medicine }}
            </p>
            <p class="mt-1 text-xs text-meridian-500">{{ item.dosage }} · {{ item.frequency }} · {{ item.duration }}</p>
            <p v-if="item.instruction" class="mt-1 text-xs italic text-meridian-400">{{ item.instruction }}</p>
          </div>
        </div>

        <!-- staff: QR code string -->
        <div v-if="!isPatient" class="flex items-center gap-2 rounded-lg bg-meridian-50 dark:bg-white/5 p-3 mb-4">
          <QrCodeIcon class="h-5 w-5 text-meridian-500" />
          <span class="font-mono text-xs text-meridian-600 dark:text-meridian-300">{{ selected.qrCode }}</span>
        </div>

        <!-- actions -->
        <div class="flex flex-wrap justify-end gap-3">
          <BaseButton variant="outline" @click="detailOpen = false">Close</BaseButton>

          <template v-if="isPatient">
            <BaseButton
              v-if="selected.status === 'fulfilled' || selected.status === 'expired'"
              variant="outline"
              @click="requestRefill(selected)"
            >
              <template #icon-left><ArrowPathIcon class="h-4 w-4" /></template>Request refill
            </BaseButton>
            <BaseButton v-if="selected.status !== 'expired'" @click="addToSchedule(selected)">
              <template #icon-left><CalendarDaysIcon class="h-4 w-4" /></template>Add to schedule
            </BaseButton>
          </template>

          <BaseButton
            v-if="auth.role === 'pharmacist' && selected.status !== 'fulfilled'"
            @click="fulfill(selected)"
          >
            Mark as fulfilled
          </BaseButton>
        </div>
      </template>
    </BaseModal>
  </DashboardLayout>
</template>