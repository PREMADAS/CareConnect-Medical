<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
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
    { key: 'all', label: 'Total', value: facilities.value.length, dot: 'bg-meridian-500' },
    { key: 'active', label: 'Active', value: count('active'), dot: 'bg-emerald-500' },
    { key: 'pending', label: 'Pending', value: count('pending'), dot: 'bg-amber-500' },
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

/* ---------- details modal ---------- */
const detailsOpen = ref(false)
const selected = ref(null)

function openDetails(f) {
  selected.value = f
  detailsOpen.value = true
}
function closeDetails() {
  detailsOpen.value = false
}

const onKey = (e) => e.key === 'Escape' && closeDetails()
watch(detailsOpen, (open) => {
  if (open) window.addEventListener('keydown', onKey)
  else window.removeEventListener('keydown', onKey)
})
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
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

    <!-- Status chips (click to filter by status) -->
    <div class="flex flex-wrap items-center gap-2 mb-4">
      <button
        v-for="s in stats"
        :key="s.key"
        type="button"
        @click="statusFilter = s.key"
        :class="[
          'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-meridian-500',
          statusFilter === s.key
            ? 'border-meridian-500 bg-meridian-50 dark:bg-white/10 text-meridian-900 dark:text-white'
            : 'border-meridian-200 dark:border-white/10 bg-white dark:bg-white/5 text-meridian-600 dark:text-meridian-200 hover:bg-meridian-50 dark:hover:bg-white/10',
        ]"
      >
        <span :class="['h-2 w-2 rounded-full', s.dot]" />
        {{ s.label }}
        <span class="text-xs tabular-nums text-meridian-400">{{ s.value }}</span>
      </button>
    </div>

    <!-- Toolbar: search + type chips -->
    <div class="flex flex-wrap items-center justify-between gap-3 mb-5">
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

    <!-- Loading skeleton -->
    <div v-if="loading" class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <div
        v-for="n in 6"
        :key="n"
        class="animate-pulse rounded-2xl border border-meridian-100 dark:border-white/10 bg-white dark:bg-white/5 p-5"
      >
        <div class="flex items-center gap-3">
          <div class="h-11 w-11 rounded-xl bg-meridian-100 dark:bg-white/10" />
          <div class="flex-1 space-y-2">
            <div class="h-3.5 w-2/3 rounded bg-meridian-100 dark:bg-white/10" />
            <div class="h-3 w-1/3 rounded bg-meridian-100 dark:bg-white/10" />
          </div>
        </div>
        <div class="mt-5 h-3 w-1/2 rounded bg-meridian-100 dark:bg-white/10" />
        <div class="mt-3 h-3 w-1/3 rounded bg-meridian-100 dark:bg-white/10" />
        <div class="mt-5 h-8 rounded-lg bg-meridian-100 dark:bg-white/10" />
      </div>
    </div>

    <!-- Empty state -->
    <div
      v-else-if="!filteredRows.length"
      class="flex flex-col items-center rounded-2xl border border-dashed border-meridian-200 dark:border-white/10 px-6 py-14 text-center"
    >
      <BuildingOffice2Icon class="h-10 w-10 text-meridian-400" />
      <h2 class="mt-3 font-medium text-meridian-800 dark:text-meridian-100">
        {{ hasFilters ? 'No facilities match your filters' : 'No facilities registered' }}
      </h2>
      <button v-if="hasFilters" type="button" @click="clearFilters" class="mt-4 text-sm font-medium text-meridian-600 hover:underline">
        Clear filters
      </button>
    </div>

    <!-- Facility cards -->
    <div v-else class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <article
        v-for="f in filteredRows"
        :key="f.id"
        class="flex flex-col rounded-2xl border border-meridian-100 dark:border-white/10 bg-white dark:bg-white/5 p-5 transition hover:border-meridian-300 dark:hover:border-white/25 hover:shadow-md"
        :class="{ 'opacity-75': f.status === 'suspended' }"
      >
        <!-- Identity -->
        <div class="flex items-start gap-3">
          <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-meridian-50 dark:bg-white/5 text-meridian-600 ring-1 ring-meridian-100 dark:ring-white/10">
            <component :is="typeIcon[f.type]" class="h-5 w-5" />
          </span>
          <div class="min-w-0 flex-1">
            <h3 class="font-medium text-meridian-900 dark:text-meridian-50 leading-snug">{{ f.name }}</h3>
            <p class="font-mono text-xs text-meridian-400">{{ f.id.toUpperCase() }}</p>
          </div>
          <BaseBadge :tone="statusTone[f.status]" class="shrink-0 capitalize">{{ f.status }}</BaseBadge>
        </div>

        <!-- Details -->
        <dl class="mt-5 space-y-2.5 text-sm">
          <div class="flex items-center justify-between gap-3">
            <dt class="text-meridian-500 dark:text-meridian-300">Type</dt>
            <dd>
              <span class="inline-flex items-center rounded-md bg-meridian-50 dark:bg-white/5 px-2 py-0.5 text-xs font-medium text-meridian-700 dark:text-meridian-200">
                {{ f.type }}
              </span>
            </dd>
          </div>
          <div class="flex items-start justify-between gap-3">
            <dt class="shrink-0 text-meridian-500 dark:text-meridian-300">Location</dt>
            <dd class="inline-flex items-start gap-1.5 text-right text-meridian-600 dark:text-meridian-200">
              <MapPinIcon class="mt-0.5 h-4 w-4 shrink-0 text-meridian-400" />
              <span class="break-words">{{ f.location }}</span>
            </dd>
          </div>
          <div class="flex items-center justify-between gap-3">
            <dt class="text-meridian-500 dark:text-meridian-300">Providers</dt>
            <dd class="inline-flex items-center gap-1.5 tabular-nums text-meridian-700 dark:text-meridian-100">
              <UsersIcon class="h-4 w-4 text-meridian-400" />{{ f.providers }}
            </dd>
          </div>
        </dl>

        <!-- Footer actions -->
        <div class="mt-5 flex items-center justify-end gap-1 border-t border-meridian-100 dark:border-white/10 pt-3">
          <button
            type="button"
            @click="openDetails(f)"
            class="rounded-lg p-2 text-meridian-400 transition hover:bg-meridian-50 dark:hover:bg-white/10 hover:text-meridian-700"
            :aria-label="`View ${f.name}`"
          >
            <EyeIcon class="h-5 w-5" />
          </button>
          <button
            type="button"
            class="rounded-lg p-2 text-meridian-400 transition hover:bg-meridian-50 dark:hover:bg-white/10 hover:text-meridian-700"
            :aria-label="`Edit ${f.name}`"
          >
            <PencilSquareIcon class="h-5 w-5" />
          </button>
        </div>
      </article>
    </div>

    <p class="mt-3 text-xs text-meridian-400">
      Showing {{ filteredRows.length }} of {{ facilities.length }} facilities
    </p>

    <!-- Details modal -->
    <Teleport to="body">
      <div
        v-if="detailsOpen && selected"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        :aria-label="`${selected.name} details`"
      >
        <div class="absolute inset-0 bg-black/50" @click="closeDetails" />

        <div class="relative w-full max-w-md rounded-2xl border border-meridian-100 dark:border-white/10 bg-white dark:bg-meridian-900 p-6 shadow-xl">
          <button
            type="button"
            @click="closeDetails"
            class="absolute right-3 top-3 rounded-full p-1.5 text-meridian-400 hover:text-meridian-700 dark:hover:text-white"
            aria-label="Close"
          >
            <XMarkIcon class="h-5 w-5" />
          </button>

          <div class="flex items-center gap-3 pr-8">
            <span class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-meridian-50 dark:bg-white/5 text-meridian-600 ring-1 ring-meridian-100 dark:ring-white/10">
              <component :is="typeIcon[selected.type]" class="h-6 w-6" />
            </span>
            <div class="min-w-0">
              <h2 class="font-display text-lg font-semibold text-meridian-900 dark:text-white leading-snug">{{ selected.name }}</h2>
              <p class="font-mono text-xs text-meridian-400">{{ selected.id.toUpperCase() }}</p>
            </div>
          </div>

          <dl class="mt-6 divide-y divide-meridian-100 dark:divide-white/10 text-sm">
            <div class="flex items-center justify-between gap-4 py-3">
              <dt class="text-meridian-500 dark:text-meridian-300">Status</dt>
              <dd><BaseBadge :tone="statusTone[selected.status]" class="capitalize">{{ selected.status }}</BaseBadge></dd>
            </div>
            <div class="flex items-center justify-between gap-4 py-3">
              <dt class="text-meridian-500 dark:text-meridian-300">Type</dt>
              <dd class="font-medium text-meridian-800 dark:text-meridian-100">{{ selected.type }}</dd>
            </div>
            <div class="flex items-start justify-between gap-4 py-3">
              <dt class="shrink-0 text-meridian-500 dark:text-meridian-300">Location</dt>
              <dd class="inline-flex items-start gap-1.5 text-right font-medium text-meridian-800 dark:text-meridian-100">
                <MapPinIcon class="mt-0.5 h-4 w-4 shrink-0 text-meridian-400" />
                <span class="break-words">{{ selected.location }}</span>
              </dd>
            </div>
            <div class="flex items-center justify-between gap-4 py-3">
              <dt class="text-meridian-500 dark:text-meridian-300">Providers</dt>
              <dd class="inline-flex items-center gap-1.5 font-medium tabular-nums text-meridian-800 dark:text-meridian-100">
                <UsersIcon class="h-4 w-4 text-meridian-400" />{{ selected.providers }}
              </dd>
            </div>
            <div class="flex items-center justify-between gap-4 py-3">
              <dt class="text-meridian-500 dark:text-meridian-300">Facility ID</dt>
              <dd class="font-mono text-meridian-800 dark:text-meridian-100">{{ selected.id.toUpperCase() }}</dd>
            </div>
          </dl>

          <div class="mt-6 flex justify-end">
            <BaseButton @click="closeDetails">Close</BaseButton>
          </div>
        </div>
      </div>
    </Teleport>
  </DashboardLayout>
</template>