<script setup>
import { ref, computed, onMounted } from 'vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import DataTable from '@/components/tables/DataTable.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import {
  BuildingOffice2Icon,
  BeakerIcon,
  HeartIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  UsersIcon,
  EyeIcon,
  PencilSquareIcon,
  XMarkIcon,
} from '@heroicons/vue/24/outline'

const loading = ref(true)
onMounted(() => setTimeout(() => (loading.value = false), 500))

const facilities = ref([
  { id: 'fac_01', name: 'Meridian General Hospital', type: 'Hospital', location: 'Dhaka', providers: 84, status: 'active' },
  { id: 'fac_02', name: 'Meridian Central Pharmacy', type: 'Pharmacy', location: 'Dhaka', providers: 12, status: 'active' },
  { id: 'fac_03', name: 'GreenLeaf Pharmacy', type: 'Pharmacy', location: 'Dhaka', providers: 8, status: 'active' },
  { id: 'fac_04', name: 'CarePlus Clinic', type: 'Clinic', location: 'Chattogram', providers: 21, status: 'pending' },
  { id: 'fac_05', name: 'Wellness Point Pharmacy', type: 'Pharmacy', location: 'Sylhet', providers: 6, status: 'suspended' },
])

const columns = [
  { key: 'name', label: 'Facility', sortable: true },
  { key: 'type', label: 'Type', sortable: true },
  { key: 'location', label: 'Location', sortable: true },
  { key: 'providers', label: 'Providers', sortable: true },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: '' },
]

const statusTone = { active: 'success', pending: 'warning', suspended: 'danger' }
const typeIcon = { Hospital: BuildingOffice2Icon, Clinic: HeartIcon, Pharmacy: BeakerIcon }

/* ---------- filters ---------- */
const search = ref('')
const statusFilter = ref('all')
const typeFilter = ref('all')

const typeOptions = computed(() => [
  { key: 'all', label: 'All', count: facilities.value.length },
  ...['Hospital', 'Clinic', 'Pharmacy'].map((t) => ({
    key: t,
    label: t === 'Pharmacy' ? 'Pharmacies' : t + 's',
    count: facilities.value.filter((f) => f.type === t).length,
  })),
])

const stats = computed(() => {
  const count = (s) => facilities.value.filter((f) => f.status === s).length
  return [
    { key: 'all', label: 'Total facilities', value: facilities.value.length, dot: 'bg-meridian-500' },
    { key: 'active', label: 'Active', value: count('active'), dot: 'bg-emerald-500' },
    { key: 'pending', label: 'Pending approval', value: count('pending'), dot: 'bg-amber-500' },
    { key: 'suspended', label: 'Suspended', value: count('suspended'), dot: 'bg-red-500' },
  ]
})

const filteredRows = computed(() => {
  const q = search.value.trim().toLowerCase()
  return facilities.value.filter((f) => {
    const matchSearch = !q || f.name.toLowerCase().includes(q) || f.location.toLowerCase().includes(q) || f.id.toLowerCase().includes(q)
    const matchStatus = statusFilter.value === 'all' || f.status === statusFilter.value
    const matchType = typeFilter.value === 'all' || f.type === typeFilter.value
    return matchSearch && matchStatus && matchType
  })
})

const hasFilters = computed(() => search.value || statusFilter.value !== 'all' || typeFilter.value !== 'all')
function clearFilters() {
  search.value = ''
  statusFilter.value = 'all'
  typeFilter.value = 'all'
}
</script>

