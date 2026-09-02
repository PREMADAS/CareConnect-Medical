<script setup>
defineProps({
  modelValue: Boolean,
  label: { type: String, default: '' },
  description: { type: String, default: '' },
})
defineEmits(['update:modelValue'])
</script>

<template>
  <div class="flex items-center justify-between gap-4 py-3">
    <div>
      <p class="text-sm font-medium text-meridian-800 dark:text-meridian-100">{{ label }}</p>
      <p v-if="description" class="text-xs text-meridian-500 dark:text-meridian-400 mt-0.5">{{ description }}</p>
    </div>
    <button
      type="button"
      role="switch"
      :aria-checked="modelValue"
      @click="$emit('update:modelValue', !modelValue)"
      class="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors btn-focus-ring"
      :class="modelValue ? 'bg-meridian-600' : 'bg-meridian-200 dark:bg-white/15'"
    >
      <span
        class="inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform"
        :class="modelValue ? 'translate-x-6' : 'translate-x-1'"
      />
    </button>
  </div>
</template>
