<script setup>
defineProps({ rows: { type: Number, default: 5 }, cols: { type: Number, default: 4 } })
</script>
<template>
  <div class="card-base p-5">
    <div class="space-y-4">
      <div v-for="r in rows" :key="r" class="flex items-center gap-4">
        <div v-for="c in cols" :key="c" class="skeleton h-4" :style="{ width: c === 1 ? '20%' : `${80 / (cols - 1)}%` }" />
      </div>
    </div>
  </div>
</template>
