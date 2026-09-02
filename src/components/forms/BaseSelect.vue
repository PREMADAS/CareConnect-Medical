<script setup>
import { useId } from 'vue'

defineProps({
  modelValue: { type: [String, Number], default: '' },
  label: { type: String, default: '' },
  options: { type: Array, default: () => [] }, // [{ label, value }]
  placeholder: { type: String, default: 'Select an option' },
  error: { type: String, default: '' },
  required: { type: Boolean, default: false },
})
defineEmits(['update:modelValue'])
const selectId = useId()
</script>

<template>
  <div class="w-full">
    <label v-if="label" :for="selectId" class="block text-sm font-medium text-meridian-800 dark:text-meridian-100 mb-1.5">
      {{ label }} <span v-if="required" class="text-pulse-500">*</span>
    </label>
    <select
      :id="selectId"
      :value="modelValue"
      @change="$emit('update:modelValue', $event.target.value)"
      class="w-full rounded-lg border bg-white/60 dark:bg-white/5 px-3.5 py-2.5 text-sm text-meridian-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pulse-400/60 appearance-none bg-no-repeat bg-[right_0.9rem_center]"
      :class="error ? 'border-pulse-500' : 'border-meridian-200 dark:border-white/15'"
      style='background-image: url("data:image/svg+xml,%3Csvg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"%23249478\" stroke-width=\"2\"%3E%3Cpath d=\"M6 9l6 6 6-6\"/%3E%3C/svg%3E"); background-size: 16px'>
      <option value="" disabled>{{ placeholder }}</option>
      <option v-for="opt in options" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
    </select>
    <p v-if="error" class="mt-1.5 text-xs text-pulse-600 dark:text-pulse-400">{{ error }}</p>
  </div>
</template>
