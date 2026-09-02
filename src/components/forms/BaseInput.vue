<script setup>
import { computed, useId } from 'vue'

const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  label: { type: String, default: '' },
  type: { type: String, default: 'text' },
  placeholder: { type: String, default: '' },
  error: { type: String, default: '' },
  hint: { type: String, default: '' },
  required: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  autocomplete: { type: String, default: 'off' },
})
defineEmits(['update:modelValue'])

const inputId = useId()
const describedBy = computed(() => (props.error ? `${inputId}-error` : props.hint ? `${inputId}-hint` : undefined))
</script>

<template>
  <div class="w-full">
    <label v-if="label" :for="inputId" class="block text-sm font-medium text-meridian-800 dark:text-meridian-100 mb-1.5">
      {{ label }} <span v-if="required" class="text-pulse-500">*</span>
    </label>
    <div class="relative">
      <span v-if="$slots.icon" class="absolute inset-y-0 left-3 flex items-center text-meridian-400">
        <slot name="icon" />
      </span>
      <input
        :id="inputId"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        :autocomplete="autocomplete"
        :aria-invalid="!!error"
        :aria-describedby="describedBy"
        @input="$emit('update:modelValue', $event.target.value)"
        class="w-full rounded-lg border bg-white/60 dark:bg-white/5 px-3.5 py-2.5 text-sm text-meridian-900 dark:text-white placeholder:text-meridian-400 transition-colors focus:outline-none focus:ring-2 focus:ring-pulse-400/60 disabled:opacity-60 disabled:cursor-not-allowed"
        :class="[
          $slots.icon ? 'pl-10' : '',
          $slots.suffix ? 'pr-10' : '',
          error ? 'border-pulse-500 focus:ring-pulse-500/50' : 'border-meridian-200 dark:border-white/15',
        ]"
      />
      <span v-if="$slots.suffix" class="absolute inset-y-0 right-3 flex items-center">
        <slot name="suffix" />
      </span>
    </div>
    <p v-if="error" :id="`${inputId}-error`" class="mt-1.5 text-xs text-pulse-600 dark:text-pulse-400">{{ error }}</p>
    <p v-else-if="hint" :id="`${inputId}-hint`" class="mt-1.5 text-xs text-meridian-500 dark:text-meridian-400">{{ hint }}</p>
  </div>
</template>
