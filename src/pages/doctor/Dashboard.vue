<script setup>
import { ref, onMounted } from 'vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import StatCard from '@/components/cards/StatCard.vue'
import ChartCard from '@/components/cards/ChartCard.vue'
import BarChart from '@/components/charts/BarChart.vue'
import DoughnutChart from '@/components/charts/DoughnutChart.vue'
import DataTable from '@/components/tables/DataTable.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import BaseAvatar from '@/components/ui/BaseAvatar.vue'
import SkeletonCard from '@/components/skeletons/SkeletonCard.vue'
import { useAuthStore } from '@/stores/auth'
import appointments from '@/data/appointments.json'
import {
  CalendarDaysIcon, UsersIcon, ClipboardDocumentListIcon, ClockIcon,
} from '@heroicons/vue/24/outline'

const auth = useAuthStore()
const loading = ref(true)
onMounted(() => setTimeout(() => (loading.value = false), 600))

const todayQueue = appointments.filter((a) => a.date === '2026-08-08')
const columns = [
  { key: 'time', label: 'Time', sortable: true },
  { key: 'patient', label: 'Patient', sortable: true },
  { key: 'mode', label: 'Mode' },
  { key: 'status', label: 'Status' },
]

const statusTone = { confirmed: 'success', pending: 'warning', completed: 'info', cancelled: 'danger' }
</script>

<template>
  <DashboardLayout>
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 class="font-display text-2xl font-semibold text-meridian-900 dark:text-white">Good afternoon, {{ auth.user?.name }}</h1>
        <p class="text-sm text-meridian-500 dark:text-meridian-400 mt-1">Cardiology · {{ todayQueue.length }} patients on today's queue.</p>
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <template v-if="loading"><SkeletonCard v-for="i in 4" :key="i" /></template>
      <template v-else>
        <StatCard label="Today's appointments" value="9" delta="+2" tone="meridian"><template #icon><CalendarDaysIcon class="h-5 w-5" /></template></StatCard>
        <StatCard label="Active patients" value="184" delta="+6.1%" tone="meridian"><template #icon><UsersIcon class="h-5 w-5" /></template></StatCard>
        <StatCard label="Prescriptions issued" value="27" delta="+3" tone="pulse"><template #icon><ClipboardDocumentListIcon class="h-5 w-5" /></template></StatCard>
        <StatCard label="Avg. consult time" value="14m" delta="-1.2m" trend="down" tone="pulse"><template #icon><ClockIcon class="h-5 w-5" /></template></StatCard>
      </template>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
      <div class="lg:col-span-2">
        <ChartCard title="Patient visits" subtitle="Last 7 weeks">
          <BarChart :labels="['W1','W2','W3','W4','W5','W6','W7']" :datasets="[{ label: 'Visits', data: [34,41,38,52,47,60,55], color: '#0e7c66' }]" />
        </ChartCard>
      </div>
      <ChartCard title="Case mix" subtitle="Current caseload">
        <DoughnutChart :labels="['Cardiology follow-up','New patients','Post-op review','Chronic care']" :data="[45,20,15,20]" />
      </ChartCard>
    </div>

    <div class="card-base p-5 mb-2">
      <h3 class="font-display font-semibold text-meridian-900 dark:text-white mb-4">Today's queue</h3>
    </div>
    <DataTable :columns="columns" :rows="todayQueue" :loading="loading">
      <template #cell-patient="{ row }">
        <div class="flex items-center gap-2.5">
          <BaseAvatar :name="row.patient" size="sm" />
          <span class="font-medium text-meridian-800 dark:text-meridian-100">{{ row.patient }}</span>
        </div>
      </template>
      <template #cell-status="{ value }">
        <BaseBadge :tone="statusTone[value]">{{ value }}</BaseBadge>
      </template>
    </DataTable>
  </DashboardLayout>
</template>
