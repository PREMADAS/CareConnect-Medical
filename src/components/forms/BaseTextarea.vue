<script setup>
import { useId } from 'vue'
defineProps({
  modelValue: { type: String, default: '' },
  label: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  rows: { type: Number, default: 4 },
  error: { type: String, default: '' },
})
defineEmits(['update:modelValue'])
const id = useId()
</script>

<template>
  <div class="w-full">
    <label v-if="label" :for="id" class="block text-sm font-medium text-meridian-800 dark:text-meridian-100 mb-1.5">{{ label }}</label>
    <textarea
      :id="id"
      :rows="rows"
      :value="modelValue"
      :placeholder="placeholder"
      @input="$emit('update:modelValue', $event.target.value)"
      class="w-full rounded-lg border bg-white/60 dark:bg-white/5 px-3.5 py-2.5 text-sm text-meridian-900 dark:text-white placeholder:text-meridian-400 focus:outline-none focus:ring-2 focus:ring-pulse-400/60 resize-none"
      :class="error ? 'border-pulse-500' : 'border-meridian-200 dark:border-white/15'"
    />
    <p v-if="error" class="mt-1.5 text-xs text-pulse-600 dark:text-pulse-400">{{ error }}</p>
  </div>
</template>
