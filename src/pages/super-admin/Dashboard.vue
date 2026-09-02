<script setup>
import { ref, onMounted } from 'vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import StatCard from '@/components/cards/StatCard.vue'
import ChartCard from '@/components/cards/ChartCard.vue'
import LineChart from '@/components/charts/LineChart.vue'
import DoughnutChart from '@/components/charts/DoughnutChart.vue'
import SkeletonCard from '@/components/skeletons/SkeletonCard.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import { useAuthStore } from '@/stores/auth'
import {
  UsersIcon, BuildingOffice2Icon, ClipboardDocumentListIcon, ShieldExclamationIcon,
} from '@heroicons/vue/24/outline'

const auth = useAuthStore()
const loading = ref(true)
onMounted(() => setTimeout(() => (loading.value = false), 600))

const roleSplit = [
  { role: 'Patients', count: '12,480', tone: 'meridian' },
  { role: 'Doctors', count: '640', tone: 'pulse' },
  { role: 'Pharmacists', count: '312', tone: 'meridian' },
  { role: 'Caretakers', count: '2,105', tone: 'pulse' },
]
</script>

<template>
  <DashboardLayout>
    <div class="mb-6">
      <h1 class="font-display text-2xl font-semibold text-meridian-900 dark:text-white">Platform overview</h1>
      <p class="text-sm text-meridian-500 dark:text-meridian-400 mt-1">Welcome back, {{ auth.user?.name }}. Here's how CareConnect is performing.</p>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <template v-if="loading"><SkeletonCard v-for="i in 4" :key="i" /></template>
      <template v-else>
        <StatCard label="Total users" value="15,537" delta="+8.3%" tone="meridian"><template #icon><UsersIcon class="h-5 w-5" /></template></StatCard>
        <StatCard label="Connected facilities" value="214" delta="+12" tone="meridian"><template #icon><BuildingOffice2Icon class="h-5 w-5" /></template></StatCard>
        <StatCard label="Prescriptions this month" value="48,920" delta="+15.7%" tone="pulse"><template #icon><ClipboardDocumentListIcon class="h-5 w-5" /></template></StatCard>
        <StatCard label="Flagged security events" value="3" trend="down" delta="-2" tone="pulse"><template #icon><ShieldExclamationIcon class="h-5 w-5" /></template></StatCard>
      </template>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
      <div class="lg:col-span-2">
        <ChartCard title="Platform growth" subtitle="New accounts by month">
          <LineChart
            :labels="['Feb','Mar','Apr','May','Jun','Jul','Aug']"
            :datasets="[
              { label: 'Patients', data: [820,910,1040,1180,1350,1520,1690], color: '#0e7c66' },
              { label: 'Providers', data: [60,72,80,95,110,128,142], color: '#ff6b5b' },
            ]"
          />
        </ChartCard>
      </div>
      <ChartCard title="User distribution" subtitle="By role">
        <DoughnutChart :labels="['Patients','Caretakers','Doctors','Pharmacists']" :data="[12480, 2105, 640, 312]" />
      </ChartCard>
    </div>

    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div v-for="r in roleSplit" :key="r.role" class="card-base p-4 text-center">
        <p class="font-display text-xl font-semibold text-meridian-900 dark:text-white">{{ r.count }}</p>
        <BaseBadge :tone="r.tone === 'pulse' ? 'danger' : 'neutral'" class="mt-2">{{ r.role }}</BaseBadge>
      </div>
    </div>
  </DashboardLayout>
</template>
