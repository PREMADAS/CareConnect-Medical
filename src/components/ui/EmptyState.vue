<script setup>
defineProps({
  title: { type: String, required: true },
  message: { type: String, default: '' },
  actionLabel: { type: String, default: '' },
})
defineEmits(['action'])
</script>

<template>
  <div class="flex flex-col items-center justify-center py-16 px-6 text-center">
    <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-meridian-50 dark:bg-white/5">
      <slot name="icon" />
    </div>
    <h3 class="font-display font-semibold text-meridian-900 dark:text-white">{{ title }}</h3>
    <p v-if="message" class="mt-1.5 max-w-sm text-sm text-meridian-500 dark:text-meridian-400">{{ message }}</p>
    <button
      v-if="actionLabel"
      @click="$emit('action')"
      class="mt-5 rounded-lg bg-meridian-600 px-4 py-2 text-sm font-medium text-white hover:bg-meridian-700 btn-focus-ring"
    >
      {{ actionLabel }}
    </button>
  </div>
</template>
