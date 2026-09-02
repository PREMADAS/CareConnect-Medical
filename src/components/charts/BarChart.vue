<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import Chart from 'chart.js/auto'

const props = defineProps({
  labels: { type: Array, required: true },
  datasets: { type: Array, required: true },
  height: { type: String, default: '260px' },
  horizontal: { type: Boolean, default: false },
})

const canvasRef = ref(null)
let chartInstance = null

function buildConfig() {
  return {
    type: 'bar',
    data: {
      labels: props.labels,
      datasets: props.datasets.map((d) => ({
        label: d.label,
        data: d.data,
        backgroundColor: d.color || '#0e7c66',
        borderRadius: 6,
        maxBarThickness: 28,
      })),
    },
    options: {
      indexAxis: props.horizontal ? 'y' : 'x',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: props.datasets.length > 1, position: 'bottom', labels: { usePointStyle: true, boxWidth: 8 } },
        tooltip: { backgroundColor: '#0b1f1c', padding: 10, cornerRadius: 8 },
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: '#8ba59c' } },
        y: { grid: { color: 'rgba(139,165,156,0.15)' }, ticks: { color: '#8ba59c' } },
      },
    },
  }
}

onMounted(() => (chartInstance = new Chart(canvasRef.value, buildConfig())))
onBeforeUnmount(() => chartInstance?.destroy())
watch(
  () => [props.labels, props.datasets],
  () => {
    chartInstance?.destroy()
    chartInstance = new Chart(canvasRef.value, buildConfig())
  },
  { deep: true }
)
</script>

<template>
  <div :style="{ height }">
    <canvas ref="canvasRef" role="img" aria-label="Bar chart"></canvas>
  </div>
</template>
