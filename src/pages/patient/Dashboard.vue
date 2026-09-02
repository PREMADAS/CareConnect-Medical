<script setup>
import { ref, onMounted, computed } from 'vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import StatCard from '@/components/cards/StatCard.vue'
import ChartCard from '@/components/cards/ChartCard.vue'
import LineChart from '@/components/charts/LineChart.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import SkeletonCard from '@/components/skeletons/SkeletonCard.vue'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'
import schedule from '@/data/schedule.json'
import appointments from '@/data/appointments.json'
import {
  ClockIcon, CheckCircleIcon, ClipboardDocumentListIcon, CalendarDaysIcon, PlusCircleIcon,
} from '@heroicons/vue/24/outline'

const auth = useAuthStore()
const ui = useUiStore()
const loading = ref(true)
onMounted(() => setTimeout(() => (loading.value = false), 600))

const todaysSchedule = ref(schedule.filter((s) => s.date === '2026-08-06'))
const upcoming = appointments.filter((a) => a.patient === 'Elena Whitfield' && a.status === 'confirmed').slice(0, 2)

const adherenceLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const adherenceData = [100, 100, 80, 100, 60, 100, 90]

const takenCount = computed(() => todaysSchedule.value.filter((s) => s.taken).length)

function markTaken(item) {
  item.taken = true
  ui.toast({ type: 'success', title: 'Dose logged', message: `${item.medicine} marked as taken.` })
}
</script>

<template>
  <DashboardLayout>
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 class="font-display text-2xl font-semibold text-meridian-900 dark:text-white">Good afternoon, {{ auth.user?.name?.split(' ')[0] }}</h1>
        <p class="text-sm text-meridian-500 dark:text-meridian-400 mt-1">Here's your care summary for today, Aug 6.</p>
      </div>
      <router-link to="/patient/schedule">
        <BaseButton><template #icon-left><PlusCircleIcon class="h-5 w-5" /></template>Log a dose</BaseButton>
      </router-link>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <template v-if="loading">
        <SkeletonCard v-for="i in 4" :key="i" />
      </template>
      <template v-else>
        <StatCard label="Doses today" :value="`${takenCount}/${todaysSchedule.length}`" delta="+8%" tone="meridian">
          <template #icon><ClockIcon class="h-5 w-5" /></template>
        </StatCard>
        <StatCard label="Adherence (7d)" value="90%" delta="+4.2%" tone="meridian">
          <template #icon><CheckCircleIcon class="h-5 w-5" /></template>
        </StatCard>
        <StatCard label="Active prescriptions" value="2" tone="pulse">
          <template #icon><ClipboardDocumentListIcon class="h-5 w-5" /></template>
        </StatCard>
        <StatCard label="Upcoming appointments" value="2" tone="pulse">
          <template #icon><CalendarDaysIcon class="h-5 w-5" /></template>
        </StatCard>
      </template>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div class="lg:col-span-2 card-base p-5">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-display font-semibold text-meridian-900 dark:text-white">Today's schedule</h3>
          <router-link to="/patient/schedule" class="text-xs font-medium text-meridian-600 hover:text-pulse-500">View full schedule</router-link>
        </div>
        <ul class="divide-y divide-meridian-100 dark:divide-white/5">
          <li v-for="item in todaysSchedule" :key="item.id" class="flex items-center justify-between py-3.5">
            <div class="flex items-center gap-3">
              <span class="flex h-10 w-10 items-center justify-center rounded-xl font-mono text-xs font-semibold" :class="item.taken ? 'bg-meridian-50 dark:bg-meridian-500/10 text-meridian-600' : 'bg-pulse-50 dark:bg-pulse-500/10 text-pulse-500'">
                {{ item.time }}
              </span>
              <div>
                <p class="text-sm font-medium text-meridian-800 dark:text-meridian-100">{{ item.medicine }}</p>
                <BaseBadge :tone="item.taken ? 'success' : 'warning'" class="mt-1">{{ item.taken ? 'Taken' : 'Pending' }}</BaseBadge>
              </div>
            </div>
            <BaseButton v-if="!item.taken" size="sm" variant="outline" @click="markTaken(item)">Mark taken</BaseButton>
          </li>
        </ul>
      </div>

      <div class="card-base p-5">
        <h3 class="font-display font-semibold text-meridian-900 dark:text-white mb-4">Upcoming appointments</h3>
        <div class="space-y-3">
          <div v-for="a in upcoming" :key="a.id" class="rounded-xl border border-meridian-100 dark:border-white/10 p-3.5">
            <p class="text-sm font-medium text-meridian-800 dark:text-meridian-100">{{ a.doctor }}</p>
            <p class="text-xs text-meridian-500 dark:text-meridian-400">{{ a.specialty }}</p>
            <div class="flex items-center justify-between mt-2.5">
              <span class="text-xs text-meridian-500">{{ a.date }} · {{ a.time }}</span>
              <BaseBadge tone="info">{{ a.mode }}</BaseBadge>
            </div>
          </div>
        </div>
        <router-link to="/patient/appointments" class="block text-center text-xs font-medium text-meridian-600 hover:text-pulse-500 mt-4">Manage appointments</router-link>
      </div>
    </div>

    <div class="mt-4">
      <ChartCard title="Weekly adherence" subtitle="Percentage of scheduled doses taken on time">
        <LineChart :labels="adherenceLabels" :datasets="[{ label: 'Adherence', data: adherenceData, color: '#0e7c66' }]" />
      </ChartCard>
    </div>
  </DashboardLayout>
</template>
