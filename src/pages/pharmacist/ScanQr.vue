<script setup>
import { ref } from 'vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/forms/BaseInput.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import { useUiStore } from '@/stores/ui'
import prescriptions from '@/data/prescriptions.json'
import { QrCodeIcon, CheckCircleIcon, ViewfinderCircleIcon } from '@heroicons/vue/24/outline'

const ui = useUiStore()
const manualCode = ref('')
const scanning = ref(false)
const result = ref(null)

function scan() {
  scanning.value = true
  result.value = null
  setTimeout(() => {
    scanning.value = false
    result.value = prescriptions[0]
    ui.toast({ type: 'success', title: 'Prescription found', message: result.value.id })
  }, 1400)
}
function lookupManual() {
  const found = prescriptions.find((p) => p.qrCode === manualCode.value.toUpperCase())
  if (found) {
    result.value = found
    ui.toast({ type: 'success', title: 'Prescription found', message: found.id })
  } else {
    ui.toast({ type: 'danger', title: 'Not found', message: 'No prescription matches that code.' })
  }
}
</script>

<template>
  <DashboardLayout>
    <h1 class="font-display text-2xl font-semibold text-meridian-900 dark:text-white mb-6">Scan Prescription</h1>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="card-base p-6 flex flex-col items-center text-center">
        <div class="relative flex h-64 w-64 items-center justify-center rounded-2xl border-2 border-dashed border-meridian-300 dark:border-white/15 bg-meridian-50/50 dark:bg-white/5 overflow-hidden">
          <ViewfinderCircleIcon class="h-16 w-16 text-meridian-300" />
          <div v-if="scanning" class="absolute inset-x-4 h-0.5 bg-pulse-400 animate-[scan_1.4s_ease-in-out_infinite]" />
        </div>
        <p class="text-sm text-meridian-500 mt-4 mb-4">Position the patient's prescription QR code within the frame.</p>
        <BaseButton :loading="scanning" @click="scan">
          <template #icon-left><QrCodeIcon class="h-5 w-5" /></template>
          {{ scanning ? 'Scanning…' : 'Start scan' }}
        </BaseButton>

        <div class="w-full mt-6 pt-6 border-t border-meridian-100 dark:border-white/10">
          <p class="text-xs font-medium text-meridian-500 mb-2 text-left">Or enter code manually</p>
          <div class="flex gap-2">
            <BaseInput v-model="manualCode" placeholder="CC-RX-1001-4F2A" />
            <BaseButton variant="outline" @click="lookupManual">Look up</BaseButton>
          </div>
        </div>
      </div>

      <div class="card-base p-6">
        <h3 class="font-display font-semibold text-meridian-900 dark:text-white mb-4">Scan result</h3>
        <div v-if="result" class="animate-fade-up">
          <div class="flex items-center gap-2 text-emerald-600 mb-4">
            <CheckCircleIcon class="h-5 w-5" />
            <span class="text-sm font-medium">Verified prescription</span>
          </div>
          <p class="text-sm font-medium text-meridian-900 dark:text-white">{{ result.patient }}</p>
          <p class="text-xs text-meridian-500 mb-4">Prescribed by {{ result.doctor }} · {{ result.issuedOn }}</p>
          <div class="space-y-2.5">
            <div v-for="(item, i) in result.items" :key="i" class="rounded-lg border border-meridian-100 dark:border-white/10 p-3">
              <p class="text-sm font-medium text-meridian-800 dark:text-meridian-100">{{ item.medicine }}</p>
              <p class="text-xs text-meridian-500">{{ item.dosage }} · {{ item.frequency }} · {{ item.duration }}</p>
            </div>
          </div>
          <BaseBadge tone="info" class="mt-4">{{ result.status }}</BaseBadge>
          <BaseButton block class="mt-4">Dispense medication</BaseButton>
        </div>
        <p v-else class="text-sm text-meridian-500">Scan or enter a code to view prescription details here.</p>
      </div>
    </div>
  </DashboardLayout>
</template>

<style scoped>
@keyframes scan {
  0%, 100% { top: 8%; }
  50% { top: 88%; }
}
</style>
