<script setup>
import { useThemeStore } from '@/stores/theme'
import PulseLine from '@/components/ui/PulseLine.vue'
import { HeartIcon, SunIcon, MoonIcon } from '@heroicons/vue/24/outline'

defineProps({
  eyebrow: { type: String, default: 'CareConnect' },
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
})
const theme = useThemeStore()
</script>

<template>
  <div class="min-h-screen grid lg:grid-cols-2 bg-surface-light dark:bg-surface-dark">
    <!-- Brand panel -->
    <div class="relative hidden lg:flex flex-col justify-between overflow-hidden bg-meridian-900 p-12 text-white">
      <div class="absolute inset-0 opacity-20" style="background-image: radial-gradient(circle at 20% 20%, #3fb090 0%, transparent 40%), radial-gradient(circle at 80% 70%, #ff6b5b 0%, transparent 35%);" />
      <div class="relative flex items-center gap-2.5">
        <span class="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
          <HeartIcon class="h-5 w-5" />
        </span>
        <span class="font-display font-semibold">CareConnect</span>
      </div>

      <div class="relative max-w-md">
        <p class="text-xs font-medium uppercase tracking-widest text-meridian-300 mb-4">AI-Powered Care, Always On Schedule</p>
        <h2 class="font-display text-3xl font-semibold leading-tight mb-4">
          One heartbeat, one timeline, every dose accounted for.
        </h2>
        <p class="text-meridian-200 text-sm leading-relaxed">
          CareConnect brings doctors, pharmacists, patients, and caretakers onto a single
          rhythm — prescriptions, reminders, and records that stay in sync automatically.
        </p>
        <PulseLine class="mt-8 text-pulse-400" />
      </div>

      <p class="relative text-xs text-meridian-400">© 2026 CareConnect Health Systems</p>
    </div>

    <!-- Form panel -->
    <div class="flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16 relative">
      <button
        @click="theme.toggle()"
        class="absolute top-6 right-6 rounded-lg p-2 text-meridian-500 hover:bg-meridian-50 dark:hover:bg-white/5 btn-focus-ring"
        aria-label="Toggle color theme"
      >
        <SunIcon v-if="theme.mode === 'dark'" class="h-5 w-5" />
        <MoonIcon v-else class="h-5 w-5" />
      </button>

      <div class="mx-auto w-full max-w-sm animate-fade-up">
        <div class="lg:hidden flex items-center gap-2.5 mb-8">
          <span class="flex h-9 w-9 items-center justify-center rounded-lg bg-meridian-600 text-white">
            <HeartIcon class="h-5 w-5" />
          </span>
          <span class="font-display font-semibold text-meridian-900 dark:text-white">CareConnect</span>
        </div>
        <p class="text-xs font-medium uppercase tracking-widest text-pulse-500 mb-2">{{ eyebrow }}</p>
        <h1 class="font-display text-2xl font-semibold text-meridian-900 dark:text-white mb-2">{{ title }}</h1>
        <p v-if="subtitle" class="text-sm text-meridian-500 dark:text-meridian-400 mb-8">{{ subtitle }}</p>
        <slot />
      </div>
    </div>
  </div>
</template>
