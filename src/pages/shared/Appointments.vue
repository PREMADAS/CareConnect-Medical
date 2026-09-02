<script setup>
import { ref, onMounted } from 'vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import DataTable from '@/components/tables/DataTable.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseModal from '@/components/modals/BaseModal.vue'
import BaseInput from '@/components/forms/BaseInput.vue'
import BaseSelect from '@/components/forms/BaseSelect.vue'
import ConfirmModal from '@/components/modals/ConfirmModal.vue'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'
import appointmentsData from '@/data/appointments.json'
import { PlusIcon } from '@heroicons/vue/24/outline'

const auth = useAuthStore()
const ui = useUiStore()
const loading = ref(true)
onMounted(() => setTimeout(() => (loading.value = false), 500))

const appointments = ref(appointmentsData)
const bookOpen = ref(false)
const cancelOpen = ref(false)
const toCancel = ref(null)
const cancelling = ref(false)

const columns = [
  { key: 'date', label: 'Date', sortable: true },
  { key: 'time', label: 'Time', sortable: true },
  { key: auth.role === 'doctor' ? 'patient' : 'doctor', label: auth.role === 'doctor' ? 'Patient' : 'Doctor', sortable: true },
  { key: 'mode', label: 'Mode' },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: '' },
]
const statusTone = { confirmed: 'success', pending: 'warning', completed: 'info', cancelled: 'danger' }

const form = ref({ doctor: '', date: '', time: '', mode: 'In-person' })
const modeOptions = [{ label: 'In-person', value: 'In-person' }, { label: 'Video', value: 'Video' }]

function book() {
  appointments.value.unshift({
    id: `apt_${Date.now()}`, patient: auth.user?.name, doctor: form.value.doctor, specialty: 'General',
    date: form.value.date, time: form.value.time, mode: form.value.mode, status: 'pending',
  })
  bookOpen.value = false
  ui.toast({ type: 'success', title: 'Appointment requested', message: 'Waiting for confirmation.' })
  form.value = { doctor: '', date: '', time: '', mode: 'In-person' }
}
function askCancel(row) {
  toCancel.value = row
  cancelOpen.value = true
}
async function confirmCancel() {
  cancelling.value = true
  await new Promise((r) => setTimeout(r, 500))
  toCancel.value.status = 'cancelled'
  cancelling.value = false
  cancelOpen.value = false
  ui.toast({ type: 'info', title: 'Appointment cancelled' })
}
</script>

<template>
  <DashboardLayout>
    <div class="flex items-center justify-between mb-6">
      <h1 class="font-display text-2xl font-semibold text-meridian-900 dark:text-white">Appointments</h1>
      <BaseButton v-if="['patient','caretaker'].includes(auth.role)" @click="bookOpen = true">
        <template #icon-left><PlusIcon class="h-5 w-5" /></template>Book appointment
      </BaseButton>
    </div>

    <DataTable :columns="columns" :rows="appointments" :loading="loading" empty-title="No appointments scheduled" empty-message="Book an appointment to see it listed here.">
      <template #cell-status="{ value }"><BaseBadge :tone="statusTone[value]">{{ value }}</BaseBadge></template>
      <template #cell-actions="{ row }">
        <button v-if="row.status !== 'cancelled' && row.status !== 'completed'" @click="askCancel(row)" class="text-xs font-medium text-pulse-600 hover:text-pulse-700">Cancel</button>
      </template>
    </DataTable>

    <BaseModal v-model="bookOpen" title="Book an appointment" size="sm">
      <form @submit.prevent="book" class="space-y-4">
        <BaseInput v-model="form.doctor" label="Doctor" placeholder="Dr. Marcus Reyes" required />
        <div class="grid grid-cols-2 gap-4">
          <BaseInput v-model="form.date" type="date" label="Date" required />
          <BaseInput v-model="form.time" type="time" label="Time" required />
        </div>
        <BaseSelect v-model="form.mode" label="Mode" :options="modeOptions" />
        <div class="flex justify-end gap-3 pt-2">
          <BaseButton type="button" variant="outline" @click="bookOpen = false">Cancel</BaseButton>
          <BaseButton type="submit">Request appointment</BaseButton>
        </div>
      </form>
    </BaseModal>

    <ConfirmModal v-model="cancelOpen" title="Cancel appointment?" message="The other party will be notified of the cancellation." confirm-label="Cancel appointment" :loading="cancelling" @confirm="confirmCancel" />
  </DashboardLayout>
</template>
