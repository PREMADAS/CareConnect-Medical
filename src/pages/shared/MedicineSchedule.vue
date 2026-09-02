<script setup>
import { ref, computed, onMounted } from 'vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
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

function markTaken(item) {
  item.taken = true
  ui.toast({ type: 'success', title: 'Dose logged', message: `${item.medicine} marked as taken at ${item.time}.` })
}
function addReminder() {
  schedule.value.push({
    id: `sch_${Date.now()}`, medicine: form.value.medicine, time: form.value.time, taken: false, date: activeDate.value,
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
      <ol v-else-if="dayItems.length" class="relative border-l-2 border-dashed border-meridian-200 dark:border-white/10 ml-4 space-y-6 py-2">
        <li v-for="item in dayItems" :key="item.id" class="relative pl-6">
          <span
            class="absolute -left-[9px] top-0.5 flex h-4 w-4 items-center justify-center rounded-full ring-4 ring-white dark:ring-surface-darkcard"
            :class="item.taken ? 'bg-meridian-600' : 'bg-pulse-400'"
          >
            <CheckIcon v-if="item.taken" class="h-2.5 w-2.5 text-white" />
          </span>
          <div class="flex items-center justify-between flex-wrap gap-3">
            <div>
              <p class="text-sm font-medium text-meridian-800 dark:text-meridian-100 flex items-center gap-1.5">
                <ClockIcon class="h-4 w-4 text-meridian-400" /> {{ item.time }} — {{ item.medicine }}
              </p>
              <BaseBadge :tone="item.taken ? 'success' : 'warning'" class="mt-1.5">{{ item.taken ? 'Taken' : 'Pending' }}</BaseBadge>
            </div>
            <BaseButton v-if="!item.taken" size="sm" variant="outline" @click="markTaken(item)">Mark taken</BaseButton>
          </div>
        </li>
      </ol>
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
