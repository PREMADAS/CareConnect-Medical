<script setup>
defineProps({
  animated: { type: Boolean, default: true },
  class: { type: String, default: '' },
})
</script>

<template>
  <svg
    viewBox="0 0 240 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    :class="['pulse-divider', $props.class]"
    preserveAspectRatio="none"
  >
    <path
      d="M0 12H70L82 3L94 21L106 3L118 21L130 12H240"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-dasharray="6 4"
      :class="animated ? 'animate-pulse-line' : ''"
    />
  </svg>
</template>
