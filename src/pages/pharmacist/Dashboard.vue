<script setup>
import { ref, onMounted } from 'vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import StatCard from '@/components/cards/StatCard.vue'
import ChartCard from '@/components/cards/ChartCard.vue'
import LineChart from '@/components/charts/LineChart.vue'
import DataTable from '@/components/tables/DataTable.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import SkeletonCard from '@/components/skeletons/SkeletonCard.vue'
import { useAuthStore } from '@/stores/auth'
import prescriptions from '@/data/prescriptions.json'
import medicines from '@/data/medicines.json'
import {
  ClipboardDocumentListIcon, BeakerIcon, ExclamationTriangleIcon, QrCodeIcon,
} from '@heroicons/vue/24/outline'

const auth = useAuthStore()
const loading = ref(true)
onMounted(() => setTimeout(() => (loading.value = false), 600))

const queue = prescriptions.filter((p) => p.status === 'pending' || p.status === 'active')
const lowStock = medicines.filter((m) => m.stock < 20)

const columns = [
  { key: 'id', label: 'Rx ID', sortable: true },
  { key: 'patient', label: 'Patient', sortable: true },
  { key: 'doctor', label: 'Doctor' },
  { key: 'status', label: 'Status' },
]
const statusTone = { active: 'info', pending: 'warning', fulfilled: 'success', expired: 'danger' }
</script>

<template>
  <DashboardLayout>
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 class="font-display text-2xl font-semibold text-meridian-900 dark:text-white">Welcome, {{ auth.user?.name }}</h1>
        <p class="text-sm text-meridian-500 dark:text-meridian-400 mt-1">{{ auth.user?.pharmacy }}</p>
      </div>
      <router-link to="/pharmacist/scan" class="inline-flex items-center gap-2 rounded-lg bg-meridian-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-meridian-700 btn-focus-ring">
        <QrCodeIcon class="h-5 w-5" /> Scan prescription
      </router-link>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <template v-if="loading"><SkeletonCard v-for="i in 4" :key="i" /></template>
      <template v-else>
        <StatCard label="Pending fulfillment" :value="queue.length" tone="pulse"><template #icon><ClipboardDocumentListIcon class="h-5 w-5" /></template></StatCard>
        <StatCard label="SKUs in inventory" :value="medicines.length * 34" delta="+2.4%" tone="meridian"><template #icon><BeakerIcon class="h-5 w-5" /></template></StatCard>
        <StatCard label="Low stock alerts" :value="lowStock.length" tone="pulse"><template #icon><ExclamationTriangleIcon class="h-5 w-5" /></template></StatCard>
        <StatCard label="Dispensed today" value="63" delta="+11%" tone="meridian"><template #icon><ClipboardDocumentListIcon class="h-5 w-5" /></template></StatCard>
      </template>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
      <div class="lg:col-span-2">
        <ChartCard title="Dispensing volume" subtitle="Prescriptions fulfilled, last 7 days">
          <LineChart :labels="['Mon','Tue','Wed','Thu','Fri','Sat','Sun']" :datasets="[{ label: 'Fulfilled', data: [42,55,48,63,58,39,44], color: '#ff6b5b' }]" />
        </ChartCard>
      </div>
      <div class="card-base p-5">
        <h3 class="font-display font-semibold text-meridian-900 dark:text-white mb-4">Low stock</h3>
        <ul class="space-y-3">
          <li v-for="m in lowStock" :key="m.id" class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-meridian-800 dark:text-meridian-100">{{ m.name }}</p>
              <p class="text-xs text-meridian-500">{{ m.strength }} · {{ m.form }}</p>
            </div>
            <BaseBadge tone="danger">{{ m.stock }} left</BaseBadge>
          </li>
        </ul>
      </div>
    </div>

    <div class="card-base p-5 mb-2">
      <h3 class="font-display font-semibold text-meridian-900 dark:text-white">Fulfillment queue</h3>
    </div>
    <DataTable :columns="columns" :rows="queue" :loading="loading">
      <template #cell-status="{ value }"><BaseBadge :tone="statusTone[value]">{{ value }}</BaseBadge></template>
    </DataTable>
  </DashboardLayout>
</template>
