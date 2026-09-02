<script setup>
import { ref, computed, onMounted } from 'vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import StatCard from '@/components/cards/StatCard.vue'
import ChartCard from '@/components/cards/ChartCard.vue'
import LineChart from '@/components/charts/LineChart.vue'
import DoughnutChart from '@/components/charts/DoughnutChart.vue'
import DataTable from '@/components/tables/DataTable.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseSelect from '@/components/forms/BaseSelect.vue'
import BaseModal from '@/components/modals/BaseModal.vue'
import BaseInput from '@/components/forms/BaseInput.vue'
import SkeletonCard from '@/components/skeletons/SkeletonCard.vue'
import { useUiStore } from '@/stores/ui'
import billingData from '@/data/billing.json'
import expensesData from '@/data/expenses.json'
import {
  BanknotesIcon, ClockIcon, ReceiptPercentIcon, ArrowTrendingDownIcon,
  PlusIcon, ArrowDownTrayIcon,
} from '@heroicons/vue/24/outline'

const ui = useUiStore()
const loading = ref(true)
onMounted(() => setTimeout(() => (loading.value = false), 600))

const invoices = ref(billingData)
const expenses = ref(expensesData)

const statusFilter = ref('')
const typeFilter = ref('')
const statusOptions = [
  { label: 'All statuses', value: '' },
  { label: 'Paid', value: 'paid' },
  { label: 'Pending', value: 'pending' },
  { label: 'Overdue', value: 'overdue' },
]
const typeOptions = [
  { label: 'All types', value: '' },
  { label: 'Consultation', value: 'Consultation' },
  { label: 'Medicine', value: 'Medicine' },
  { label: 'Lab Test', value: 'Lab Test' },
]

const filteredInvoices = computed(() =>
  invoices.value.filter(
    (i) => (!statusFilter.value || i.status === statusFilter.value) && (!typeFilter.value || i.type === typeFilter.value)
  )
)

const totalRevenue = computed(() => invoices.value.filter((i) => i.status === 'paid').reduce((s, i) => s + i.amount, 0))
const pendingPayments = computed(() => invoices.value.filter((i) => i.status === 'pending' || i.status === 'overdue').reduce((s, i) => s + i.amount, 0))
const consultationRevenue = computed(() => invoices.value.filter((i) => i.type === 'Consultation' && i.status === 'paid').reduce((s, i) => s + i.amount, 0))
const medicineTestRevenue = computed(() => invoices.value.filter((i) => (i.type === 'Medicine' || i.type === 'Lab Test') && i.status === 'paid').reduce((s, i) => s + i.amount, 0))
const totalExpenses = computed(() => expenses.value.reduce((s, e) => s + e.amount, 0))
const netBalance = computed(() => totalRevenue.value - totalExpenses.value)

