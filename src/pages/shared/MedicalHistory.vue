<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import BaseAvatar from '@/components/ui/BaseAvatar.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import SkeletonLine from '@/components/skeletons/SkeletonLine.vue'
import { useAuthStore } from '@/stores/auth'
import medicalRecordsData from '@/data/medicalRecords.json'
import billingData from '@/data/billing.json'
import {
  HeartIcon, BeakerIcon, DocumentTextIcon, CalendarDaysIcon, BanknotesIcon,
} from '@heroicons/vue/24/outline'

const route = useRoute()
const auth = useAuthStore()
const loading = ref(true)
onMounted(() => setTimeout(() => (loading.value = false), 500))

// Doctor lands here via /doctor/patients/:id — patient lands here on their own record.
const patientId = computed(() => route.params.id || auth.user?.id)

const visits = computed(() =>
  medicalRecordsData.filter((v) => v.patientId === patientId.value).sort((a, b) => (a.date < b.date ? 1 : -1))
)
const patientName = computed(() => visits.value[0]?.patient || auth.user?.name || 'Patient')
const invoices = computed(() => billingData.filter((i) => i.patientId === patientId.value))
const totalBilled = computed(() => invoices.value.reduce((s, i) => s + i.amount, 0))
const totalOutstanding = computed(() => invoices.value.filter((i) => i.status !== 'paid').reduce((s, i) => s + i.amount, 0))

function currency(v) {
  return `$${v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

const resultTone = { normal: 'success', high: 'danger', low: 'warning', pending: 'neutral' }
</script>

<template>
  <DashboardLayout>
    <div class="flex items-center gap-4 mb-6">
      <BaseAvatar :name="patientName" size="lg" />
      <div>
        <h1 class="font-display text-2xl font-semibold text-meridian-900 dark:text-white">{{ patientName }}</h1>
        <p class="text-sm text-meridian-500 dark:text-meridian-400">Medical history & records</p>
      </div>
    </div>

    <div v-if="auth.role === 'doctor'" class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <div class="card-base p-4">
        <p class="text-xs font-medium uppercase tracking-wide text-meridian-500">Total visits</p>
        <p class="font-display text-xl font-semibold text-meridian-900 dark:text-white mt-1">{{ visits.length }}</p>
      </div>
      <div class="card-base p-4">
        <p class="text-xs font-medium uppercase tracking-wide text-meridian-500 flex items-center gap-1"><BanknotesIcon class="h-3.5 w-3.5" /> Total billed</p>
        <p class="font-display text-xl font-semibold text-meridian-900 dark:text-white mt-1">{{ currency(totalBilled) }}</p>
      </div>
      <div class="card-base p-4">
        <p class="text-xs font-medium uppercase tracking-wide text-meridian-500">Outstanding balance</p>
        <p class="font-display text-xl font-semibold mt-1" :class="totalOutstanding > 0 ? 'text-pulse-600' : 'text-emerald-600'">{{ currency(totalOutstanding) }}</p>
      </div>
    </div>

    <div v-if="loading" class="space-y-4">
      <SkeletonLine v-for="i in 3" height="8rem" :key="i" />
    </div>

    <div v-else-if="visits.length" class="space-y-5">
      <div v-for="visit in visits" :key="visit.id" class="card-base p-5">
        <div class="flex flex-wrap items-start justify-between gap-3 mb-4">
          <div>
            <p class="flex items-center gap-1.5 text-xs text-meridian-500"><CalendarDaysIcon class="h-3.5 w-3.5" /> {{ visit.date }} · {{ visit.doctor }}</p>
            <h3 class="font-display font-semibold text-meridian-900 dark:text-white mt-1">{{ visit.diagnosis }}</h3>
          </div>
          <BaseBadge tone="info">{{ visit.visitType }}</BaseBadge>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <div class="rounded-lg bg-meridian-50 dark:bg-white/5 p-3 text-center">
            <p class="text-[11px] text-meridian-500 mb-0.5">Blood pressure</p>
            <p class="text-sm font-mono font-medium text-meridian-800 dark:text-meridian-100">{{ visit.vitals.bp }}</p>
          </div>
          <div class="rounded-lg bg-meridian-50 dark:bg-white/5 p-3 text-center">
            <p class="text-[11px] text-meridian-500 mb-0.5">Heart rate</p>
            <p class="text-sm font-mono font-medium text-meridian-800 dark:text-meridian-100">{{ visit.vitals.hr }}</p>
          </div>
          <div class="rounded-lg bg-meridian-50 dark:bg-white/5 p-3 text-center">
            <p class="text-[11px] text-meridian-500 mb-0.5">Temperature</p>
            <p class="text-sm font-mono font-medium text-meridian-800 dark:text-meridian-100">{{ visit.vitals.temp }}</p>
          </div>
          <div class="rounded-lg bg-meridian-50 dark:bg-white/5 p-3 text-center">
            <p class="text-[11px] text-meridian-500 mb-0.5">Weight</p>
            <p class="text-sm font-mono font-medium text-meridian-800 dark:text-meridian-100">{{ visit.vitals.weight }}</p>
          </div>
        </div>

        <p class="flex items-start gap-1.5 text-sm text-meridian-600 dark:text-meridian-300 mb-4">
          <DocumentTextIcon class="h-4 w-4 shrink-0 mt-0.5 text-meridian-400" /> {{ visit.notes }}
        </p>

        <div v-if="visit.testResults?.length">
          <p class="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-meridian-500 mb-2">
            <BeakerIcon class="h-3.5 w-3.5" /> Test results
          </p>
          <div class="flex flex-wrap gap-2">
            <span v-for="(t, i) in visit.testResults" :key="i" class="inline-flex items-center gap-1.5 rounded-lg border border-meridian-100 dark:border-white/10 px-3 py-1.5 text-xs">
              <span class="font-medium text-meridian-700 dark:text-meridian-200">{{ t.name }}:</span>
              <span class="text-meridian-500">{{ t.result }}</span>
              <BaseBadge :tone="resultTone[t.status]" class="ml-1">{{ t.status }}</BaseBadge>
            </span>
          </div>
        </div>
      </div>
    </div>

    <EmptyState v-else title="No medical records yet" message="Visit history will appear here after the first consultation.">
      <template #icon><HeartIcon class="h-8 w-8 text-meridian-400" /></template>
    </EmptyState>
  </DashboardLayout>
</template>
