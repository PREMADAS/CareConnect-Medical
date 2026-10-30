<script setup>
import { ref, computed, onMounted } from 'vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseModal from '@/components/modals/BaseModal.vue'
import BaseInput from '@/components/forms/BaseInput.vue'
import BaseSelect from '@/components/forms/BaseSelect.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import PulseLine from '@/components/ui/PulseLine.vue'
import SkeletonLine from '@/components/skeletons/SkeletonLine.vue'
import { useUiStore } from '@/stores/ui'
import scheduleData from '@/data/schedule.json'
import { PlusIcon, ClockIcon, CheckIcon } from '@heroicons/vue/24/outline'

const ui = useUiStore()
const loading = ref(true)
onMounted(() => setTimeout(() => (loading.value = false), 500))

const schedule = ref(scheduleData)
const activeDate = ref('2026-08-06')
const dates = [
  { key: '2026-08-06', label: 'Today' },
  { key: '2026-08-07', label: 'Tomorrow' },
]
const addOpen = ref(false)
const form = ref({ medicine: '', time: '', frequency: 'Once daily' })
const freqOptions = [
  { label: 'Once daily', value: 'Once daily' },
  { label: 'Twice daily', value: 'Twice daily' },
  { label: '3 times daily', value: '3 times daily' },
  { label: 'As needed', value: 'As needed' },
]

const dayItems = computed(() =>
  schedule.value.filter((s) => s.date === activeDate.value).sort((a, b) => a.time.localeCompare(b.time))
)

// time-wise grouping
const groups = computed(() => {
  const map = {}
  dayItems.value.forEach((item) => {
    if (!map[item.time]) map[item.time] = []
    map[item.time].push(item)
  })
  return Object.keys(map)
    .sort()
    .map((time) => ({ time, items: map[time] }))
})

