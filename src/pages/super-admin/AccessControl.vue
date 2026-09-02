<script setup>
import { ref } from 'vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import ToggleSwitch from '@/components/forms/ToggleSwitch.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import { useUiStore } from '@/stores/ui'
import { ShieldCheckIcon } from '@heroicons/vue/24/outline'

const ui = useUiStore()

const roles = ref([
  {
    name: 'Doctor', color: 'info',
    permissions: [
      { key: 'issue_rx', label: 'Issue prescriptions', enabled: true },
      { key: 'view_records', label: 'View patient records', enabled: true },
      { key: 'manage_appointments', label: 'Manage appointments', enabled: true },
      { key: 'export_reports', label: 'Export reports', enabled: false },
    ],
  },
  {
    name: 'Pharmacist', color: 'success',
    permissions: [
      { key: 'fulfill_rx', label: 'Fulfill prescriptions', enabled: true },
      { key: 'manage_inventory', label: 'Manage inventory', enabled: true },
      { key: 'view_records', label: 'View patient records', enabled: false },
      { key: 'scan_qr', label: 'Scan prescription QR', enabled: true },
    ],
  },
  {
    name: 'Caretaker', color: 'neutral',
    permissions: [
      { key: 'view_schedule', label: 'View care recipient schedule', enabled: true },
      { key: 'log_doses', label: 'Log doses on behalf of recipient', enabled: true },
      { key: 'book_appointments', label: 'Book appointments', enabled: true },
      { key: 'view_prescriptions', label: 'View prescriptions', enabled: false },
    ],
  },
])

function toggle(role, perm) {
  ui.toast({ type: 'success', title: 'Permission updated', message: `${perm.label} ${perm.enabled ? 'enabled' : 'disabled'} for ${role.name}s.` })
}
</script>

<template>
  <DashboardLayout>
    <div class="flex items-center gap-2.5 mb-1">
      <ShieldCheckIcon class="h-6 w-6 text-meridian-600" />
      <h1 class="font-display text-2xl font-semibold text-meridian-900 dark:text-white">Access Control</h1>
    </div>
    <p class="text-sm text-meridian-500 dark:text-meridian-400 mb-6">Manage role-based permissions across CareConnect.</p>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div v-for="role in roles" :key="role.name" class="card-base p-5">
        <div class="flex items-center justify-between mb-3">
          <h3 class="font-display font-semibold text-meridian-900 dark:text-white">{{ role.name }}</h3>
          <BaseBadge :tone="role.color">{{ role.permissions.filter(p=>p.enabled).length }}/{{ role.permissions.length }}</BaseBadge>
        </div>
        <div class="divide-y divide-meridian-100 dark:divide-white/5">
          <ToggleSwitch v-for="perm in role.permissions" :key="perm.key" v-model="perm.enabled" :label="perm.label" @update:model-value="toggle(role, perm)" />
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>
