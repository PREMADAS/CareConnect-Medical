<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: { type: String, default: 'primary' }, // primary | secondary | ghost | danger | outline
  size: { type: String, default: 'md' }, // sm | md | lg
  loading: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  block: { type: Boolean, default: false },
  type: { type: String, default: 'button' },
})

const variants = {
  primary:
    'bg-meridian-600 text-white hover:bg-meridian-700 active:bg-meridian-800 shadow-sm disabled:bg-meridian-300',
  secondary:
    'bg-pulse-400 text-white hover:bg-pulse-500 active:bg-pulse-600 shadow-sm disabled:bg-pulse-200',
  outline:
    'border border-meridian-200 dark:border-white/15 text-meridian-800 dark:text-meridian-50 hover:bg-meridian-50 dark:hover:bg-white/5',
  ghost: 'text-meridian-700 dark:text-meridian-100 hover:bg-meridian-50 dark:hover:bg-white/5',
  danger: 'bg-pulse-600 text-white hover:bg-pulse-700 shadow-sm',
}

const sizes = {
  sm: 'text-sm px-3 py-1.5 gap-1.5 rounded-lg',
  md: 'text-sm px-4 py-2.5 gap-2 rounded-lg',
  lg: 'text-base px-5 py-3 gap-2 rounded-xl',
}

const classes = computed(() => [
  'inline-flex items-center justify-center font-medium transition-all duration-150 btn-focus-ring disabled:cursor-not-allowed disabled:opacity-60 select-none',
  variants[props.variant],
  sizes[props.size],
  props.block ? 'w-full' : '',
])
</script>

<template>
  <button :type="type" :disabled="disabled || loading" :class="classes">
    <svg
      v-if="loading"
      class="animate-spin h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
    <slot v-else name="icon-left" />
    <slot />
    <slot v-if="!loading" name="icon-right" />
  </button>
</template>
