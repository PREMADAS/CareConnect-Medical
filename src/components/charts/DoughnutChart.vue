<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import Chart from 'chart.js/auto'

const props = defineProps({
  labels: { type: Array, required: true },
  data: { type: Array, required: true },
  colors: { type: Array, default: () => ['#0e7c66', '#ff6b5b', '#3fb090', '#f8462f', '#a7e3cd'] },
  height: { type: String, default: '240px' },
})

const canvasRef = ref(null)
let chartInstance = null

function buildConfig() {
  return {
    type: 'doughnut',
    data: {
      labels: props.labels,
      datasets: [{ data: props.data, backgroundColor: props.colors, borderWidth: 0, hoverOffset: 6 }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '68%',
      plugins: {
        legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 8, color: '#5c766f' } },
        tooltip: { backgroundColor: '#0b1f1c', padding: 10, cornerRadius: 8 },
      },
    },
  }
}

onMounted(() => (chartInstance = new Chart(canvasRef.value, buildConfig())))
onBeforeUnmount(() => chartInstance?.destroy())
watch(
  () => [props.labels, props.data],
  () => {
    chartInstance?.destroy()
    chartInstance = new Chart(canvasRef.value, buildConfig())
  },
  { deep: true }
)
</script>

<template>
  <div :style="{ height }">
    <canvas ref="canvasRef" role="img" aria-label="Doughnut chart"></canvas>
  </div>
</template>
