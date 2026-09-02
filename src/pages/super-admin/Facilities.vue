<script setup>
import { ref, onMounted } from 'vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import DataTable from '@/components/tables/DataTable.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { BuildingOffice2Icon, PlusIcon } from '@heroicons/vue/24/outline'

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
]
const statusTone = { active: 'success', pending: 'warning', suspended: 'danger' }
</script>

<template>
  <DashboardLayout>
    <div class="flex items-center justify-between mb-6">
      <h1 class="font-display text-2xl font-semibold text-meridian-900 dark:text-white">Facilities</h1>
      <BaseButton><template #icon-left><PlusIcon class="h-5 w-5" /></template>Add facility</BaseButton>
    </div>
    <DataTable :columns="columns" :rows="facilities" :loading="loading" empty-title="No facilities registered">
      <template #cell-name="{ row }">
        <div class="flex items-center gap-2.5">
          <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-meridian-50 dark:bg-white/5 text-meridian-600"><BuildingOffice2Icon class="h-5 w-5" /></span>
          <span class="font-medium text-meridian-800 dark:text-meridian-100">{{ row.name }}</span>
        </div>
      </template>
      <template #cell-status="{ value }"><BaseBadge :tone="statusTone[value]">{{ value }}</BaseBadge></template>
    </DataTable>
  </DashboardLayout>
</template>
