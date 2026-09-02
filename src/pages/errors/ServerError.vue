<script setup>
import BaseButton from '@/components/ui/BaseButton.vue'
import PulseLine from '@/components/ui/PulseLine.vue'
import { ArrowPathIcon } from '@heroicons/vue/24/outline'
</script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-surface-light dark:bg-surface-dark px-6 text-center">
    <p class="font-display text-8xl font-semibold text-meridian-100 dark:text-white/10 select-none">500</p>
    <PulseLine class="w-40 -mt-6 mb-4 text-pulse-400" />
    <h1 class="font-display text-2xl font-semibold text-meridian-900 dark:text-white mb-2">Something went wrong on our end</h1>
    <p class="max-w-sm text-sm text-meridian-500 dark:text-meridian-400 mb-8">
      Our team has been notified. Try reloading the page — your data hasn't been affected.
    </p>
    <BaseButton @click="() => location.reload()">
      <template #icon-left><ArrowPathIcon class="h-5 w-5" /></template>
      Reload page
    </BaseButton>
  </div>
</template>
