<script setup>
import { ref, computed, onMounted } from 'vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import BaseAvatar from '@/components/ui/BaseAvatar.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import ConfirmModal from '@/components/modals/ConfirmModal.vue'
import { useUiStore } from '@/stores/ui'
import usersData from '@/data/users.json'
import {
  MagnifyingGlassIcon,
  UserPlusIcon,
  EnvelopeIcon,
  PhoneIcon,
  XMarkIcon,
  ShieldCheckIcon,
  UsersIcon,
} from '@heroicons/vue/24/outline'

const ui = useUiStore()
const loading = ref(true)
onMounted(() => setTimeout(() => (loading.value = false), 500))

const users = ref(usersData.map(({ password, ...u }) => u))

/* ---------- filters ---------- */
const search = ref('')
const roleFilter = ref('')
const statusFilter = ref('')

const roles = [
  { label: 'All roles', value: '' },
  { label: 'Super Admin', value: 'super-admin' },
  { label: 'Doctor', value: 'doctor' },
  { label: 'Pharmacist', value: 'pharmacist' },
  { label: 'Patient', value: 'patient' },
  { label: 'Caretaker', value: 'caretaker' },
]

const statusTone = { active: 'success', suspended: 'danger', pending: 'warning' }
const formatRole = (r) => r.replace('-', ' ')

const statusTiles = computed(() => [
  { label: 'Total users', value: '', count: users.value.length },
  { label: 'Active', value: 'active', count: users.value.filter((u) => u.status === 'active').length },
  { label: 'Pending', value: 'pending', count: users.value.filter((u) => u.status === 'pending').length },
  { label: 'Suspended', value: 'suspended', count: users.value.filter((u) => u.status === 'suspended').length },
])

const roleCount = (value) =>
  value ? users.value.filter((u) => u.role === value).length : users.value.length

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  return users.value
    .filter((u) => {
      const matchesSearch = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
      const matchesRole = !roleFilter.value || u.role === roleFilter.value
      const matchesStatus = !statusFilter.value || u.status === statusFilter.value
      return matchesSearch && matchesRole && matchesStatus
    })
    .sort((a, b) => a.name.localeCompare(b.name))
})

const hasFilters = computed(() => search.value || roleFilter.value || statusFilter.value)
function clearFilters() {
  search.value = ''
  roleFilter.value = ''
  statusFilter.value = ''
}

/* ---------- suspend / reactivate ---------- */
const suspendOpen = ref(false)
const toSuspend = ref(null)
const suspending = ref(false)

function askSuspend(row) {
  toSuspend.value = row
  suspendOpen.value = true
}
async function confirmSuspend() {
  suspending.value = true
  await new Promise((r) => setTimeout(r, 500))
  const next = toSuspend.value.status === 'suspended' ? 'active' : 'suspended'
  toSuspend.value.status = next
  suspending.value = false
  suspendOpen.value = false
  ui.toast({
    type: 'info',
    title: next === 'suspended' ? 'User suspended' : 'User reactivated',
  })
}
</script>

