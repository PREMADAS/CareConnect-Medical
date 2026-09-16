<script setup>
import { ref, computed, onMounted } from 'vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
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
const currentTab = ref('All')
const bookOpen = ref(false)
const cancelOpen = ref(false)
const updateOpen = ref(false)

const toCancel = ref(null)
const toUpdate = ref(null)
const cancelling = ref(false)

const statusTone = { confirmed: 'success', pending: 'warning', completed: 'info', cancelled: 'danger' }

const form = ref({ doctor: '', date: '', time: '', mode: 'In-person' })
const updateForm = ref({ date: '', time: '' })
const modeOptions = [{ label: 'In-person', value: 'In-person' }, { label: 'Video', value: 'Video' }]

// Filter Tab Counts
const tabCounts = computed(() => ({
  All: appointments.value.length,
  Upcoming: appointments.value.filter(a => a.status === 'confirmed' || a.status === 'pending').length,
  Completed: appointments.value.filter(a => a.status === 'completed').length,
  Cancelled: appointments.value.filter(a => a.status === 'cancelled').length,
}))

// Filtered Appointments List
const filteredAppointments = computed(() => {
  if (currentTab.value === 'Upcoming') return appointments.value.filter(a => a.status === 'confirmed' || a.status === 'pending')
  if (currentTab.value === 'Completed') return appointments.value.filter(a => a.status === 'completed')
  if (currentTab.value === 'Cancelled') return appointments.value.filter(a => a.status === 'cancelled')
  return appointments.value
})

function book() {
  appointments.value.unshift({
    id: `apt_${Date.now()}`, 
    patient: auth.user?.name || 'Patient', 
    doctor: form.value.doctor, 
    specialty: 'General',
    date: form.value.date, 
    time: form.value.time, 
    mode: form.value.mode, 
    status: 'pending',
  })
  bookOpen.value = false
  ui.toast({ type: 'success', title: 'Appointment requested', message: 'Waiting for confirmation.' })
  form.value = { doctor: '', date: '', time: '', mode: 'In-person' }
}

function confirmAppointment(row) {
  row.status = 'confirmed'
  ui.toast({ type: 'success', title: 'Appointment confirmed' })
}

function openUpdate(row) {
  toUpdate.value = row
  updateForm.value = { date: row.date, time: row.time }
  updateOpen.value = true
}

function handleUpdate() {
  if (toUpdate.value) {
    toUpdate.value.date = updateForm.value.date
    toUpdate.value.time = updateForm.value.time
    ui.toast({ type: 'success', title: 'Schedule updated' })
  }
  updateOpen.value = false
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
      <div>
        <h1 class="font-display text-2xl font-semibold text-meridian-900 dark:text-white">Appointments</h1>
        <p class="text-xs text-meridian-600 dark:text-meridian-400 mt-1">{{ appointments.length }} appointments across this month</p>
      </div>

      <BaseButton v-if="['patient','caretaker'].includes(auth.role)" @click="bookOpen = true">
        <template #icon-left><PlusIcon class="h-5 w-5" /></template>Book appointment
      </BaseButton>
    </div>

    <!-- Filter Tabs (From Image) -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-1 bg-meridian-100 dark:bg-meridian-800 p-1 rounded-xl">
        <button 
          v-for="(count, tab) in tabCounts" 
          :key="tab"
          @click="currentTab = tab"
          :class="[
            'flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors',
            currentTab === tab 
              ? 'bg-white dark:bg-meridian-700 text-meridian-900 dark:text-white shadow-xs' 
              : 'text-meridian-600 dark:text-meridian-400 hover:text-meridian-900'
          ]"
        >
          {{ tab }}
          <span class="px-1.5 py-0.2 rounded-full text-[10px]" :class="currentTab === tab ? 'bg-meridian-100 dark:bg-meridian-600' : 'bg-meridian-200 dark:bg-meridian-700'">
            {{ count }}
          </span>
        </button>
      </div>

      <span class="text-xs text-meridian-500 font-medium cursor-pointer">≡ Sorted by date</span>
    </div>

    <!-- Data Table Card List -->
    <div class="space-y-3">
      <div 
        v-for="row in filteredAppointments" 
        :key="row.id"
        class="flex items-center justify-between p-4 bg-white dark:bg-meridian-800 rounded-xl border border-meridian-100 dark:border-meridian-700"
      >
        <div class="flex items-center gap-4">
          <div class="text-xs font-semibold text-meridian-900 dark:text-white w-16">{{ row.time }}</div>
          <div>
            <div class="text-sm font-semibold text-meridian-900 dark:text-white">
              {{ auth.role === 'doctor' ? row.patient : row.doctor }}
            </div>
            <div class="text-xs text-meridian-500">{{ row.date }}</div>
          </div>
        </div>

        <div class="flex items-center gap-4">
          <div class="text-xs text-meridian-600 dark:text-meridian-400">{{ row.mode }}</div>
          
          <BaseBadge :tone="statusTone[row.status]">{{ row.status }}</BaseBadge>

          <!-- Buttons: Confirm | Update | Cancel -->
          <div class="flex items-center gap-3 border-l border-meridian-200 dark:border-meridian-700 pl-3">
            <!-- Confirm Button (Doctor dynamically sees when status is pending) -->
            <button 
              v-if="row.status === 'pending' && auth.role === 'doctor'" 
              @click="confirmAppointment(row)" 
              class="text-xs font-medium text-emerald-600 hover:text-emerald-700"
            >
              Confirm
            </button>

            <!-- Update Button (Middle button to change date/time) -->
            <button 
              v-if="row.status !== 'cancelled' && row.status !== 'completed'" 
              @click="openUpdate(row)" 
              class="text-xs font-medium text-meridian-600 dark:text-meridian-300 hover:text-meridian-800"
            >
              Update
            </button>

            <!-- Cancel Button -->
            <button 
              v-if="row.status !== 'cancelled' && row.status !== 'completed'" 
              @click="askCancel(row)" 
              class="text-xs font-medium text-pulse-600 hover:text-pulse-700"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Book Modal -->
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

    <!-- Update Schedule Modal -->
    <BaseModal v-model="updateOpen" title="Update Appointment Schedule" size="sm">
      <form @submit.prevent="handleUpdate" class="space-y-4">
        <BaseInput v-model="updateForm.date" type="date" label="New Date" required />
        <BaseInput v-model="updateForm.time" type="time" label="New Time" required />
        <div class="flex justify-end gap-3 pt-2">
          <BaseButton type="button" variant="outline" @click="updateOpen = false">Cancel</BaseButton>
          <BaseButton type="submit">Update</BaseButton>
        </div>
      </form>
    </BaseModal>

    <!-- Confirm Modal -->
    <ConfirmModal v-model="cancelOpen" title="Cancel appointment?" message="The other party will be notified of the cancellation." confirm-label="Cancel appointment" :loading="cancelling" @confirm="confirmCancel" />
  </DashboardLayout>
</template>