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
  PhoneIcon,
  XMarkIcon,
  UsersIcon,
} from '@heroicons/vue/24/outline'

const ui = useUiStore()
const loading = ref(true)
onMounted(() => setTimeout(() => (loading.value = false), 500))

// super-admin ke puro remove kora hoyeche
const users = ref(
  usersData
    .filter((u) => u.role !== 'super-admin')
    .map(({ password, ...u }) => u)
)

/* ---------- filters ---------- */
const search = ref('')
const roleFilter = ref('')
const statusFilter = ref('')

const roles = [
  { label: 'All roles', value: '' },
  { label: 'Doctor', value: 'doctor' },
  { label: 'Pharmacist', value: 'pharmacist' },
  { label: 'Patient', value: 'patient' },
  { label: 'Caretaker', value: 'caretaker' },
]

const statusTone = { active: 'success', suspended: 'danger', pending: 'warning' }
const formatRole = (r) => r.replace('-', ' ')
const whatsappLink = (phone) => `https://wa.me/${String(phone).replace(/\D/g, '')}`

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
        <div class="flex flex-col items-center gap-3">
          <div class="h-16 w-16 rounded-full bg-meridian-200 dark:bg-white/10" />
          <div class="h-3.5 w-1/2 rounded bg-meridian-200 dark:bg-white/10" />
          <div class="h-3 w-2/3 rounded bg-meridian-200 dark:bg-white/10" />
        </div>
        <div class="mt-5 h-3 w-1/3 rounded bg-meridian-200 dark:bg-white/10" />
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
        :key="u.id ?? u.email"
        class="relative flex flex-col rounded-2xl border border-meridian-200 bg-white/70 p-5 transition hover:border-meridian-400 hover:shadow-md dark:border-white/10 dark:bg-white/5 dark:hover:border-white/25"
        :class="{ 'opacity-75': u.status === 'suspended' }"
      >
        <!-- Status badge (top right) -->
        <BaseBadge :tone="statusTone[u.status]" class="absolute right-4 top-4">{{ u.status }}</BaseBadge>

        <!-- Identity (center) -->
        <div class="flex flex-col items-center pt-2 text-center">
          <BaseAvatar :src="u.avatar" :name="u.name" size="lg" />
          <h3 class="mt-3 font-medium text-meridian-800 dark:text-meridian-100">{{ u.name }}</h3>
          <p v-if="u.id" class="text-xs tabular-nums text-meridian-400">ID: {{ u.id }}</p>
          <p class="mt-1 break-all text-sm text-meridian-500">{{ u.email }}</p>

          <!-- Profession -->
          <span class="mt-3 rounded-md bg-meridian-100/70 px-2.5 py-0.5 text-sm font-medium capitalize text-meridian-700 dark:bg-white/10 dark:text-meridian-100">
            {{ formatRole(u.role) }}
          </span>
        </div>

        <!-- Details -->
        <dl class="mt-5 text-sm">
          <div class="flex items-center justify-between gap-3">
            <dt class="text-meridian-500">Phone</dt>
            <dd class="truncate text-meridian-700 dark:text-meridian-100">{{ u.phone || '—' }}</dd>
          </div>
        </dl>

        <!-- Footer actions -->
        <div class="mt-5 flex items-center gap-2 border-t border-meridian-200 pt-4 dark:border-white/10">
          <template v-if="u.phone">
            <!-- WhatsApp -->
            <a
              :href="whatsappLink(u.phone)"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Chat on WhatsApp"
              class="rounded-lg border border-meridian-200 p-2 text-meridian-500 transition hover:text-meridian-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-pulse-400/60 dark:border-white/10"
            >
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
            </a>
            <!-- Call -->
            <a
              :href="`tel:${u.phone}`"
              aria-label="Call user"
              class="rounded-lg border border-meridian-200 p-2 text-meridian-500 transition hover:text-meridian-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-pulse-400/60 dark:border-white/10"
            >
              <PhoneIcon class="h-4 w-4" />
            </a>
          </template>

          <button
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