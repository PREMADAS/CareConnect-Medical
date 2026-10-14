<script setup>
import { ref, computed, onMounted } from 'vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import ChartCard from '@/components/cards/ChartCard.vue'
import LineChart from '@/components/charts/LineChart.vue'
import BarChart from '@/components/charts/BarChart.vue'
import DoughnutChart from '@/components/charts/DoughnutChart.vue'
import StatCard from '@/components/cards/StatCard.vue'
import SkeletonCard from '@/components/skeletons/SkeletonCard.vue'
import {
  ChartBarIcon,
  UsersIcon,
  ClockIcon,
  ClipboardDocumentListIcon,
  ArrowTrendingUpIcon,
  SparklesIcon,
  TrophyIcon,
} from '@heroicons/vue/24/outline'

const loading = ref(true)
onMounted(() => setTimeout(() => (loading.value = false), 600))

/* ---------- data ---------- */
const allMonths = ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug']
const allAdherence = [74, 76, 75, 79, 80, 82, 81, 84, 85, 86, 87, 87.4]

const roles = [
  { label: 'Patients', value: 62 },
  { label: 'Doctors', value: 14 },
  { label: 'Pharmacists', value: 10 },
  { label: 'Caretakers', value: 14 },
]
const specialties = [
  { label: 'Cardiology', value: 4200 },
  { label: 'Endocrinology', value: 3600 },
  { label: 'Respiratory', value: 2100 },
  { label: 'Psychiatry', value: 1800 },
  { label: 'General', value: 5400 },
]

/* ---------- range switch (real: slices the trend data) ---------- */
const ranges = [
  { key: 3, label: '3M' },
  { key: 6, label: '6M' },
  { key: 12, label: '12M' },
]
const range = ref(12)
const labels = computed(() => allMonths.slice(-range.value))
const series = computed(() => allAdherence.slice(-range.value))
const rangeDelta = computed(() => +(series.value[series.value.length - 1] - series.value[0]).toFixed(1))

/* ---------- hero sparkline ---------- */
const spark = computed(() => {
  const w = 280, h = 72, pad = 4
  const d = series.value
  const min = Math.min(...d), max = Math.max(...d)
  const span = max - min || 1
  const pts = d.map((v, i) => [
    pad + (i / (d.length - 1)) * (w - pad * 2),
    h - pad - ((v - min) / span) * (h - pad * 2),
  ])
  const line = pts.map((p) => p.join(',')).join(' ')
  const area = `${pad},${h} ${line} ${w - pad},${h}`
  return { w, h, line, area, last: pts[pts.length - 1] }
})

/* ---------- computed insights ---------- */
const bestJump = computed(() => {
  let idx = 1, best = -Infinity
  for (let i = 1; i < allAdherence.length; i++) {
    const diff = allAdherence[i] - allAdherence[i - 1]
    if (diff > best) { best = diff; idx = i }
  }
  return { month: allMonths[idx], diff: +best.toFixed(1) }
})
const rolesTotal = roles.reduce((s, r) => s + r.value, 0)
const topRole = roles.reduce((a, b) => (b.value > a.value ? b : a))
const rxTotal = specialties.reduce((s, r) => s + r.value, 0)
const topSpecialty = specialties.reduce((a, b) => (b.value > a.value ? b : a))
const pct = (v, t) => Math.round((v / t) * 100)

const roleDots = ['bg-meridian-700', 'bg-meridian-500', 'bg-meridian-300', 'bg-[#ff6b5b]']
</script>

