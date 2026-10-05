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
} from '@heroicons/vue/24/outline'

const router = useRouter()
const auth = useAuthStore()
const ui = useUiStore()
const loading = ref(true)
onMounted(() => setTimeout(() => (loading.value = false), 500))

const prescriptions = ref(prescriptionsData)
const detailOpen = ref(false)
const selected = ref(null)

// ---------- filters ----------
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

// ---------- table ----------
const columns = computed(() => {
  const cols = [
    { key: 'id', label: 'Rx ID', sortable: true },
    { key: 'patient', label: 'Patient', sortable: true },
    { key: 'medication', label: 'Medication' },
  ]
  // doctor already knows these are their own prescriptions; others still need the issuer
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

// ---------- cell helpers ----------
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
  // uses age / gender if your JSON has them, otherwise shows nothing
  return [row.age, row.gender].filter(Boolean).join(' · ')
}

function formatDate(value) {
  const d = new Date(value)
  if (isNaN(d)) return value
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function mainMedicine(row) {
  return row.items?.[0] || null
}

function daysLeft(row) {
  // optional: add "expiresOn": "2026-10-20" to your JSON to get real countdowns
  if (!row.expiresOn) return null
  return Math.ceil((new Date(row.expiresOn) - new Date()) / 86400000)
}

function statusNote(row) {
  const d = daysLeft(row)
  const plural = (n) => `${n} day${n === 1 ? '' : 's'}`
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
</script>

<template>
  <DashboardLayout>
    <!-- header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="font-display text-2xl font-semibold text-meridian-900 dark:text-white">Prescriptions</h1>
        <p class="text-sm text-meridian-500 dark:text-meridian-400 mt-1">
          {{ auth.role === 'doctor' ? 'Prescriptions you have issued.' : auth.role === 'pharmacist' ? 'Incoming prescriptions to fulfill.' : 'Your prescription history.' }}
        </p>
      </div>
      <BaseButton v-if="auth.role === 'doctor'" @click="goToCreate">
        <template #icon-left><PlusIcon class="h-5 w-5" /></template>New prescription
      </BaseButton>
    </div>

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

      <template #cell-medication="{ row }">
        <div v-if="mainMedicine(row)">
          <p class="text-sm text-meridian-900 dark:text-white">
            {{ mainMedicine(row).medicine }} {{ mainMedicine(row).dosage }}
            <span v-if="row.items.length > 1" class="ml-1 text-xs text-meridian-500">+{{ row.items.length - 1 }} more</span>
          </p>
          <p class="text-xs text-meridian-500 mt-0.5">{{ mainMedicine(row).frequency }} · {{ mainMedicine(row).duration }}</p>
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

    <!-- detail modal (unchanged) -->
    <BaseModal v-model="detailOpen" :title="selected?.id" size="md">
      <template v-if="selected">
        <div class="flex items-center justify-between mb-4">
          <div>
            <p class="text-sm font-medium text-meridian-900 dark:text-white">{{ selected.patient }}</p>
            <p class="text-xs text-meridian-500">Issued by {{ selected.doctor }} · {{ selected.issuedOn }}</p>
          </div>
          <BaseBadge :tone="statusTone[selected.status]">{{ selected.status }}</BaseBadge>
        </div>
        <div class="space-y-2.5 mb-4">
          <div v-for="(item, i) in selected.items" :key="i" class="rounded-lg border border-meridian-100 dark:border-white/10 p-3">
            <p class="text-sm font-medium text-meridian-800 dark:text-meridian-100">{{ item.medicine }}</p>
            <p class="text-xs text-meridian-500">{{ item.dosage }} · {{ item.frequency }} · {{ item.duration }}</p>
          </div>
        </div>
        <div class="flex items-center gap-2 rounded-lg bg-meridian-50 dark:bg-white/5 p-3 mb-4">
          <QrCodeIcon class="h-5 w-5 text-meridian-500" />
          <span class="font-mono text-xs text-meridian-600 dark:text-meridian-300">{{ selected.qrCode }}</span>
        </div>
        <div class="flex justify-end gap-3">
          <BaseButton variant="outline" @click="detailOpen = false">Close</BaseButton>
          <BaseButton v-if="auth.role === 'pharmacist' && selected.status !== 'fulfilled'" @click="fulfill(selected)">Mark as fulfilled</BaseButton>
        </div>
      </template>
    </BaseModal>
  </DashboardLayout>
</template>