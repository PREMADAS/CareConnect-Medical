<script setup>
import { useRouter } from 'vue-router'
import BaseButton from '@/components/ui/BaseButton.vue'
import PulseLine from '@/components/ui/PulseLine.vue'
import { HomeIcon } from '@heroicons/vue/24/outline'

const router = useRouter()
</script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-surface-light dark:bg-surface-dark px-6 text-center">
    <p class="font-display text-8xl font-semibold text-meridian-100 dark:text-white/10 select-none">404</p>
    <PulseLine class="w-40 -mt-6 mb-4 text-pulse-400" />
    <h1 class="font-display text-2xl font-semibold text-meridian-900 dark:text-white mb-2">This page flatlined</h1>
    <p class="max-w-sm text-sm text-meridian-500 dark:text-meridian-400 mb-8">
      We couldn't find the page you were looking for. It may have moved, or the link may be out of date.
    </p>
    <div class="flex gap-3">
      <BaseButton variant="outline" @click="router.back()">Go back</BaseButton>
      <BaseButton @click="router.push('/login')">
        <template #icon-left><HomeIcon class="h-5 w-5" /></template>
        Return home
      </BaseButton>
    </div>
  </div>
</template>
