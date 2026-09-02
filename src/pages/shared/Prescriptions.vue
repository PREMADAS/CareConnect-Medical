<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import DataTable from '@/components/tables/DataTable.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseModal from '@/components/modals/BaseModal.vue'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'
import prescriptionsData from '@/data/prescriptions.json'
import { PlusIcon, QrCodeIcon, EyeIcon } from '@heroicons/vue/24/outline'

const router = useRouter()
const auth = useAuthStore()
const ui = useUiStore()
const loading = ref(true)
onMounted(() => setTimeout(() => (loading.value = false), 500))

const prescriptions = ref(prescriptionsData)
const detailOpen = ref(false)
const selected = ref(null)

const columns = [
  { key: 'id', label: 'Rx ID', sortable: true },
  { key: 'patient', label: 'Patient', sortable: true },
  { key: 'doctor', label: 'Doctor', sortable: true },
  { key: 'issuedOn', label: 'Issued', sortable: true },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: '' },
]
const statusTone = { active: 'info', pending: 'warning', fulfilled: 'success', expired: 'danger' }

function openDetail(row) {
  selected.value = row
  detailOpen.value = true
}
function fulfill(row) {
  row.status = 'fulfilled'
  ui.toast({ type: 'success', title: 'Prescription fulfilled', message: `${row.id} marked as dispensed.` })
  detailOpen.value = false
}

function goToCreate() {
  router.push({ name: 'prescription-create' })
}
</script>

<template>
  <DashboardLayout>
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="font-display text-2xl font-semibold text-meridian-900 dark:text-white">Prescriptions</h1>
        <p class="text-sm text-meridian-500 dark:text-meridian-400 mt-1">
          {{ auth.role === 'doctor' ? 'Prescriptions you have issued.' : auth.role === 'pharmacist' ? 'Incoming prescriptions to fulfill.' : 'Your prescription history.' }}
        </p>
      </div>
      <BaseButton v-if="auth.role === 'doctor'" @click="goToCreate">
        <template #icon-left><PlusIcon class="h-5 w-5" /></template>New prescription
      </BaseButton>
    </div>

    <DataTable :columns="columns" :rows="prescriptions" :loading="loading" empty-title="No prescriptions yet" empty-message="Issued prescriptions will appear here.">
      <template #cell-status="{ value }"><BaseBadge :tone="statusTone[value]">{{ value }}</BaseBadge></template>
      <template #cell-actions="{ row }">
        <button @click="openDetail(row)" class="inline-flex items-center gap-1 text-xs font-medium text-meridian-600 hover:text-pulse-500">
          <EyeIcon class="h-4 w-4" /> View
        </button>
      </template>
    </DataTable>

    <BaseModal v-model="detailOpen" :title="selected?.id" size="md">
      <template v-if="selected">
        <div class="flex items-center justify-between mb-4">
          <div>
            <p class="text-sm font-medium text-meridian-900 dark:text-white">{{ selected.patient }}</p>
            <p class="text-xs text-meridian-500">Issued by {{ selected.doctor }} · {{ selected.issuedOn }}</p>
          </div>
          <BaseBadge :tone="statusTone[selected.status]">{{ selected.status }}</BaseBadge>
        </div>
        <div class="space-y-2.5 mb-4">
          <div v-for="(item, i) in selected.items" :key="i" class="rounded-lg border border-meridian-100 dark:border-white/10 p-3">
            <p class="text-sm font-medium text-meridian-800 dark:text-meridian-100">{{ item.medicine }}</p>
            <p class="text-xs text-meridian-500">{{ item.dosage }} · {{ item.frequency }} · {{ item.duration }}</p>
          </div>
        </div>
        <div class="flex items-center gap-2 rounded-lg bg-meridian-50 dark:bg-white/5 p-3 mb-4">
          <QrCodeIcon class="h-5 w-5 text-meridian-500" />
          <span class="font-mono text-xs text-meridian-600 dark:text-meridian-300">{{ selected.qrCode }}</span>
        </div>
        <div class="flex justify-end gap-3">
          <BaseButton variant="outline" @click="detailOpen = false">Close</BaseButton>
          <BaseButton v-if="auth.role === 'pharmacist' && selected.status !== 'fulfilled'" @click="fulfill(selected)">Mark as fulfilled</BaseButton>
        </div>
      </template>
    </BaseModal>
  </DashboardLayout>
</template>