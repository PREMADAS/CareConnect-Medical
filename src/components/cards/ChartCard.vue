<script setup>
defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
})
</script>

<template>
  <div class="card-base p-5">
    <div class="flex items-start justify-between mb-4">
      <div>
        <h3 class="font-display font-semibold text-meridian-900 dark:text-white">{{ title }}</h3>
        <p v-if="subtitle" class="text-xs text-meridian-500 dark:text-meridian-400 mt-0.5">{{ subtitle }}</p>
      </div>
      <slot name="actions" />
    </div>
    <slot />
  </div>
</template>
