<script setup>
import { computed } from 'vue'
const props = defineProps({
  tone: { type: String, default: 'neutral' }, // neutral | success | warning | danger | info
})
const tones = {
  neutral: 'bg-meridian-100 text-meridian-700 dark:bg-white/10 dark:text-meridian-200',
  success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  warning: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  danger: 'bg-pulse-100 text-pulse-700 dark:bg-pulse-500/15 dark:text-pulse-300',
  info: 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300',
}
const classes = computed(() => tones[props.tone])
</script>

<template>
  <span :class="['inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium', classes]">
    <span class="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
    <slot />
  </span>
</template>
