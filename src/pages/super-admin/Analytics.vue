<script setup>
import { ref, onMounted } from 'vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import ChartCard from '@/components/cards/ChartCard.vue'
import LineChart from '@/components/charts/LineChart.vue'
import BarChart from '@/components/charts/BarChart.vue'
import DoughnutChart from '@/components/charts/DoughnutChart.vue'
import StatCard from '@/components/cards/StatCard.vue'
import SkeletonCard from '@/components/skeletons/SkeletonCard.vue'
import { ChartBarIcon, UsersIcon, ClockIcon, ClipboardDocumentListIcon } from '@heroicons/vue/24/outline'

const loading = ref(true)
onMounted(() => setTimeout(() => (loading.value = false), 600))
</script>

<template>
  <DashboardLayout>
    <h1 class="font-display text-2xl font-semibold text-meridian-900 dark:text-white mb-6">Analytics</h1>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <template v-if="loading"><SkeletonCard v-for="i in 4" :key="i" /></template>
      <template v-else>
        <StatCard label="Avg. session length" value="6m 42s" delta="+8%" tone="meridian"><template #icon><ClockIcon class="h-5 w-5" /></template></StatCard>
        <StatCard label="Daily active users" value="4,209" delta="+3.1%" tone="meridian"><template #icon><UsersIcon class="h-5 w-5" /></template></StatCard>
        <StatCard label="Adherence rate" value="87.4%" delta="+2.4%" tone="pulse"><template #icon><ChartBarIcon class="h-5 w-5" /></template></StatCard>
        <StatCard label="Rx processed" value="48,920" delta="+15.7%" tone="pulse"><template #icon><ClipboardDocumentListIcon class="h-5 w-5" /></template></StatCard>
      </template>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
      <div class="lg:col-span-2">
        <ChartCard title="Platform-wide adherence" subtitle="12-month trend">
          <LineChart
            :labels="['Sep','Oct','Nov','Dec','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug']"
            :datasets="[{ label: 'Adherence %', data: [74,76,75,79,80,82,81,84,85,86,87,87.4], color: '#0e7c66' }]"
          />
        </ChartCard>
      </div>
      <ChartCard title="Traffic by role" subtitle="Active sessions">
        <DoughnutChart :labels="['Patients','Doctors','Pharmacists','Caretakers']" :data="[62,14,10,14]" />
      </ChartCard>
    </div>

    <ChartCard title="Prescriptions by specialty" subtitle="This quarter">
      <BarChart :labels="['Cardiology','Endocrinology','Respiratory','Psychiatry','General']" :datasets="[{ label: 'Rx count', data: [4200,3600,2100,1800,5400], color: '#ff6b5b' }]" horizontal />
    </ChartCard>
  </DashboardLayout>
</template>