<template>
  <DashboardLayout>
    <!-- Header -->
    <div class="flex flex-wrap items-end justify-between gap-4 mb-6">
      <div>
        <h1 class="font-display text-2xl font-semibold text-meridian-900 dark:text-white">Analytics</h1>
        <p class="mt-1 text-sm text-meridian-500 dark:text-meridian-300">How the platform is performing, at a glance.</p>
      </div>

      <!-- Range switch -->
      <div class="inline-flex rounded-xl border border-meridian-100 dark:border-white/10 bg-white dark:bg-white/5 p-1" role="tablist">
        <button
          v-for="r in ranges"
          :key="r.key"
          type="button"
          role="tab"
          :aria-selected="range === r.key"
          @click="range = r.key"
          :class="[
            'rounded-lg px-4 py-1.5 text-sm font-medium transition',
            range === r.key
              ? 'bg-meridian-600 text-white shadow-sm'
              : 'text-meridian-600 dark:text-meridian-200 hover:bg-meridian-50 dark:hover:bg-white/10',
          ]"
        >
          {{ r.label }}
        </button>
      </div>
    </div>

    <!-- Hero: headline metric + sparkline -->
    <div v-if="loading" class="h-44 rounded-2xl bg-meridian-100 dark:bg-white/5 animate-pulse mb-6" />
    <section
      v-else
      class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-meridian-900 via-meridian-800 to-meridian-600 p-6 sm:p-8 mb-6 text-white"
    >
      <div class="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/5" />
      <div class="pointer-events-none absolute -right-4 -bottom-24 h-64 w-64 rounded-full bg-[#ff6b5b]/10" />

      <div class="relative flex flex-wrap items-center justify-between gap-6">
        <div>
          <div class="text-sm font-medium text-meridian-200">Platform-wide adherence</div>
          <div class="mt-2 flex items-baseline gap-3">
            <span class="text-5xl font-semibold tabular-nums tracking-tight">87.4%</span>
            <span class="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-sm font-medium">
              <ArrowTrendingUpIcon class="h-4 w-4" />
              {{ rangeDelta >= 0 ? '+' : '' }}{{ rangeDelta }} pts
            </span>
          </div>
          <p class="mt-3 max-w-md text-sm text-meridian-100">
            Over the last {{ range }} months, adherence moved from {{ series[0] }}% to {{ series[series.length - 1] }}%.
            Biggest single-month gain was <span class="font-semibold text-white">+{{ bestJump.diff }} pts in {{ bestJump.month }}</span>.
          </p>
        </div>

        <svg :viewBox="`0 0 ${spark.w} ${spark.h}`" class="w-full max-w-xs h-20" aria-hidden="true">
          <polygon :points="spark.area" fill="white" fill-opacity="0.12" />
          <polyline :points="spark.line" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
          <circle :cx="spark.last[0]" :cy="spark.last[1]" r="4.5" fill="#ff6b5b" stroke="white" stroke-width="2" />
        </svg>
      </div>
    </section>

    <!-- Stat cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <template v-if="loading"><SkeletonCard v-for="i in 4" :key="i" /></template>
      <template v-else>
        <StatCard label="Avg. session length" value="6m 42s" delta="+8%" tone="meridian"><template #icon><ClockIcon class="h-5 w-5" /></template></StatCard>
        <StatCard label="Daily active users" value="4,209" delta="+3.1%" tone="meridian"><template #icon><UsersIcon class="h-5 w-5" /></template></StatCard>
        <StatCard label="Adherence rate" value="87.4%" delta="+2.4%" tone="pulse"><template #icon><ChartBarIcon class="h-5 w-5" /></template></StatCard>
        <StatCard label="Rx processed" value="48,920" delta="+15.7%" tone="pulse"><template #icon><ClipboardDocumentListIcon class="h-5 w-5" /></template></StatCard>
      </template>
    </div>

    <!-- Trend + roles -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
      <div class="lg:col-span-2">
        <ChartCard title="Adherence trend" :subtitle="`Last ${range} months`">
          <LineChart
            :key="range"
            :labels="labels"
            :datasets="[{ label: 'Adherence %', data: series, color: '#0e7c66' }]"
          />
        </ChartCard>
      </div>

      <ChartCard title="Traffic by role" subtitle="Active sessions">
        <DoughnutChart :labels="roles.map((r) => r.label)" :data="roles.map((r) => r.value)" />
        <ul class="mt-4 space-y-2">
          <li v-for="(r, i) in roles" :key="r.label" class="flex items-center justify-between text-sm">
            <span class="flex items-center gap-2 text-meridian-700 dark:text-meridian-200">
              <span :class="['h-2.5 w-2.5 rounded-full', roleDots[i]]" />{{ r.label }}
            </span>
            <span class="font-medium tabular-nums text-meridian-900 dark:text-white">{{ pct(r.value, rolesTotal) }}%</span>
          </li>
        </ul>
      </ChartCard>
    </div>

    <!-- Specialty chart + insight callouts -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div class="lg:col-span-2">
        <ChartCard title="Prescriptions by specialty" subtitle="This quarter">
          <BarChart
            :labels="specialties.map((s) => s.label)"
            :datasets="[{ label: 'Rx count', data: specialties.map((s) => s.value), color: '#ff6b5b' }]"
            horizontal
          />
        </ChartCard>
      </div>

      <div class="flex flex-col gap-4">
        <div class="flex-1 rounded-2xl border border-meridian-100 dark:border-white/10 bg-white dark:bg-white/5 p-5">
          <span class="flex h-9 w-9 items-center justify-center rounded-lg bg-meridian-50 dark:bg-white/10 text-meridian-600"><TrophyIcon class="h-5 w-5" /></span>
          <div class="mt-3 text-sm text-meridian-500 dark:text-meridian-300">Top specialty</div>
          <div class="text-lg font-semibold text-meridian-900 dark:text-white">{{ topSpecialty.label }}</div>
          <div class="mt-1 text-sm text-meridian-500 dark:text-meridian-300">
            {{ pct(topSpecialty.value, rxTotal) }}% of this quarter's prescriptions
          </div>
        </div>

        <div class="flex-1 rounded-2xl border border-meridian-100 dark:border-white/10 bg-white dark:bg-white/5 p-5">
          <span class="flex h-9 w-9 items-center justify-center rounded-lg bg-[#ff6b5b]/10 text-[#ff6b5b]"><SparklesIcon class="h-5 w-5" /></span>
          <div class="mt-3 text-sm text-meridian-500 dark:text-meridian-300">Largest audience</div>
          <div class="text-lg font-semibold text-meridian-900 dark:text-white">{{ topRole.label }}</div>
          <div class="mt-1 text-sm text-meridian-500 dark:text-meridian-300">
            {{ pct(topRole.value, rolesTotal) }}% of active sessions
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>