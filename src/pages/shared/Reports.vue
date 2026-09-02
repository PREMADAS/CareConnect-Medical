<script setup>
import { ref, onMounted } from 'vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import ChartCard from '@/components/cards/ChartCard.vue'
import BarChart from '@/components/charts/BarChart.vue'
import LineChart from '@/components/charts/LineChart.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import SkeletonCard from '@/components/skeletons/SkeletonCard.vue'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'
import { ArrowDownTrayIcon, DocumentTextIcon } from '@heroicons/vue/24/outline'

const auth = useAuthStore()
const ui = useUiStore()
const loading = ref(true)
onMounted(() => setTimeout(() => (loading.value = false), 600))

const reports = [
  { id: 1, name: 'Monthly adherence summary', period: 'July 2026', size: '212 KB', type: 'PDF' },
  { id: 2, name: 'Prescription activity log', period: 'Q2 2026', size: '480 KB', type: 'CSV' },
  { id: 3, name: 'Patient outcomes report', period: 'H1 2026', size: '1.1 MB', type: 'PDF' },
]

function download(r) {
  ui.toast({ type: 'success', title: 'Export started', message: `Preparing ${r.name}.${r.type.toLowerCase()}` })
}
</script>

<template>
  <DashboardLayout>
    <div class="flex items-center justify-between mb-6">
      <h1 class="font-display text-2xl font-semibold text-meridian-900 dark:text-white">Reports</h1>
      <BaseButton variant="outline"><template #icon-left><ArrowDownTrayIcon class="h-5 w-5" /></template>Export all</BaseButton>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
      <template v-if="loading"><SkeletonCard v-for="i in 2" :key="i" /></template>
      <template v-else>
        <ChartCard title="Outcomes trend" subtitle="Last 6 months">
          <LineChart :labels="['Mar','Apr','May','Jun','Jul','Aug']" :datasets="[{ label: 'Adherence %', data: [78,82,80,88,91,93], color: '#0e7c66' }]" />
        </ChartCard>
        <ChartCard title="Volume by category" subtitle="This quarter">
          <BarChart :labels="['Diabetes','Cardio','Respiratory','Mental Health']" :datasets="[{ label: 'Cases', data: [420, 310, 180, 240], color: '#ff6b5b' }]" />
        </ChartCard>
      </template>
    </div>

    <div class="card-base divide-y divide-meridian-100 dark:divide-white/5">
      <div v-for="r in reports" :key="r.id" class="flex items-center justify-between p-5">
        <div class="flex items-center gap-3">
          <span class="flex h-10 w-10 items-center justify-center rounded-xl bg-meridian-50 dark:bg-white/5 text-meridian-600">
            <DocumentTextIcon class="h-5 w-5" />
          </span>
          <div>
            <p class="text-sm font-medium text-meridian-800 dark:text-meridian-100">{{ r.name }}</p>
            <p class="text-xs text-meridian-500">{{ r.period }} · {{ r.size }}</p>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <BaseBadge tone="neutral">{{ r.type }}</BaseBadge>
          <button @click="download(r)" class="text-xs font-medium text-meridian-600 hover:text-pulse-500">Download</button>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>
