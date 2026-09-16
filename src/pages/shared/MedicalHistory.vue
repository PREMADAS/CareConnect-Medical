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
import prescriptionsData from '@/data/prescriptions.json'
import {
  HeartIcon, BeakerIcon, DocumentTextIcon, CalendarDaysIcon, BanknotesIcon,
  ExclamationTriangleIcon, MagnifyingGlassIcon, PrinterIcon,
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

const conditionTags = computed(() => {
  const set = new Set()
  visits.value.forEach((v) => {
    const head = (v.diagnosis || '').split('—')[0]
    head.split(',').forEach((part) => {
      const trimmed = part.trim()
      if (trimmed) set.add(trimmed)
    })
  })
  return [...set]
})

/* =====================================================================
   2. Allergies & current medications — surfaced at the top of the sidebar
   since this is the information a doctor most needs before prescribing
   anything new. Derived from visit data here; if your records store these
   as first-class fields (e.g. patient.allergies), read from there instead.
===================================================================== */
const allergies = computed(() => {
  const set = new Set()
  visits.value.forEach((v) => (v.allergies || []).forEach((a) => set.add(a)))
  return [...set]
})

// All prescriptions issued to this patient, from the real prescriptions data.
const prescriptions = computed(() =>
  prescriptionsData.filter((rx) => rx.patientId === patientId.value)
)

// "Current" = items from prescriptions still marked active.
const currentMedications = computed(() => {
  return prescriptions.value
    .filter((rx) => rx.status === 'active')
    .flatMap((rx) => rx.items.map((it) => ({ name: it.medicine, dose: `${it.dosage} · ${it.frequency}` })))
})

// Medications tied to one specific visit — matched by the prescription's
// issue date against the visit date, so the timeline shows what was
// prescribed at each encounter, with that prescription's current status.
function medicationsForVisit(visit) {
  return prescriptions.value
    .filter((rx) => rx.issuedOn === visit.date)
    .flatMap((rx) => rx.items.map((it) => ({
      name: it.medicine,
      dose: `${it.dosage} · ${it.frequency}`,
      status: rx.status,
    })))
}

// Prescription status → pill classes, light-mode default + dark: variant
const rxStatusFlag = {
  active: 'text-emerald-700 bg-emerald-50 dark:text-[#34D399] dark:bg-[#065F46]/40',
  fulfilled: 'text-slate-600 bg-slate-100 dark:text-[#9CA3AF] dark:bg-[#374151]/40',
  pending: 'text-amber-700 bg-amber-50 dark:text-[#FBBF24] dark:bg-[#78350F]/40',
  expired: 'text-red-700 bg-red-50 dark:text-[#F87171] dark:bg-[#7F1D1D]/40',
}

/* =====================================================================
   3. Timeline filtering — by visit type and free-text search, plus
   click-to-filter on condition tags.
===================================================================== */
const searchQuery = ref('')
const typeFilter = ref('all')
const tagFilter = ref(null)

const visitTypes = computed(() => {
  const set = new Set(visits.value.map((v) => (v.visitType || 'default').toLowerCase()))
  return ['all', ...set]
})

function toggleTagFilter(tag) {
  tagFilter.value = tagFilter.value === tag ? null : tag
}

const filteredVisits = computed(() => {
  return visits.value.filter((v) => {
    if (typeFilter.value !== 'all' && (v.visitType || '').toLowerCase() !== typeFilter.value) return false
    if (tagFilter.value && !(v.diagnosis || '').includes(tagFilter.value)) return false
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.trim().toLowerCase()
      const haystack = `${v.diagnosis || ''} ${v.notes || ''}`.toLowerCase()
      if (!haystack.includes(q)) return false
    }
    return true
  })
})

// Tone mapping — light-mode default classes, dark: variants preserve the
// original dark palette exactly as before.
const visitTone = {
  'follow-up': { badge: 'text-blue-600 bg-blue-50 dark:text-[#60A5FA] dark:bg-[#1E3A8A]/30', dot: 'border-blue-500 dark:border-[#3B82F6]' },
  acute: { badge: 'text-red-600 bg-red-50 dark:text-[#F87171] dark:bg-[#991B1B]/30', dot: 'border-red-500 dark:border-[#EF4444]' },
  default: { badge: 'text-emerald-600 bg-emerald-50 dark:text-[#34D399] dark:bg-[#065F46]/30', dot: 'border-emerald-500 dark:border-[#10B981]' },
}
function toneFor(visitType) {
  const key = (visitType || '').toLowerCase()
  return visitTone[key] || visitTone.default
}