<template>
  <DashboardLayout>
    <!-- Header -->
    <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 class="font-display text-2xl font-semibold text-meridian-900 dark:text-white">Users</h1>
        <p class="mt-1 text-sm text-meridian-500">Manage who can access the platform and what role they hold.</p>
      </div>
     
    </div>

    <!-- Status tiles (click to filter) -->
    <div class="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
      <button
        v-for="tile in statusTiles"
        :key="tile.label"
        type="button"
        :aria-pressed="statusFilter === tile.value"
        @click="statusFilter = tile.value"
        class="rounded-xl border bg-white/70 p-4 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-pulse-400/60 dark:bg-white/5"
        :class="
          statusFilter === tile.value
            ? 'border-pulse-400 ring-1 ring-pulse-400/50'
            : 'border-meridian-200 hover:border-meridian-400 dark:border-white/10 dark:hover:border-white/25'
        "
      >
        <p class="text-2xl font-semibold tabular-nums text-meridian-900 dark:text-white">{{ tile.count }}</p>
        <p class="mt-0.5 text-sm text-meridian-500">{{ tile.label }}</p>
      </button>
    </div>

    <!-- Search + role chips -->
    <div class="mb-5 space-y-3">
      <div class="relative">
        <MagnifyingGlassIcon class="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-meridian-400" />
        <input
          v-model="search"
          type="search"
          placeholder="Search by name or email…"
          class="w-full rounded-lg border border-meridian-200 bg-white/60 py-2.5 pl-10 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-pulse-400/60 dark:border-white/10 dark:bg-white/5 [&::-webkit-search-cancel-button]:hidden"
        />
        <button
          v-if="search"
          type="button"
          aria-label="Clear search"
          @click="search = ''"
          class="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-meridian-400 hover:text-meridian-600"
        >
          <XMarkIcon class="h-4 w-4" />
        </button>
      </div>

      <div class="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        <button
          v-for="r in roles"
          :key="r.value"
          type="button"
          :aria-pressed="roleFilter === r.value"
          @click="roleFilter = r.value"
          class="shrink-0 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-pulse-400/60"
          :class="
            roleFilter === r.value
              ? 'border-pulse-600 bg-pulse-600 text-white'
              : 'border-meridian-200 bg-white/60 text-meridian-600 hover:border-meridian-400 dark:border-white/10 dark:bg-white/5 dark:text-meridian-100'
          "
        >
          {{ r.label }}
          <span class="ml-1 tabular-nums" :class="roleFilter === r.value ? 'text-white/80' : 'text-meridian-400'">{{ roleCount(r.value) }}</span>
        </button>
      </div>
    </div>

    <!-- Result line -->
    <div v-if="!loading" class="mb-4 flex items-center justify-between text-sm text-meridian-500">
      <p>Showing {{ filtered.length }} of {{ users.length }} users</p>
      <button v-if="hasFilters" type="button" @click="clearFilters" class="font-medium text-pulse-600 hover:text-pulse-700">
        Clear filters
      </button>
    </div>

    <!-- Loading skeleton -->
    <div v-if="loading" class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <div
        v-for="n in 6"
        :key="n"
        class="animate-pulse rounded-2xl border border-meridian-200 bg-white/70 p-5 dark:border-white/10 dark:bg-white/5"
      >
        <div class="flex items-center gap-3">
          <div class="h-12 w-12 rounded-full bg-meridian-200 dark:bg-white/10" />
          <div class="flex-1 space-y-2">
            <div class="h-3.5 w-2/3 rounded bg-meridian-200 dark:bg-white/10" />
            <div class="h-3 w-1/2 rounded bg-meridian-200 dark:bg-white/10" />
          </div>
        </div>
        <div class="mt-5 h-3 w-1/3 rounded bg-meridian-200 dark:bg-white/10" />
        <div class="mt-3 h-3 w-1/2 rounded bg-meridian-200 dark:bg-white/10" />
        <div class="mt-5 h-9 rounded-lg bg-meridian-200 dark:bg-white/10" />
      </div>
    </div>

    <!-- Empty state -->
    <div
      v-else-if="!filtered.length"
      class="flex flex-col items-center rounded-2xl border border-dashed border-meridian-200 px-6 py-14 text-center dark:border-white/10"
    >
      <UsersIcon class="h-10 w-10 text-meridian-400" />
      <h2 class="mt-3 font-medium text-meridian-800 dark:text-meridian-100">No users found</h2>
      <p class="mt-1 max-w-xs text-sm text-meridian-500">Try a different name or email, or remove a filter.</p>
      <button type="button" @click="clearFilters" class="mt-4 text-sm font-medium text-pulse-600 hover:text-pulse-700">
        Clear filters
      </button>
    </div>

    <!-- User cards -->
    <div v-else class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <article
        v-for="u in filtered"
        :key="u.email"
        class="flex flex-col rounded-2xl border border-meridian-200 bg-white/70 p-5 transition hover:border-meridian-400 hover:shadow-md dark:border-white/10 dark:bg-white/5 dark:hover:border-white/25"
        :class="{ 'opacity-75': u.status === 'suspended' }"
      >
        <!-- Identity -->
        <div class="flex items-start gap-3">
          <BaseAvatar :src="u.avatar" :name="u.name" size="lg" />
          <div class="min-w-0 flex-1">
            <h3 class="truncate font-medium text-meridian-800 dark:text-meridian-100">{{ u.name }}</h3>
            <p class="truncate text-sm text-meridian-500">{{ u.email }}</p>
          </div>
          <BaseBadge :tone="statusTone[u.status]" class="shrink-0">{{ u.status }}</BaseBadge>
        </div>

        <!-- Details -->
        <dl class="mt-5 space-y-2.5 text-sm">
          <div class="flex items-center justify-between gap-3">
            <dt class="text-meridian-500">Role</dt>
            <dd>
              <span class="rounded-md bg-meridian-100/70 px-2 py-0.5 font-medium capitalize text-meridian-700 dark:bg-white/10 dark:text-meridian-100">
                {{ formatRole(u.role) }}
              </span>
            </dd>
          </div>
          <div class="flex items-center justify-between gap-3">
            <dt class="text-meridian-500">Phone</dt>
            <dd class="truncate text-meridian-700 dark:text-meridian-100">{{ u.phone || '—' }}</dd>
          </div>
        </dl>

        <!-- Footer actions -->
        <div class="mt-5 flex items-center gap-2 border-t border-meridian-200 pt-4 dark:border-white/10">
          <a
            :href="`mailto:${u.email}`"
            aria-label="Send email"
            class="rounded-lg border border-meridian-200 p-2 text-meridian-500 transition hover:text-meridian-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-pulse-400/60 dark:border-white/10"
          >
            <EnvelopeIcon class="h-4 w-4" />
          </a>
          <a
            v-if="u.phone"
            :href="`tel:${u.phone}`"
            aria-label="Call user"
            class="rounded-lg border border-meridian-200 p-2 text-meridian-500 transition hover:text-meridian-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-pulse-400/60 dark:border-white/10"
          >
            <PhoneIcon class="h-4 w-4" />
          </a>

          <span v-if="u.role === 'super-admin'" class="ml-auto inline-flex items-center gap-1.5 text-xs text-meridian-500">
            <ShieldCheckIcon class="h-4 w-4" /> Protected account
          </span>
          <button
            v-else
            type="button"
            @click="askSuspend(u)"
            class="ml-auto rounded-lg px-3 py-2 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-pulse-400/60"
            :class="
              u.status === 'suspended'
                ? 'text-meridian-600 hover:bg-meridian-100/70 dark:hover:bg-white/10'
                : 'text-pulse-600 hover:bg-pulse-400/10 hover:text-pulse-700'
            "
          >
            {{ u.status === 'suspended' ? 'Reactivate' : 'Suspend' }}
          </button>
        </div>
      </article>
    </div>

    <ConfirmModal
      v-model="suspendOpen"
      :title="toSuspend?.status === 'suspended' ? 'Reactivate user?' : 'Suspend user?'"
      :message="`This will ${toSuspend?.status === 'suspended' ? 're-enable' : 'revoke'} access for ${toSuspend?.name}.`"
      :confirm-label="toSuspend?.status === 'suspended' ? 'Reactivate' : 'Suspend'"
      :variant="toSuspend?.status === 'suspended' ? 'primary' : 'danger'"
      :loading="suspending"
      @confirm="confirmSuspend"
    />
  </DashboardLayout>
</template>