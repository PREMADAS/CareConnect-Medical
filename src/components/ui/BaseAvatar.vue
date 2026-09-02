<script setup>
const props = defineProps({
  src: { type: String, default: '' },
  name: { type: String, default: '' },
  size: { type: String, default: 'md' }, // sm | md | lg
  online: { type: Boolean, default: undefined },
})
const sizes = { sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-14 w-14 text-base' }
const initials = props.name
  .split(' ')
  .map((p) => p[0])
  .slice(0, 2)
  .join('')
  .toUpperCase()
</script>

<template>
  <span class="relative inline-flex shrink-0">
    <img
      v-if="src"
      :src="src"
      :alt="name"
      :class="['rounded-full object-cover ring-2 ring-white dark:ring-surface-darkcard', sizes[size]]"
    />
    <span
      v-else
      :class="['flex items-center justify-center rounded-full bg-meridian-600 font-semibold text-white ring-2 ring-white dark:ring-surface-darkcard', sizes[size]]"
    >
      {{ initials || 'CC' }}
    </span>
    <span
      v-if="online !== undefined"
      class="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full ring-2 ring-white dark:ring-surface-darkcard"
      :class="online ? 'bg-emerald-500' : 'bg-meridian-300'"
    />
  </span>
</template>