// Test-result status → pill classes, light-mode default + dark: variant
const resultFlag = {
  normal: 'text-emerald-700 bg-emerald-50 dark:text-[#34D399] dark:bg-[#065F46]/40',
  high: 'text-red-700 bg-red-50 dark:text-[#F87171] dark:bg-[#7F1D1D]/40',
  low: 'text-amber-700 bg-amber-50 dark:text-[#FBBF24] dark:bg-[#78350F]/40',
  pending: 'text-slate-600 bg-slate-100 dark:text-[#9CA3AF] dark:bg-[#374151]/40',
}

/* =====================================================================
   4. Print — opens the browser print dialog scoped to this page.
   Simple and dependency-free; swap for a dedicated PDF export if you
   need a formatted referral document instead of a page printout.
===================================================================== */
function printRecord() {
  window.print()
}
</script>

<template>
  <DashboardLayout>
    <!-- Breadcrumb + actions -->
    <div class="flex items-center justify-between mb-4">
      <p v-if="auth.role === 'doctor'" class="text-sm text-slate-500 dark:text-[#7A9A95]">
        Patients / <span class="font-semibold text-slate-900 dark:text-[#E2ECE9]">{{ patientName }}</span>
      </p>
      <div v-else></div>
      <button type="button" @click="printRecord"
        class="print:hidden flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-[#7A9A95] hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-[#1E3A35] rounded-lg px-3 py-1.5">
        <PrinterIcon class="h-3.5 w-3.5" /> Print record
      </button>
    </div>

    <div
      class="grid gap-6 items-start"
      :class="auth.role === 'doctor' ? 'grid-cols-1 lg:grid-cols-[290px_1fr]' : 'grid-cols-1'"
    >

      <!-- LEFT: sticky patient summary (doctor view only) -->
      <aside v-if="auth.role === 'doctor'" class="lg:sticky lg:top-6 rounded-2xl border border-slate-200 dark:border-[#1E3A35] bg-white dark:bg-[#122522] p-6 shadow-xl">
        <div class="flex items-center gap-3.5 mb-5">
          <BaseAvatar :name="patientName" size="lg" />
          <div>
            <h1 class="font-display text-lg font-bold text-slate-900 dark:text-white leading-tight">{{ patientName }}</h1>
            <p class="text-xs text-slate-500 dark:text-[#7A9A95]">{{ visits.length }} recorded {{ visits.length === 1 ? 'visit' : 'visits' }}</p>
          </div>
        </div>

        <div v-if="loading" class="space-y-2 mb-5">
          <SkeletonLine height="2.5rem" v-for="i in 3" :key="i" />
        </div>

        <template v-else>
          <!-- Allergies — highest-priority info, shown first and impossible to miss -->
          <div v-if="allergies.length" class="fade-in rounded-xl border border-red-200 dark:border-[#7F1D1D] bg-red-50 dark:bg-[#7F1D1D]/20 px-3.5 py-3 mb-4">
            <p class="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-red-600 dark:text-[#F87171] mb-1.5">
              <ExclamationTriangleIcon class="h-3.5 w-3.5" /> Allergies
            </p>
            <div class="flex flex-wrap gap-1.5">
              <span v-for="a in allergies" :key="a" class="text-xs font-semibold text-red-600 dark:text-[#F87171] bg-red-100 dark:bg-[#7F1D1D]/40 rounded-full px-2.5 py-1">{{ a }}</span>
            </div>
          </div>

          <!-- Current medications -->
          <div class="fade-in rounded-xl border border-slate-200 dark:border-[#1E3A35] bg-slate-50 dark:bg-[#162E2A] px-3.5 py-3 mb-5">
            <p class="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-[#7A9A95] mb-1.5">Current medications</p>
            <ul v-if="currentMedications.length" class="space-y-2">
              <li v-for="m in currentMedications" :key="m.name" class="text-sm text-slate-800 dark:text-[#E2ECE9]">
                <p class="font-medium leading-snug">{{ m.name }}</p>
                <p class="text-xs text-slate-500 dark:text-[#7A9A95] font-mono">{{ m.dose }}</p>
              </li>
            </ul>
            <p v-else class="text-xs text-slate-500 dark:text-[#7A9A95]">None on record</p>
          </div>

          <div class="fade-in mb-5">
            <div class="flex items-center justify-between py-2.5">
              <span class="text-sm text-slate-500 dark:text-[#7A9A95]">Total visits</span>
              <span class="text-sm font-semibold font-mono text-slate-900 dark:text-white">{{ visits.length }}</span>
            </div>
            <div class="flex items-center justify-between py-2.5 border-t border-slate-200 dark:border-[#1E3A35]">
              <span class="text-sm text-slate-500 dark:text-[#7A9A95] flex items-center gap-1.5">
                <BanknotesIcon class="h-3.5 w-3.5" /> Total billed
              </span>
              <span class="text-sm font-semibold font-mono text-slate-900 dark:text-white">{{ currency(totalBilled) }}</span>
            </div>
            <div class="flex items-center justify-between py-2.5 border-t border-slate-200 dark:border-[#1E3A35]">
              <span class="text-sm text-slate-500 dark:text-[#7A9A95]">Outstanding balance</span>
              <span
                class="text-sm font-semibold font-mono"
                :class="totalOutstanding > 0 ? 'text-red-600 dark:text-[#EF4444]' : 'text-emerald-600 dark:text-[#10B981]'"
              >{{ currency(totalOutstanding) }}</span>
            </div>
          </div>

          <div v-if="conditionTags.length" class="flex flex-wrap gap-1.5">
            <button
              v-for="tag in conditionTags"
              :key="tag"
              type="button"
              @click="toggleTagFilter(tag)"
              class="tag-chip text-xs rounded-full border px-2.5 py-1"
              :class="tagFilter === tag
                ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:border-[#10B981] dark:bg-[#065F46]/40 dark:text-[#34D399]'
                : 'border-slate-200 bg-slate-50 text-slate-500 dark:border-[#1E3A35] dark:bg-[#162E2A] dark:text-[#7A9A95]'"
            >{{ tag }}</button>
          </div>
          <p v-if="tagFilter" class="text-[11px] text-slate-500 dark:text-[#7A9A95] mt-2">
            Filtering timeline by "{{ tagFilter }}" —
            <button type="button" @click="tagFilter = null" class="underline hover:text-slate-900 dark:hover:text-white">clear</button>
          </p>
        </template>
      </aside>

      <!-- RIGHT: visit timeline -->
      <div>
        <div v-if="auth.role !== 'doctor'" class="flex items-center gap-4 mb-6">
          <BaseAvatar :name="patientName" size="lg" />
          <div>
            <h1 class="font-display text-2xl font-semibold text-slate-900 dark:text-white">{{ patientName }}</h1>
            <p class="text-sm text-slate-500 dark:text-[#7A9A95]">Medical history & records</p>
          </div>
        </div>

        <!-- Current medications — patient's own view -->
        <div v-if="auth.role !== 'doctor' && !loading" class="rounded-2xl border border-slate-200 dark:border-[#1E3A35] bg-slate-50 dark:bg-[#162E2A] px-4 py-3.5 mb-6">
          <p class="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-[#7A9A95] mb-1.5">Current medications</p>
          <ul v-if="currentMedications.length" class="space-y-1">
            <li v-for="m in currentMedications" :key="m.name" class="text-sm text-slate-800 dark:text-[#E2ECE9] flex items-baseline justify-between gap-2">
              <span class="font-medium">{{ m.name }}</span>
              <span class="text-xs text-slate-500 dark:text-[#7A9A95] font-mono shrink-0">{{ m.dose }}</span>
            </li>
          </ul>
          <p v-else class="text-xs text-slate-500 dark:text-[#7A9A95]">None on record</p>
        </div>

        <div class="flex flex-wrap items-center justify-between gap-3 mb-3.5">
          <h2 class="font-display text-base font-bold text-slate-900 dark:text-white">Visit history</h2>
          <span class="text-xs text-slate-500 dark:text-[#7A9A95]">{{ filteredVisits.length }} of {{ visits.length }} {{ visits.length === 1 ? 'encounter' : 'encounters' }} shown</span>
        </div>

        <!-- Search + type filter -->
        <div v-if="visits.length" class="print:hidden flex flex-wrap items-center gap-2.5 mb-4">
          <div class="relative flex-1 min-w-[200px]">
            <MagnifyingGlassIcon class="h-3.5 w-3.5 text-slate-400 dark:text-[#7A9A95] absolute left-3 top-1/2 -translate-y-1/2" />
            <input v-model="searchQuery" type="text" placeholder="Search diagnosis or notes…"
              class="w-full bg-white dark:bg-[#162E2A] border border-slate-200 dark:border-[#1E3A35] rounded-lg pl-8 pr-3 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-[#7A9A95] outline-none focus:border-emerald-500 dark:focus:border-[#10B981]" />
          </div>
          <select v-model="typeFilter" class="bg-white dark:bg-[#162E2A] border border-slate-200 dark:border-[#1E3A35] rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white outline-none capitalize">
            <option v-for="t in visitTypes" :key="t" :value="t" class="capitalize">{{ t === 'all' ? 'All visit types' : t }}</option>
          </select>
        </div>

        <div v-if="loading" class="space-y-4">
          <SkeletonLine v-for="i in 3" height="8rem" :key="i" />
        </div>

        <div
          v-else-if="filteredVisits.length"
          class="relative pl-6 before:content-[''] before:absolute before:left-[5px] before:top-1.5 before:bottom-1.5 before:w-px before:bg-slate-200 dark:before:bg-[#1E3A35]"
        >
          <div
            v-for="(visit, i) in filteredVisits"
            :key="visit.id"
            class="enc-in relative mb-4"
            :style="{ animationDelay: `${i * 70}ms` }"
          >
            <span
              class="absolute -left-6 top-1.5 h-2.5 w-2.5 rounded-full bg-white dark:bg-[#122522] border-2"
              :class="toneFor(visit.visitType).dot"
            ></span>

            <div class="visit-card rounded-2xl border border-slate-200 dark:border-[#1E3A35] bg-white dark:bg-[#122522] p-5 shadow-lg">
              <div class="flex flex-wrap items-start justify-between gap-3 mb-1">
                <p class="flex items-center gap-1.5 text-xs text-slate-500 dark:text-[#7A9A95]">
                  <CalendarDaysIcon class="h-3.5 w-3.5" /> {{ visit.date }} · {{ visit.doctor }}
                </p>
                <span
                  class="inline-flex items-center gap-1.5 text-xs font-medium rounded-full px-2.5 py-1"
                  :class="toneFor(visit.visitType).badge"
                >{{ visit.visitType }}</span>
              </div>
              <h3 class="font-display font-semibold text-slate-900 dark:text-white mb-3.5">{{ visit.diagnosis }}</h3>

              <div class="flex rounded-xl bg-slate-50 dark:bg-[#162E2A] border border-slate-200 dark:border-[#1E3A35] overflow-hidden mb-3.5">
                <div class="flex-1 px-3.5 py-2.5 border-r border-slate-200 dark:border-[#1E3A35]">
                  <p class="text-[11px] text-slate-500 dark:text-[#7A9A95] mb-0.5">Blood pressure</p>
                  <p class="text-sm font-mono font-medium text-slate-900 dark:text-white">{{ visit.vitals.bp }}</p>
                </div>
                <div class="flex-1 px-3.5 py-2.5 border-r border-slate-200 dark:border-[#1E3A35]">
                  <p class="text-[11px] text-slate-500 dark:text-[#7A9A95] mb-0.5">Heart rate</p>
                  <p class="text-sm font-mono font-medium text-slate-900 dark:text-white">{{ visit.vitals.hr }}</p>
                </div>
                <div class="flex-1 px-3.5 py-2.5 border-r border-slate-200 dark:border-[#1E3A35]">
                  <p class="text-[11px] text-slate-500 dark:text-[#7A9A95] mb-0.5">Temperature</p>
                  <p class="text-sm font-mono font-medium text-slate-900 dark:text-white">{{ visit.vitals.temp }}</p>
                </div>
                <div class="flex-1 px-3.5 py-2.5">
                  <p class="text-[11px] text-slate-500 dark:text-[#7A9A95] mb-0.5">Weight</p>
                  <p class="text-sm font-mono font-medium text-slate-900 dark:text-white">{{ visit.vitals.weight }}</p>
                </div>
              </div>

              <p class="flex items-start gap-1.5 text-sm text-slate-600 dark:text-[#A3C2BD] mb-3.5">
                <DocumentTextIcon class="h-4 w-4 shrink-0 mt-0.5 text-slate-500 dark:text-[#7A9A95]" /> {{ visit.notes }}
              </p>

              <div v-if="medicationsForVisit(visit).length" class="mb-3.5">
                <p class="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-[#7A9A95] mb-2">
                  <BeakerIcon class="h-3.5 w-3.5" /> Medications prescribed
                </p>
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="m in medicationsForVisit(visit)"
                    :key="m.name"
                    class="inline-flex items-center gap-2 rounded-lg border border-slate-200 dark:border-[#1E3A35] bg-slate-50 dark:bg-[#162E2A] px-3 py-1.5 text-xs"
                  >
                    <span class="font-semibold text-slate-900 dark:text-white">{{ m.name }}</span>
                    <span class="text-slate-600 dark:text-[#A3C2BD] font-mono">{{ m.dose }}</span>
                    <span class="rounded-full px-2 py-0.5 text-[11px] font-medium" :class="rxStatusFlag[m.status] || rxStatusFlag.fulfilled">{{ m.status }}</span>
                  </span>
                </div>
              </div>

              <div v-if="visit.testResults?.length">
                <p class="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-[#7A9A95] mb-2">
                  <BeakerIcon class="h-3.5 w-3.5" /> Test results
                </p>
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="(t, ti) in visit.testResults"
                    :key="ti"
                    class="inline-flex items-center gap-2 rounded-lg border border-slate-200 dark:border-[#1E3A35] bg-slate-50 dark:bg-[#162E2A] px-3 py-1.5 text-xs"
                  >
                    <span class="font-semibold text-slate-900 dark:text-white">{{ t.name }}</span>
                    <span class="text-slate-600 dark:text-[#A3C2BD]">{{ t.result }}</span>
                    <span
                      class="rounded-full px-2 py-0.5 text-[11px] font-medium"
                      :class="resultFlag[t.status] || resultFlag.pending"
                    >{{ t.status }}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <EmptyState v-else-if="visits.length" title="No visits match your filters" message="Try clearing the search, type filter, or condition tag.">
          <template #icon><MagnifyingGlassIcon class="h-8 w-8 text-slate-400 dark:text-[#7A9A95]" /></template>
        </EmptyState>

        <EmptyState v-else title="No medical records yet" message="Visit history will appear here after the first consultation.">
          <template #icon><HeartIcon class="h-8 w-8 text-slate-400 dark:text-[#7A9A95]" /></template>
        </EmptyState>
      </div>

    </div>
  </DashboardLayout>
</template>

<style scoped>
/* Base Entrance Animations */
@keyframes enc-in {
  from {
    opacity: 0;
    transform: translateY(16px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
.enc-in {
  animation: enc-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
}

@keyframes fade-in {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}
.fade-in {
  animation: fade-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
}

/* Smooth Dark Hover Interactions */
.visit-card {
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1),
              border-color 0.25s ease,
              box-shadow 0.25s ease;
  will-change: transform, box-shadow;
}
.visit-card:hover {
  transform: translateY(-2px);
  border-color: rgba(16, 185, 129, 0.4);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
}

.tag-chip {
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}
.tag-chip:hover {
  transform: translateY(-1px) scale(1.03);
}

/* Reduced Motion Safety */
@media (prefers-reduced-motion: reduce) {
  .enc-in,
  .fade-in {
    animation: none !important;
    opacity: 1 !important;
    transform: none !important;
    stroke-dashoffset: 0 !important;
  }
  .visit-card,
  .tag-chip {
    transition: none !important;
  }
}
</style>