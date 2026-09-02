<script setup>
import { useId } from 'vue'
defineProps({ modelValue: Boolean, label: { type: String, default: '' } })
defineEmits(['update:modelValue'])
const id = useId()
</script>

<template>
  <label :for="id" class="inline-flex items-center gap-2.5 cursor-pointer select-none">
    <input
      :id="id"
      type="checkbox"
      :checked="modelValue"
      @change="$emit('update:modelValue', $event.target.checked)"
      class="h-4 w-4 rounded border-meridian-300 dark:border-white/20 text-meridian-600 focus:ring-pulse-400/60 accent-meridian-600"
    />
    <span class="text-sm text-meridian-700 dark:text-meridian-200">{{ label }}</span>
  </label>
</template>