// "13:00" -> "1:00 PM"
function formatTime(t) {
  if (!t) return ''
  const [h, m] = t.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}:${String(m).padStart(2, '0')} ${period}`
}

// status: 'pending' | 'taken' | 'skipped'
function getStatus(item) {
  if (item.skipped) return 'skipped'
  if (item.taken) return 'taken'
  return 'pending'
}

const statusStyles = {
  pending: {
    card: 'border-gray-200 bg-white dark:border-white/10 dark:bg-white/5',
    badge: 'bg-slate-500 text-white',
    label: 'PENDING',
  },
  taken: {
    card: 'border-green-500 bg-green-50 dark:border-green-500/60 dark:bg-green-500/10',
    badge: 'bg-green-600 text-white',
    label: 'TAKEN',
  },
  skipped: {
    card: 'border-orange-400 bg-orange-50 dark:border-orange-400/60 dark:bg-orange-400/10',
    badge: 'bg-orange-500 text-white',
    label: 'SKIPPED',
  },
}

function markTaken(item) {
  item.taken = true
  item.skipped = false
  ui.toast({ type: 'success', title: 'Dose logged', message: `${item.medicine} marked as taken at ${formatTime(item.time)}.` })
}
function markSkipped(item) {
  item.skipped = true
  item.taken = false
  ui.toast({ type: 'warning', title: 'Dose skipped', message: `${item.medicine} marked as skipped.` })
}
function toggleTaken(item) {
  if (getStatus(item) === 'taken') {
    item.taken = false
  } else {
    markTaken(item)
  }
}
function markAllDoses(group) {
  group.items.forEach((item) => {
    item.taken = true
    item.skipped = false
  })
  ui.toast({ type: 'success', title: 'All doses logged', message: `All doses at ${formatTime(group.time)} marked as taken.` })
}
function addReminder() {
  schedule.value.push({
    id: `sch_${Date.now()}`,
    medicine: form.value.medicine,
    time: form.value.time,
    frequency: form.value.frequency,
    taken: false,
    skipped: false,
    date: activeDate.value,
  })
  addOpen.value = false
  ui.toast({ type: 'success', title: 'Reminder added' })
  form.value = { medicine: '', time: '', frequency: 'Once daily' }
}
</script>

<template>
  <DashboardLayout>
    <div class="flex items-center justify-between mb-2">
      <h1 class="font-display text-2xl font-semibold text-meridian-900 dark:text-white">Medicine Schedule</h1>
      <BaseButton @click="addOpen = true"><template #icon-left><PlusIcon class="h-5 w-5" /></template>Add reminder</BaseButton>
    </div>
    <PulseLine class="w-32 mb-6 text-pulse-400" :animated="false" />

    <div class="flex gap-2 mb-5">
      <button
        v-for="d in dates" :key="d.key" @click="activeDate = d.key"
        class="rounded-full px-4 py-1.5 text-sm font-medium transition-colors btn-focus-ring"
        :class="activeDate === d.key ? 'bg-meridian-600 text-white' : 'bg-meridian-50 dark:bg-white/5 text-meridian-600 dark:text-meridian-300 hover:bg-meridian-100 dark:hover:bg-white/10'"
      >
        {{ d.label }}
      </button>
    </div>

    <div class="card-base p-5">
      <div v-if="loading" class="space-y-4">
        <SkeletonLine v-for="i in 4" :key="i" height="3.5rem" />
      </div>

      <div v-else-if="groups.length" class="space-y-8">
        <section v-for="group in groups" :key="group.time">
          <!-- Group header -->
          <div class="flex items-center justify-between mb-3">
            <h2 class="text-xl font-bold text-meridian-900 dark:text-white">{{ formatTime(group.time) }}</h2>
            <button
              type="button"
              class="text-xs font-semibold tracking-wide text-blue-600 hover:text-blue-700 dark:text-blue-400 btn-focus-ring rounded"
              @click="markAllDoses(group)"
            >
              MARK ALL DOSES
            </button>
          </div>

          <!-- Cards -->
          <div class="space-y-3">
            <article
              v-for="item in group.items" :key="item.id"
              class="relative rounded-2xl border p-4 shadow-sm transition-colors"
              :class="statusStyles[getStatus(item)].card"
            >
              <!-- Checkbox circle -->
              <button
                type="button"
                class="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full border-2 transition-colors btn-focus-ring"
                :class="getStatus(item) === 'taken'
                  ? 'border-blue-600 bg-blue-600 text-white'
                  : 'border-gray-300 bg-white dark:border-white/20 dark:bg-transparent'"
                :aria-label="`Toggle ${item.medicine} taken`"
                @click="toggleTaken(item)"
              >
                <CheckIcon v-if="getStatus(item) === 'taken'" class="h-4 w-4" stroke-width="3" />
              </button>

              <div class="pr-10">
                <h3 class="text-lg font-semibold text-meridian-900 dark:text-white">{{ item.medicine }}</h3>
                <p v-if="item.dose || item.instruction" class="text-sm text-gray-500 dark:text-meridian-300">
                  {{ [item.dose, item.instruction].filter(Boolean).join(', ') }}
                </p>
                <p v-if="item.frequency" class="text-sm italic text-gray-400 dark:text-meridian-400">{{ item.frequency }}</p>

                <span
                  class="mt-2 inline-block rounded-md px-2.5 py-0.5 text-[11px] font-bold tracking-wider"
                  :class="statusStyles[getStatus(item)].badge"
                >
                  {{ statusStyles[getStatus(item)].label }}
                </span>

                <div class="mt-3 flex gap-2">
                  <button
                    type="button"
                    class="rounded-full border px-4 py-1 text-sm font-medium transition-colors btn-focus-ring"
                    :class="getStatus(item) === 'taken'
                      ? 'border-green-600 text-green-700 bg-white dark:bg-transparent dark:text-green-400'
                      : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50 dark:border-white/20 dark:bg-transparent dark:text-meridian-100'"
                    @click="markTaken(item)"
                  >
                    Taken
                  </button>
                  <button
                    type="button"
                    class="rounded-full border px-4 py-1 text-sm font-medium transition-colors btn-focus-ring"
                    :class="getStatus(item) === 'skipped'
                      ? 'border-orange-500 text-orange-700 bg-white dark:bg-transparent dark:text-orange-400'
                      : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50 dark:border-white/20 dark:bg-transparent dark:text-meridian-100'"
                    @click="markSkipped(item)"
                  >
                    Skipped
                  </button>
                </div>
              </div>
            </article>
          </div>
        </section>
      </div>

      <EmptyState v-else title="No doses scheduled" message="Add a reminder to start tracking this day.">
        <template #icon><ClockIcon class="h-8 w-8 text-meridian-400" /></template>
      </EmptyState>
    </div>

    <BaseModal v-model="addOpen" title="Add medicine reminder" size="sm">
      <form @submit.prevent="addReminder" class="space-y-4">
        <BaseInput v-model="form.medicine" label="Medicine" placeholder="e.g. Metformin 500mg" required />
        <BaseInput v-model="form.time" type="time" label="Time" required />
        <BaseSelect v-model="form.frequency" label="Frequency" :options="freqOptions" />
        <div class="flex justify-end gap-3 pt-2">
          <BaseButton type="button" variant="outline" @click="addOpen = false">Cancel</BaseButton>
          <BaseButton type="submit">Add reminder</BaseButton>
        </div>
      </form>
    </BaseModal>
  </DashboardLayout>
</template>