<script setup>
defineProps({ width: { type: String, default: '100%' }, height: { type: String, default: '1rem' } })
</script>
<template>
  <div class="skeleton" :style="{ width, height }" />
</template>
