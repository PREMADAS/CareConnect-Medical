<script setup>
import { ArrowUpRightIcon, ArrowDownRightIcon } from '@heroicons/vue/20/solid'

defineProps({
  label: { type: String, required: true },
  value: { type: [String, Number], required: true },
  delta: { type: String, default: '' }, // e.g. "+12.4%"
  trend: { type: String, default: 'up' }, // up | down
  tone: { type: String, default: 'meridian' }, // meridian | pulse
})
</script>

<template>
  <div class="card-base p-5 hover:shadow-md transition-shadow animate-fade-up">
    <div class="flex items-start justify-between">
      <div>
        <p class="text-xs font-medium uppercase tracking-wide text-meridian-500 dark:text-meridian-400">{{ label }}</p>
        <p class="mt-2 font-display text-2xl font-semibold text-meridian-900 dark:text-white">{{ value }}</p>
      </div>
      <span
        class="flex h-10 w-10 items-center justify-center rounded-xl"
        :class="tone === 'pulse' ? 'bg-pulse-50 dark:bg-pulse-500/10 text-pulse-500' : 'bg-meridian-50 dark:bg-meridian-500/10 text-meridian-600'"
      >
        <slot name="icon" />
      </span>
    </div>
    <div v-if="delta" class="mt-3 flex items-center gap-1 text-xs font-medium" :class="trend === 'up' ? 'text-emerald-600' : 'text-pulse-600'">
      <ArrowUpRightIcon v-if="trend === 'up'" class="h-3.5 w-3.5" />
      <ArrowDownRightIcon v-else class="h-3.5 w-3.5" />
      {{ delta }}
      <span class="text-meridian-400 font-normal">vs last month</span>
    </div>
  </div>
</template>
