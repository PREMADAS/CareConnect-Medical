<script setup>
import { ref, onMounted } from 'vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import DataTable from '@/components/tables/DataTable.vue'
import BaseAvatar from '@/components/ui/BaseAvatar.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'

const loading = ref(true)
onMounted(() => setTimeout(() => (loading.value = false), 500))

const patients = ref([
  { id: 'usr_004', name: 'Elena Whitfield', age: 38, condition: 'Diabetes, Hypercholesterolemia', lastVisit: '2026-07-28', risk: 'moderate' },
  { id: 'usr_010', name: 'Jonah Petrov', age: 52, condition: 'Hypertension', lastVisit: '2026-08-02', risk: 'high' },
  { id: 'usr_011', name: 'Naomi Reyes', age: 29, condition: 'Asthma', lastVisit: '2026-08-04', risk: 'low' },
  { id: 'usr_012', name: 'Marcus Webb', age: 61, condition: 'Post-op cardiac review', lastVisit: '2026-08-05', risk: 'high' },
])
const columns = [
  { key: 'name', label: 'Patient', sortable: true },
  { key: 'age', label: 'Age', sortable: true },
  { key: 'condition', label: 'Primary condition' },
  { key: 'lastVisit', label: 'Last visit', sortable: true },
  { key: 'risk', label: 'Risk level' },
]
const riskTone = { high: 'danger', moderate: 'warning', low: 'success' }
</script>

<template>
  <DashboardLayout>
    <h1 class="font-display text-2xl font-semibold text-meridian-900 dark:text-white mb-1">My Patients</h1>
    <p class="text-sm text-meridian-500 dark:text-meridian-400 mb-6">Click a patient to view their full medical history and billing summary.</p>
    <DataTable :columns="columns" :rows="patients" :loading="loading" empty-title="No patients assigned yet">
      <template #cell-name="{ row }">
        <router-link :to="`/doctor/patients/${row.id}`" class="flex items-center gap-2.5 group w-fit">
          <BaseAvatar :name="row.name" size="sm" />
          <span class="font-medium text-meridian-800 dark:text-meridian-100 group-hover:text-meridian-600 dark:group-hover:text-white group-hover:underline">{{ row.name }}</span>
        </router-link>
      </template>
      <template #cell-risk="{ value }"><BaseBadge :tone="riskTone[value]" class="capitalize">{{ value }}</BaseBadge></template>
    </DataTable>
  </DashboardLayout>
</template>
