<script setup>
import { computed } from 'vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'
import { ArrowDownTrayIcon, ShareIcon } from '@heroicons/vue/24/outline'

const auth = useAuthStore()
const ui = useUiStore()
const code = `CC-ID-${auth.user?.id?.toUpperCase() || 'GUEST'}`

// Deterministic pseudo-QR pattern purely for visual representation (not a real scannable code)
function seededGrid(seed, size = 21) {
  let s = 0
  for (const c of seed) s = (s * 31 + c.charCodeAt(0)) % 100000
  const cells = []
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      s = (s * 1103515245 + 12345) % 2147483648
      const isFinder =
        (x < 7 && y < 7) || (x > size - 8 && y < 7) || (x < 7 && y > size - 8)
      cells.push({ x, y, on: isFinder ? finderPattern(x, y, size) : s % 100 < 42 })
    }
  }
  return cells
}
function finderPattern(x, y, size) {
  const local = (px) => (px < 7 ? px : px > size - 8 ? px - (size - 7) : -1)
  const lx = x < 7 ? x : x > size - 8 ? x - (size - 7) : local(x)
  const ly = y < 7 ? y : local(y)
  if (lx < 0 || ly < 0) return false
  const border = lx === 0 || lx === 6 || ly === 0 || ly === 6
  const core = lx >= 2 && lx <= 4 && ly >= 2 && ly <= 4
  return border || core
}
const grid = computed(() => seededGrid(code))
const cell = 220 / 21

function download() {
  ui.toast({ type: 'success', title: 'QR code saved', message: 'Downloaded to your device.' })
}
function share() {
  ui.toast({ type: 'info', title: 'Share link copied', message: 'Send it to your pharmacist or caretaker.' })
}
</script>

<template>
  <DashboardLayout>
    <h1 class="font-display text-2xl font-semibold text-meridian-900 dark:text-white mb-1">My QR Code</h1>
    <p class="text-sm text-meridian-500 dark:text-meridian-400 mb-6">Show this at any partner pharmacy to verify your identity and active prescriptions.</p>

    <div class="max-w-sm mx-auto card-base p-8 text-center">
      <div class="mx-auto mb-5 flex h-64 w-64 items-center justify-center rounded-2xl bg-white border border-meridian-100">
        <svg viewBox="0 0 220 220" width="220" height="220">
          <rect x="0" y="0" width="220" height="220" fill="white" />
          <rect v-for="(c, i) in grid" :key="i" v-show="c.on" :x="c.x * cell" :y="c.y * cell" :width="cell" :height="cell" fill="#0b1f1c" />
        </svg>
      </div>
      <p class="font-mono text-sm font-medium text-meridian-900 dark:text-white">{{ code }}</p>
      <p class="text-xs text-meridian-500 mt-1">{{ auth.user?.name }}</p>
      <BaseBadge tone="success" class="mt-3">Active</BaseBadge>

      <div class="flex gap-3 mt-6">
        <BaseButton variant="outline" block @click="download"><template #icon-left><ArrowDownTrayIcon class="h-5 w-5" /></template>Save</BaseButton>
        <BaseButton block @click="share"><template #icon-left><ShareIcon class="h-5 w-5" /></template>Share</BaseButton>
      </div>
    </div>
  </DashboardLayout>
</template>
