<script setup>
import { ref, onMounted } from 'vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import DataTable from '@/components/tables/DataTable.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseModal from '@/components/modals/BaseModal.vue'
import BaseInput from '@/components/forms/BaseInput.vue'
import { useUiStore } from '@/stores/ui'
import medicinesData from '@/data/medicines.json'
import { PlusIcon, BeakerIcon } from '@heroicons/vue/24/outline'

const ui = useUiStore()
const loading = ref(true)
onMounted(() => setTimeout(() => (loading.value = false), 500))

const medicines = ref(medicinesData)
const restockOpen = ref(false)
const selected = ref(null)
const qty = ref(100)

const columns = [
  { key: 'name', label: 'Medicine', sortable: true },
  { key: 'strength', label: 'Strength' },
  { key: 'form', label: 'Form' },
  { key: 'category', label: 'Category', sortable: true },
  { key: 'stock', label: 'Stock', sortable: true },
  { key: 'actions', label: '' },
]

function stockTone(stock) {
  if (stock < 20) return 'danger'
  if (stock < 100) return 'warning'
  return 'success'
}
function openRestock(row) {
  selected.value = row
  qty.value = 100
  restockOpen.value = true
}
function restock() {
  selected.value.stock += Number(qty.value)
  restockOpen.value = false
  ui.toast({ type: 'success', title: 'Inventory updated', message: `${selected.value.name} restocked by ${qty.value} units.` })
}
</script>

<template>
  <DashboardLayout>
    <div class="flex items-center justify-between mb-6">
      <h1 class="font-display text-2xl font-semibold text-meridian-900 dark:text-white">Inventory</h1>
      <BaseButton><template #icon-left><PlusIcon class="h-5 w-5" /></template>Add medicine</BaseButton>
    </div>
    <DataTable :columns="columns" :rows="medicines" :loading="loading" empty-title="Inventory is empty">
      <template #cell-name="{ row }">
        <div class="flex items-center gap-2.5">
          <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-meridian-50 dark:bg-white/5 text-meridian-600"><BeakerIcon class="h-5 w-5" /></span>
          <span class="font-medium text-meridian-800 dark:text-meridian-100">{{ row.name }}</span>
        </div>
      </template>
      <template #cell-stock="{ value }"><BaseBadge :tone="stockTone(value)">{{ value }} units</BaseBadge></template>
      <template #cell-actions="{ row }">
        <button @click="openRestock(row)" class="text-xs font-medium text-meridian-600 hover:text-pulse-500">Restock</button>
      </template>
    </DataTable>

    <BaseModal v-model="restockOpen" :title="`Restock ${selected?.name}`" size="sm">
      <BaseInput v-model="qty" type="number" label="Quantity to add" />
      <div class="flex justify-end gap-3 pt-4">
        <BaseButton variant="outline" @click="restockOpen = false">Cancel</BaseButton>
        <BaseButton @click="restock">Confirm restock</BaseButton>
      </div>
    </BaseModal>
  </DashboardLayout>
</template>