function currency(v) {
  return `$${v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

const columns = [
  { key: 'id', label: 'Invoice ID', sortable: true },
  { key: 'patient', label: 'Patient', sortable: true },
  { key: 'type', label: 'Type', sortable: true },
  { key: 'amount', label: 'Amount', sortable: true },
  { key: 'date', label: 'Date', sortable: true },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: '' },
]
const statusTone = { paid: 'success', pending: 'warning', overdue: 'danger' }

const createOpen = ref(false)
const newInvoice = ref({ patient: '', type: 'Consultation', amount: '' })
function createInvoice() {
  const id = `inv_${2000 + invoices.value.length + 1}`
  invoices.value.unshift({
    id, patient: newInvoice.value.patient, patientId: 'usr_new', doctor: '—', type: newInvoice.value.type,
    amount: Number(newInvoice.value.amount), status: 'pending', date: '2026-08-07', method: '—',
  })
  createOpen.value = false
  ui.toast({ type: 'success', title: 'Invoice created', message: `${id} issued to ${newInvoice.value.patient}.` })
  newInvoice.value = { patient: '', type: 'Consultation', amount: '' }
}
function markPaid(row) {
  row.status = 'paid'
  ui.toast({ type: 'success', title: 'Payment recorded', message: `${row.id} marked as paid.` })
}
function exportReport() {
  ui.toast({ type: 'info', title: 'Export started', message: 'Preparing financial-summary.csv' })
}
</script>

<template>
  <DashboardLayout>
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 class="font-display text-2xl font-semibold text-meridian-900 dark:text-white">Billing & Accounting</h1>
        <p class="text-sm text-meridian-500 dark:text-meridian-400 mt-1">Platform-wide financial overview and invoice management.</p>
      </div>
      <div class="flex gap-2">
        <BaseButton variant="outline" @click="exportReport"><template #icon-left><ArrowDownTrayIcon class="h-5 w-5" /></template>Export</BaseButton>
        <BaseButton @click="createOpen = true"><template #icon-left><PlusIcon class="h-5 w-5" /></template>New invoice</BaseButton>
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <template v-if="loading"><SkeletonCard v-for="i in 4" :key="i" /></template>
      <template v-else>
        <StatCard label="Total revenue" :value="currency(totalRevenue)" delta="+12.4%" tone="meridian">
          <template #icon><BanknotesIcon class="h-5 w-5" /></template>
        </StatCard>
        <StatCard label="Pending payments" :value="currency(pendingPayments)" tone="pulse">
          <template #icon><ClockIcon class="h-5 w-5" /></template>
        </StatCard>
        <StatCard label="Consultation fees" :value="currency(consultationRevenue)" delta="+5.1%" tone="meridian">
          <template #icon><ReceiptPercentIcon class="h-5 w-5" /></template>
        </StatCard>
        <StatCard label="Operating expenses" :value="currency(totalExpenses)" trend="down" delta="-2.3%" tone="pulse">
          <template #icon><ArrowTrendingDownIcon class="h-5 w-5" /></template>
        </StatCard>
      </template>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
      <div class="lg:col-span-2">
        <ChartCard title="Revenue vs. expenses" subtitle="Last 6 months">
          <LineChart
            :labels="['Mar','Apr','May','Jun','Jul','Aug']"
            :datasets="[
              { label: 'Revenue', data: [38200, 41500, 43800, 47200, 51900, 54600], color: '#0e7c66' },
              { label: 'Expenses', data: [29800, 30600, 31200, 33100, 34500, 62240], color: '#ff6b5b' },
            ]"
          />
        </ChartCard>
      </div>
      <ChartCard title="Revenue by category" subtitle="This month">
        <DoughnutChart :labels="['Consultations','Medicine','Lab Tests']" :data="[consultationRevenue, medicineTestRevenue * 0.4, medicineTestRevenue * 0.6]" />
      </ChartCard>
    </div>

    <div class="card-base p-4 mb-2 flex flex-wrap items-center gap-3">
      <h3 class="font-display font-semibold text-meridian-900 dark:text-white mr-auto">Invoices</h3>
      <div class="w-40"><BaseSelect v-model="statusFilter" :options="statusOptions" placeholder="Status" /></div>
      <div class="w-44"><BaseSelect v-model="typeFilter" :options="typeOptions" placeholder="Type" /></div>
    </div>
    <DataTable :columns="columns" :rows="filteredInvoices" :loading="loading" empty-title="No invoices found" empty-message="Try adjusting your filters.">
      <template #cell-amount="{ value }"><span class="font-mono">{{ currency(value) }}</span></template>
      <template #cell-status="{ value }"><BaseBadge :tone="statusTone[value]">{{ value }}</BaseBadge></template>
      <template #cell-actions="{ row }">
        <button v-if="row.status !== 'paid'" @click="markPaid(row)" class="text-xs font-medium text-meridian-600 hover:text-pulse-500">Mark paid</button>
      </template>
    </DataTable>

    <div class="card-base p-5 mt-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="font-display font-semibold text-meridian-900 dark:text-white">Operating expenses</h3>
        <span class="text-sm font-mono text-meridian-500">Net: <span :class="netBalance >= 0 ? 'text-emerald-600' : 'text-pulse-600'">{{ currency(netBalance) }}</span></span>
      </div>
      <ul class="divide-y divide-meridian-100 dark:divide-white/5">
        <li v-for="e in expenses" :key="e.id" class="flex items-center justify-between py-3">
          <div>
            <p class="text-sm font-medium text-meridian-800 dark:text-meridian-100">{{ e.category }}</p>
            <p class="text-xs text-meridian-500">{{ e.vendor }} · {{ e.date }}</p>
          </div>
          <span class="font-mono text-sm text-meridian-700 dark:text-meridian-200">{{ currency(e.amount) }}</span>
        </li>
      </ul>
    </div>

    <BaseModal v-model="createOpen" title="New invoice" size="sm">
      <form @submit.prevent="createInvoice" class="space-y-4">
        <BaseInput v-model="newInvoice.patient" label="Patient name" required />
        <BaseSelect v-model="newInvoice.type" label="Type" :options="typeOptions.filter(o => o.value)" />
        <BaseInput v-model="newInvoice.amount" type="number" label="Amount (USD)" placeholder="0.00" required />
        <div class="flex justify-end gap-3 pt-2">
          <BaseButton type="button" variant="outline" @click="createOpen = false">Cancel</BaseButton>
          <BaseButton type="submit">Create invoice</BaseButton>
        </div>
      </form>
    </BaseModal>
  </DashboardLayout>
</template>
