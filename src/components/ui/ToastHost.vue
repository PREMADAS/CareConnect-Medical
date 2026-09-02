<script setup>
import { useUiStore } from '@/stores/ui'
import { CheckCircleIcon, ExclamationCircleIcon, InformationCircleIcon, XMarkIcon } from '@heroicons/vue/24/solid'

const ui = useUiStore()

const icons = { success: CheckCircleIcon, danger: ExclamationCircleIcon, warning: ExclamationCircleIcon, info: InformationCircleIcon }
const tones = {
  success: 'text-emerald-500',
  danger: 'text-pulse-500',
  warning: 'text-amber-500',
  info: 'text-sky-500',
}
</script>

<template>
  <div class="fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-3" aria-live="polite">
    <transition-group name="toast">
      <div v-for="t in ui.toasts" :key="t.id" class="glass-panel flex items-start gap-3 p-4 animate-fade-up">
        <component :is="icons[t.type] || icons.info" :class="['h-5 w-5 shrink-0 mt-0.5', tones[t.type] || tones.info]" />
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-meridian-900 dark:text-white">{{ t.title }}</p>
          <p v-if="t.message" class="text-xs text-meridian-500 dark:text-meridian-300 mt-0.5">{{ t.message }}</p>
        </div>
        <button @click="ui.dismiss(t.id)" class="text-meridian-400 hover:text-meridian-600" aria-label="Dismiss">
          <XMarkIcon class="h-4 w-4" />
        </button>
      </div>
    </transition-group>
  </div>
</template>

<style scoped>
.toast-enter-active, .toast-leave-active { transition: all 0.25s ease; }
.toast-enter-from { opacity: 0; transform: translateX(16px); }
.toast-leave-to { opacity: 0; transform: translateX(16px); }
</style>