<template>
  <DashboardLayout>
    <!-- Header -->
    <div class="flex flex-wrap items-end justify-between gap-4 mb-6">
      <div>
        <h1 class="font-display text-2xl font-semibold text-meridian-900 dark:text-white">Facilities</h1>
        <p class="mt-1 text-sm text-meridian-500 dark:text-meridian-300">
          Manage hospitals, clinics and pharmacies registered on the platform.
        </p>
      </div>
      <BaseButton>
        <template #icon-left><PlusIcon class="h-5 w-5" /></template>
        Add facility
      </BaseButton>
    </div>

    <!-- Summary cards (click to filter by status) -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      <button
        v-for="s in stats"
        :key="s.key"
        type="button"
        @click="statusFilter = s.key"
        :class="[
          'text-left rounded-xl border p-4 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-meridian-500',
          statusFilter === s.key
            ? 'border-meridian-500 bg-meridian-50 dark:bg-white/10 shadow-sm'
            : 'border-meridian-100 dark:border-white/10 bg-white dark:bg-white/5 hover:border-meridian-300 hover:shadow-sm',
        ]"
      >
        <div class="flex items-center gap-2 text-sm text-meridian-500 dark:text-meridian-300">
          <span :class="['h-2 w-2 rounded-full', s.dot]" />
          {{ s.label }}
        </div>
        <div class="mt-2 text-3xl font-semibold text-meridian-900 dark:text-white tabular-nums">{{ s.value }}</div>
      </button>
    </div>

    <!-- Toolbar: search + type chips -->
    <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
      <div class="relative w-full sm:w-80">
        <MagnifyingGlassIcon class="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-meridian-400" />
        <input
          v-model="search"
          type="text"
          placeholder="Search by name, location or ID…"
          class="w-full rounded-lg border border-meridian-200 dark:border-white/10 bg-white dark:bg-white/5 py-2 pl-10 pr-9 text-sm text-meridian-800 dark:text-meridian-100 placeholder:text-meridian-400 focus:border-meridian-500 focus:outline-none focus:ring-2 focus:ring-meridian-500/20"
        />
        <button
          v-if="search"
          type="button"
          @click="search = ''"
          class="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-meridian-400 hover:text-meridian-700"
          aria-label="Clear search"
        >
          <XMarkIcon class="h-4 w-4" />
        </button>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <button
          v-for="t in typeOptions"
          :key="t.key"
          type="button"
          @click="typeFilter = t.key"
          :class="[
            'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition',
            typeFilter === t.key
              ? 'border-meridian-600 bg-meridian-600 text-white'
              : 'border-meridian-200 dark:border-white/10 bg-white dark:bg-white/5 text-meridian-600 dark:text-meridian-200 hover:bg-meridian-50 dark:hover:bg-white/10',
          ]"
        >
          {{ t.label }}
          <span :class="['text-xs tabular-nums', typeFilter === t.key ? 'text-white/80' : 'text-meridian-400']">{{ t.count }}</span>
        </button>
        <button v-if="hasFilters" type="button" @click="clearFilters" class="ml-1 text-sm font-medium text-meridian-600 hover:underline">
          Clear filters
        </button>
      </div>
    </div>

    <!-- Table -->
    <DataTable
      :columns="columns"
      :rows="filteredRows"
      :loading="loading"
      :empty-title="hasFilters ? 'No facilities match your filters' : 'No facilities registered'"
    >
      <template #cell-name="{ row }">
        <div class="flex items-center gap-3">
          <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-meridian-50 dark:bg-white/5 text-meridian-600 ring-1 ring-meridian-100 dark:ring-white/10">
            <component :is="typeIcon[row.type]" class="h-5 w-5" />
          </span>
          <div class="min-w-0">
            <div class="truncate font-medium text-meridian-900 dark:text-meridian-50">{{ row.name }}</div>
            <div class="font-mono text-xs text-meridian-400">{{ row.id.toUpperCase() }}</div>
          </div>
        </div>
      </template>

      <template #cell-type="{ value }">
        <span class="inline-flex items-center rounded-md bg-meridian-50 dark:bg-white/5 px-2 py-0.5 text-xs font-medium text-meridian-700 dark:text-meridian-200">
          {{ value }}
        </span>
      </template>

      <template #cell-location="{ value }">
        <span class="inline-flex items-center gap-1.5 text-meridian-600 dark:text-meridian-200">
          <MapPinIcon class="h-4 w-4 text-meridian-400" />{{ value }}
        </span>
      </template>

      <template #cell-providers="{ value }">
        <span class="inline-flex items-center gap-1.5 tabular-nums text-meridian-700 dark:text-meridian-100">
          <UsersIcon class="h-4 w-4 text-meridian-400" />{{ value }}
        </span>
      </template>

      <template #cell-status="{ value }">
        <BaseBadge :tone="statusTone[value]" class="capitalize">{{ value }}</BaseBadge>
      </template>

      <template #cell-actions="{ row }">
        <div class="flex items-center justify-end gap-1">
          <button type="button" class="rounded-lg p-2 text-meridian-400 transition hover:bg-meridian-50 dark:hover:bg-white/10 hover:text-meridian-700" :aria-label="`View ${row.name}`">
            <EyeIcon class="h-5 w-5" />
          </button>
          <button type="button" class="rounded-lg p-2 text-meridian-400 transition hover:bg-meridian-50 dark:hover:bg-white/10 hover:text-meridian-700" :aria-label="`Edit ${row.name}`">
            <PencilSquareIcon class="h-5 w-5" />
          </button>
        </div>
      </template>
    </DataTable>

    <p class="mt-3 text-xs text-meridian-400">
      Showing {{ filteredRows.length }} of {{ facilities.length }} facilities
    </p>
  </DashboardLayout>
</template>