<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import Chart from 'chart.js/auto'

const props = defineProps({
  labels: { type: Array, required: true },
  datasets: { type: Array, required: true }, // [{ label, data, color }]
  height: { type: String, default: '260px' },
})

const canvasRef = ref(null)
let chartInstance = null

function buildConfig() {
  return {
    type: 'line',
    data: {
      labels: props.labels,
      datasets: props.datasets.map((d) => ({
        label: d.label,
        data: d.data,
        borderColor: d.color || '#0e7c66',
        backgroundColor: (ctx) => {
          const g = ctx.chart.ctx.createLinearGradient(0, 0, 0, 220)
          g.addColorStop(0, `${d.color || '#0e7c66'}33`)
          g.addColorStop(1, `${d.color || '#0e7c66'}00`)
          return g
        },
        tension: 0.4,
        fill: true,
        borderWidth: 2.5,
        pointRadius: 0,
        pointHoverRadius: 5,
        pointBackgroundColor: d.color || '#0e7c66',
      })),
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
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

onMounted(() => {
  chartInstance = new Chart(canvasRef.value, buildConfig())
})
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
    <canvas ref="canvasRef" role="img" aria-label="Line chart"></canvas>
  </div>
</template>
