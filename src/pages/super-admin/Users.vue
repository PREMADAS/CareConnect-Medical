<script setup>
import { ref, computed, onMounted } from 'vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import DataTable from '@/components/tables/DataTable.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import BaseAvatar from '@/components/ui/BaseAvatar.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseSelect from '@/components/forms/BaseSelect.vue'
import BaseInput from '@/components/forms/BaseInput.vue'
import ConfirmModal from '@/components/modals/ConfirmModal.vue'
import { useUiStore } from '@/stores/ui'
import usersData from '@/data/users.json'
import { MagnifyingGlassIcon, UserPlusIcon } from '@heroicons/vue/24/outline'

const ui = useUiStore()
const loading = ref(true)
onMounted(() => setTimeout(() => (loading.value = false), 500))

const users = ref(usersData.map(({ password, ...u }) => u))
const search = ref('')
const roleFilter = ref('')
const suspendOpen = ref(false)
const toSuspend = ref(null)
const suspending = ref(false)

const roleOptions = [
  { label: 'All roles', value: '' },
  { label: 'Super Admin', value: 'super-admin' },
  { label: 'Doctor', value: 'doctor' },
  { label: 'Pharmacist', value: 'pharmacist' },
  { label: 'Patient', value: 'patient' },
  { label: 'Caretaker', value: 'caretaker' },
]

const columns = [
  { key: 'name', label: 'User', sortable: true },
  { key: 'role', label: 'Role', sortable: true },
  { key: 'phone', label: 'Phone' },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: '' },
]
const statusTone = { active: 'success', suspended: 'danger', pending: 'warning' }

const filtered = computed(() =>
  users.value.filter((u) => {
    const matchesSearch = u.name.toLowerCase().includes(search.value.toLowerCase()) || u.email.toLowerCase().includes(search.value.toLowerCase())
    const matchesRole = !roleFilter.value || u.role === roleFilter.value
    return matchesSearch && matchesRole
  })
)

function askSuspend(row) {
  toSuspend.value = row
  suspendOpen.value = true
}
async function confirmSuspend() {
  suspending.value = true
  await new Promise((r) => setTimeout(r, 500))
  toSuspend.value.status = toSuspend.value.status === 'suspended' ? 'active' : 'suspended'
  suspending.value = false
  suspendOpen.value = false
  ui.toast({ type: 'info', title: `User ${toSuspend.value.status}` })
}
</script>

<template>
  <DashboardLayout>
    <div class="flex items-center justify-between mb-6">
      <h1 class="font-display text-2xl font-semibold text-meridian-900 dark:text-white">Users</h1>
      <BaseButton><template #icon-left><UserPlusIcon class="h-5 w-5" /></template>Invite user</BaseButton>
    </div>

    <div class="flex flex-col sm:flex-row gap-3 mb-5">
      <div class="relative flex-1">
        <MagnifyingGlassIcon class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-meridian-400" />
        <input v-model="search" type="search" placeholder="Search by name or email…" class="w-full rounded-lg border border-meridian-200 dark:border-white/10 bg-white/60 dark:bg-white/5 py-2.5 pl-10 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-pulse-400/60" />
      </div>
      <div class="w-full sm:w-56">
        <BaseSelect v-model="roleFilter" :options="roleOptions" placeholder="Filter by role" />
      </div>
    </div>

    <DataTable :columns="columns" :rows="filtered" :loading="loading" empty-title="No users found" empty-message="Try adjusting your search or filters.">
      <template #cell-name="{ row }">
        <div class="flex items-center gap-2.5">
          <BaseAvatar :src="row.avatar" :name="row.name" size="sm" />
          <div>
            <p class="font-medium text-meridian-800 dark:text-meridian-100">{{ row.name }}</p>
            <p class="text-xs text-meridian-500">{{ row.email }}</p>
          </div>
        </div>
      </template>
      <template #cell-role="{ value }"><span class="capitalize">{{ value.replace('-', ' ') }}</span></template>
      <template #cell-status="{ value }"><BaseBadge :tone="statusTone[value]">{{ value }}</BaseBadge></template>
      <template #cell-actions="{ row }">
        <button @click="askSuspend(row)" class="text-xs font-medium" :class="row.status === 'suspended' ? 'text-meridian-600 hover:text-meridian-700' : 'text-pulse-600 hover:text-pulse-700'">
          {{ row.status === 'suspended' ? 'Reactivate' : 'Suspend' }}
        </button>
      </template>
    </DataTable>

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
