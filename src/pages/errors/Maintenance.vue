<script setup>
import PulseLine from '@/components/ui/PulseLine.vue'
import { WrenchScrewdriverIcon } from '@heroicons/vue/24/outline'
</script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-surface-light dark:bg-surface-dark px-6 text-center">
    <span class="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-meridian-50 dark:bg-white/5 text-meridian-600">
      <WrenchScrewdriverIcon class="h-8 w-8" />
    </span>
    <h1 class="font-display text-2xl font-semibold text-meridian-900 dark:text-white mb-2">CareConnect is getting a check-up</h1>
    <p class="max-w-md text-sm text-meridian-500 dark:text-meridian-400 mb-6">
      We're performing scheduled maintenance to keep your health data safe and reliable.
      We expect to be back online shortly.
    </p>
    <PulseLine class="w-48 text-pulse-400" />
    <p class="mt-6 text-xs text-meridian-400">Estimated downtime: 30 minutes · Started 08:00 UTC</p>
  </div>
</template>
