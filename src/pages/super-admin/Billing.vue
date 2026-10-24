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
import ConfirmModal from '@/components/modals/ConfirmModal.vue'
import BaseInput from '@/components/forms/BaseInput.vue'
import SkeletonCard from '@/components/skeletons/SkeletonCard.vue'
import { useUiStore } from '@/stores/ui'
import billingData from '@/data/billing.json'
import expensesData from '@/data/expenses.json'
import {
  BanknotesIcon, ClockIcon, ReceiptPercentIcon, ArrowTrendingDownIcon,
  PlusIcon, ArrowDownTrayIcon, MagnifyingGlassIcon, XMarkIcon,
  CheckCircleIcon, ExclamationTriangleIcon,
  EyeIcon, BellAlertIcon, DocumentArrowDownIcon, NoSymbolIcon,
} from '@heroicons/vue/24/outline'

const ui = useUiStore()
const loading = ref(true)
onMounted(() => setTimeout(() => (loading.value = false), 600))

const invoices = ref(billingData)
const expenses = ref(expensesData)

/* ---------- helpers ---------- */
function currency(v) {
  return `$${v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}
const sum = (list, pick = (x) => x.amount) => list.reduce((s, x) => s + pick(x), 0)
const pct = (v, t) => (t ? Math.round((v / t) * 100) : 0)
function initials(name = '') {
  return name.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join('') || '?'
}
const escapeHtml = (s = '') =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))

/* ---------- filters ---------- */
const statusFilter = ref('')
const typeFilter = ref('')
const search = ref('')
const invoicesEl = ref(null)

const typeOptions = [
  { label: 'All types', value: '' },
  { label: 'Consultation', value: 'Consultation' },
  { label: 'Medicine', value: 'Medicine' },
  { label: 'Lab Test', value: 'Lab Test' },
]

/* "All" tab shows live invoices only; voided ones live under the Void tab */
const filteredInvoices = computed(() => {
  const q = search.value.trim().toLowerCase()
  return invoices.value.filter(
    (i) =>
      (statusFilter.value ? i.status === statusFilter.value : i.status !== 'void') &&
      (!typeFilter.value || i.type === typeFilter.value) &&
      (!q || i.id.toLowerCase().includes(q) || i.patient.toLowerCase().includes(q))
  )
})
const filteredTotal = computed(() =>
  sum(filteredInvoices.value.filter((i) => i.status !== 'void'))
)
const hasFilters = computed(() => statusFilter.value || typeFilter.value || search.value)
function clearFilters() {
  statusFilter.value = ''
  typeFilter.value = ''
  search.value = ''
}

/* ---------- money summary (void invoices are excluded everywhere) ---------- */
const liveInvoices = computed(() => invoices.value.filter((i) => i.status !== 'void'))
const paidInvoices = computed(() => invoices.value.filter((i) => i.status === 'paid'))
const pendingList = computed(() => invoices.value.filter((i) => i.status === 'pending'))
const overdueList = computed(() => invoices.value.filter((i) => i.status === 'overdue'))
const voidList = computed(() => invoices.value.filter((i) => i.status === 'void'))

const totalRevenue = computed(() => sum(paidInvoices.value))
const pendingAmount = computed(() => sum(pendingList.value))
const overdueAmount = computed(() => sum(overdueList.value))
const pendingPayments = computed(() => pendingAmount.value + overdueAmount.value)
const totalBilled = computed(() => sum(liveInvoices.value))
const collectionRate = computed(() => pct(totalRevenue.value, totalBilled.value))

const consultationRevenue = computed(() => sum(paidInvoices.value.filter((i) => i.type === 'Consultation')))
const totalExpenses = computed(() => sum(expenses.value))
const netBalance = computed(() => totalRevenue.value - totalExpenses.value)

/* real revenue split by type (paid invoices only) */
const revenueByType = computed(() =>
  ['Consultation', 'Medicine', 'Lab Test'].map((t) => ({
    label: t,
    value: sum(paidInvoices.value.filter((i) => i.type === t)),
  }))
)

/* status tabs with counts + amounts */
const statusTabs = computed(() => [
  { key: '', label: 'All', count: liveInvoices.value.length, amount: totalBilled.value },
  { key: 'paid', label: 'Paid', count: paidInvoices.value.length, amount: totalRevenue.value },
  { key: 'pending', label: 'Pending', count: pendingList.value.length, amount: pendingAmount.value },
  { key: 'overdue', label: 'Overdue', count: overdueList.value.length, amount: overdueAmount.value },
  { key: 'void', label: 'Void', count: voidList.value.length, amount: sum(voidList.value) },
])

/* expenses with share bars */
const maxExpense = computed(() => Math.max(...expenses.value.map((e) => e.amount), 1))

/* ---------- table ---------- */
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
const canRemind = (row) => row.status === 'pending' || row.status === 'overdue'
const canVoid = (row) => row.status !== 'paid' && row.status !== 'void'

function reviewOverdue() {
  statusFilter.value = 'overdue'
  invoicesEl.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

/* ---------- create invoice ---------- */
const createOpen = ref(false)
const newInvoice = ref({ patient: '', type: 'Consultation', amount: '' })
function createInvoice() {
  const patient = newInvoice.value.patient.trim()
  const amount = Number(newInvoice.value.amount)
  if (!patient || !(amount > 0)) {
    ui.toast({ type: 'error', title: 'Check the form', message: 'Enter a patient name and an amount greater than 0.' })
    return
  }
  const id = `inv_${2000 + invoices.value.length + 1}`
  invoices.value.unshift({
    id, patient, patientId: 'usr_new', doctor: '—', type: newInvoice.value.type,
    amount, status: 'pending', date: new Date().toISOString().slice(0, 10), method: '—',
  })
  createOpen.value = false
  ui.toast({ type: 'success', title: 'Invoice created', message: `${id} issued to ${patient}.` })
  newInvoice.value = { patient: '', type: 'Consultation', amount: '' }
}
function markPaid(row) {
  row.status = 'paid'
  ui.toast({ type: 'success', title: 'Payment recorded', message: `${row.id} marked as paid.` })
}
function exportReport() {
  ui.toast({ type: 'info', title: 'Export started', message: 'Preparing financial-summary.csv' })
}

/* ---------- view invoice ---------- */
const viewOpen = ref(false)
const viewing = ref(null)
function viewInvoice(row) {
  viewing.value = row
  viewOpen.value = true
}

/* ---------- send reminder ---------- */
const remindingId = ref(null)
async function sendReminder(row) {
  if (!canRemind(row) || remindingId.value) return
  remindingId.value = row.id
  await new Promise((r) => setTimeout(r, 600)) // replace with real API call
  row.reminders = (row.reminders || 0) + 1
  row.lastReminder = new Date().toISOString().slice(0, 10)
  remindingId.value = null
  ui.toast({
    type: 'success',
    title: 'Reminder sent',
    message: `Payment reminder for ${row.id} sent to ${row.patient}.`,
  })
}

/* ---------- download PDF (browser print → "Save as PDF") ---------- */
function downloadPdf(row) {
  const html = `<!doctype html>
<html><head><meta charset="utf-8"><title>${escapeHtml(row.id.toUpperCase())}</title>
<style>
  *{box-sizing:border-box}
  body{font-family:Arial,Helvetica,sans-serif;color:#13302b;margin:40px}
  .top{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #0e7c66;padding-bottom:16px}
  h1{margin:0;font-size:24px;color:#0e7c66}
  .muted{color:#6b7d79;font-size:13px}
  .status{display:inline-block;padding:3px 12px;border-radius:999px;font-size:12px;font-weight:700;text-transform:uppercase;background:#e6f4f1;color:#0e7c66;border:1px solid #0e7c66}
  table{width:100%;border-collapse:collapse;margin-top:28px}
  td{padding:12px 4px;border-bottom:1px solid #e3ebe9;font-size:14px}
  td:first-child{color:#6b7d79;width:40%}
  .total td{font-size:18px;font-weight:700;border-bottom:none;color:#13302b}
  .foot{margin-top:40px;font-size:12px;color:#6b7d79}
</style></head><body>
  <div class="top">
    <div><h1>Meridian</h1><div class="muted">Invoice</div></div>
    <div style="text-align:right">
      <div style="font-size:18px;font-weight:700">${escapeHtml(row.id.toUpperCase())}</div>
      <div class="muted">${escapeHtml(row.date)}</div>
      <div style="margin-top:8px"><span class="status">${escapeHtml(row.status)}</span></div>
    </div>
  </div>
  <table>
    <tr><td>Patient</td><td>${escapeHtml(row.patient)}</td></tr>
    <tr><td>Doctor</td><td>${escapeHtml(row.doctor || '—')}</td></tr>
    <tr><td>Service type</td><td>${escapeHtml(row.type)}</td></tr>
    <tr><td>Payment method</td><td>${escapeHtml(row.method || '—')}</td></tr>
    <tr class="total"><td>Amount</td><td>${escapeHtml(currency(row.amount))}</td></tr>
  </table>
  <div class="foot">Generated on ${new Date().toISOString().slice(0, 10)} · Meridian Billing &amp; Accounting</div>
</body></html>`

  const frame = document.createElement('iframe')
  frame.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0'
  document.body.appendChild(frame)
  const doc = frame.contentWindow.document
  doc.open()
  doc.write(html)
  doc.close()
  setTimeout(() => {
    frame.contentWindow.focus()
    frame.contentWindow.print()
    setTimeout(() => frame.remove(), 1000)
  }, 250)
  ui.toast({ type: 'info', title: 'Preparing PDF', message: 'In the print dialog, choose "Save as PDF".' })
}

/* ---------- void / cancel invoice ---------- */
const voidOpen = ref(false)
const toVoid = ref(null)
const voiding = ref(false)
function askVoid(row) {
  viewOpen.value = false
  toVoid.value = row
  voidOpen.value = true
}
async function confirmVoid() {
  voiding.value = true
  await new Promise((r) => setTimeout(r, 500)) // replace with real API call
  toVoid.value.status = 'void'
  toVoid.value.voidedAt = new Date().toISOString().slice(0, 10)
  voiding.value = false
  voidOpen.value = false
  ui.toast({ type: 'info', title: 'Invoice voided', message: `${toVoid.value.id} has been cancelled.` })
}
</script>

<template>
  <DashboardLayout>
    <!-- Header -->
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

    <!-- Overdue alert -->
    <div
      v-if="!loading && overdueList.length"
      class="mb-6 flex flex-wrap items-center gap-3 rounded-xl border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 px-4 py-3"
    >
      <ExclamationTriangleIcon class="h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />
      <p class="text-sm text-red-800 dark:text-red-200">
        <span class="font-semibold">{{ overdueList.length }} overdue {{ overdueList.length === 1 ? 'invoice' : 'invoices' }}</span>
        totalling <span class="font-mono font-semibold">{{ currency(overdueAmount) }}</span> need attention.
      </p>
      <button type="button" @click="reviewOverdue" class="ml-auto text-sm font-semibold text-red-700 dark:text-red-300 hover:underline">
        Review overdue →
      </button>
    </div>

    <!-- Financial snapshot -->
    <div v-if="loading" class="h-40 rounded-2xl bg-meridian-100 dark:bg-white/5 animate-pulse mb-6" />
    <section
      v-else
      class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-meridian-900 via-meridian-800 to-meridian-600 p-6 sm:p-8 mb-6 text-white"
    >
      <div class="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/5" />
      <div class="relative grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <!-- Net balance -->
        <div>
          <div class="flex items-center gap-2 text-sm font-medium text-meridian-200">
            Net balance
            <span class="rounded-full bg-white/15 px-2 py-0.5 text-xs">{{ netBalance >= 0 ? 'Surplus' : 'Deficit' }}</span>
          </div>
          <div class="mt-2 text-4xl sm:text-5xl font-semibold font-mono tracking-tight tabular-nums">{{ currency(netBalance) }}</div>
          <p class="mt-3 text-sm text-meridian-100 font-mono">
            {{ currency(totalRevenue) }} revenue − {{ currency(totalExpenses) }} expenses
          </p>
        </div>

        <!-- Collection rate -->
        <div>
          <div class="flex items-baseline justify-between">
            <span class="text-sm font-medium text-meridian-200">Collection rate</span>
            <span class="text-2xl font-semibold tabular-nums">{{ collectionRate }}%</span>
          </div>
          <div class="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-white/15">
            <div class="h-full rounded-full bg-white transition-all duration-500" :style="{ width: collectionRate + '%' }" />
          </div>
          <p class="mt-2 text-xs text-meridian-200">
            <span class="font-mono">{{ currency(totalRevenue) }}</span> collected of
            <span class="font-mono">{{ currency(totalBilled) }}</span> billed
          </p>
          <div class="mt-3 flex flex-wrap gap-2 text-xs">
            <span class="rounded-full bg-white/10 px-2.5 py-1">Pending <span class="font-mono font-semibold">{{ currency(pendingAmount) }}</span></span>
            <span class="rounded-full bg-[#ff6b5b]/25 px-2.5 py-1">Overdue <span class="font-mono font-semibold">{{ currency(overdueAmount) }}</span></span>
          </div>
        </div>
      </div>
    </section>

    <!-- Stat cards -->
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

    <!-- Charts -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
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
      <ChartCard title="Revenue by category" subtitle="Paid invoices">
        <DoughnutChart :labels="revenueByType.map((r) => r.label)" :data="revenueByType.map((r) => r.value)" />
        <ul class="mt-4 space-y-2">
          <li v-for="r in revenueByType" :key="r.label" class="flex items-center justify-between text-sm">
            <span class="text-meridian-700 dark:text-meridian-200">{{ r.label }}</span>
            <span class="font-mono text-meridian-900 dark:text-white">
              {{ currency(r.value) }} <span class="text-xs text-meridian-400">· {{ pct(r.value, totalRevenue) }}%</span>
            </span>
          </li>
        </ul>
      </ChartCard>
    </div>

    <!-- Invoices -->
    <section ref="invoicesEl" class="scroll-mt-6">
      <div class="mb-4">
        <h2 class="font-display text-lg font-semibold text-meridian-900 dark:text-white">Invoices</h2>
      </div>

      <!-- Status tabs -->
      <div class="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
        <button
          v-for="t in statusTabs"
          :key="t.key"
          type="button"
          @click="statusFilter = t.key"
          :class="[
            'text-left rounded-xl border px-4 py-3 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-meridian-500',
            statusFilter === t.key
              ? 'border-meridian-500 bg-meridian-50 dark:bg-white/10 shadow-sm'
              : 'border-meridian-100 dark:border-white/10 bg-white dark:bg-white/5 hover:border-meridian-300',
          ]"
        >
          <div class="flex items-center justify-between text-sm text-meridian-500 dark:text-meridian-300">
            <span>{{ t.label }}</span>
            <span class="rounded-full bg-meridian-100 dark:bg-white/10 px-2 py-0.5 text-xs font-medium tabular-nums text-meridian-700 dark:text-meridian-100">{{ t.count }}</span>
          </div>
          <div class="mt-1 font-mono text-lg font-semibold text-meridian-900 dark:text-white" :class="{ 'line-through opacity-60': t.key === 'void' }">{{ currency(t.amount) }}</div>
        </button>
      </div>

      <!-- Toolbar -->
      <div class="card-base p-4 mb-2 flex flex-wrap items-center gap-3">
        <div class="relative w-full sm:w-72 mr-auto">
          <MagnifyingGlassIcon class="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-meridian-400" />
          <input
            v-model="search"
            type="text"
            placeholder="Search invoice ID or patient…"
            class="w-full rounded-lg border border-meridian-200 dark:border-white/10 bg-white dark:bg-white/5 py-2 pl-10 pr-9 text-sm text-meridian-800 dark:text-meridian-100 placeholder:text-meridian-400 focus:border-meridian-500 focus:outline-none focus:ring-2 focus:ring-meridian-500/20"
          />
          <button v-if="search" type="button" @click="search = ''" class="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-meridian-400 hover:text-meridian-700" aria-label="Clear search">
            <XMarkIcon class="h-4 w-4" />
          </button>
        </div>
        <div class="w-44"><BaseSelect v-model="typeFilter" :options="typeOptions" placeholder="Type" /></div>
        <button v-if="hasFilters" type="button" @click="clearFilters" class="text-sm font-medium text-meridian-600 hover:underline">Clear filters</button>
      </div>

      <DataTable
        :columns="columns"
        :rows="filteredInvoices"
        :loading="loading"
        :empty-title="hasFilters ? 'No invoices match your filters' : 'No invoices found'"
        empty-message="Try adjusting your filters."
      >
        <template #cell-id="{ value }">
          <span class="font-mono text-xs text-meridian-500 dark:text-meridian-300">{{ value.toUpperCase() }}</span>
        </template>
        <template #cell-patient="{ row }">
          <div class="flex items-center gap-2.5" :class="{ 'opacity-60': row.status === 'void' }">
            <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-meridian-100 dark:bg-white/10 text-xs font-semibold text-meridian-700 dark:text-meridian-100">
              {{ initials(row.patient) }}
            </span>
            <span class="font-medium text-meridian-900 dark:text-meridian-50">{{ row.patient }}</span>
          </div>
        </template>
        <template #cell-type="{ value }">
          <span class="inline-flex rounded-md bg-meridian-50 dark:bg-white/5 px-2 py-0.5 text-xs font-medium text-meridian-700 dark:text-meridian-200">{{ value }}</span>
        </template>
        <template #cell-amount="{ row, value }">
          <span
            class="font-mono tabular-nums font-medium text-meridian-900 dark:text-white"
            :class="{ 'line-through opacity-50': row.status === 'void' }"
          >{{ currency(value) }}</span>
        </template>
        <template #cell-status="{ value }">
          <span
            v-if="value === 'void'"
            class="inline-flex items-center rounded-full bg-meridian-100 dark:bg-white/10 px-2.5 py-0.5 text-xs font-medium capitalize text-meridian-600 dark:text-meridian-200"
          >Void</span>
          <BaseBadge v-else :tone="statusTone[value]" class="capitalize">{{ value }}</BaseBadge>
        </template>
        <template #cell-actions="{ row }">
          <div class="flex items-center justify-end gap-1">
            <button
              v-if="row.status === 'pending' || row.status === 'overdue'"
              type="button"
              @click="markPaid(row)"
              class="mr-1 inline-flex items-center gap-1 rounded-lg border border-meridian-200 dark:border-white/10 px-2.5 py-1 text-xs font-medium text-meridian-700 dark:text-meridian-100 transition hover:bg-meridian-50 dark:hover:bg-white/10 hover:text-pulse-500"
            >
              <CheckCircleIcon class="h-4 w-4" />Mark paid
            </button>
            <span v-else-if="row.status === 'paid'" class="mr-1 text-xs text-meridian-400">Settled</span>
            <span v-else class="mr-1 text-xs text-meridian-400">Cancelled</span>

            <button
              type="button"
              @click="viewInvoice(row)"
              title="View invoice"
              :aria-label="`View invoice ${row.id}`"
              class="rounded-lg p-1.5 text-meridian-400 transition hover:bg-meridian-50 dark:hover:bg-white/10 hover:text-meridian-700 dark:hover:text-white"
            >
              <EyeIcon class="h-5 w-5" />
            </button>
            <button
              v-if="canRemind(row)"
              type="button"
              :disabled="remindingId === row.id"
              @click="sendReminder(row)"
              title="Send reminder"
              :aria-label="`Send reminder for ${row.id}`"
              class="rounded-lg p-1.5 text-meridian-400 transition hover:bg-meridian-50 dark:hover:bg-white/10 hover:text-meridian-700 dark:hover:text-white disabled:opacity-50"
              :class="{ 'animate-pulse': remindingId === row.id }"
            >
              <BellAlertIcon class="h-5 w-5" />
            </button>
            <button
              type="button"
              @click="downloadPdf(row)"
              title="Download PDF"
              :aria-label="`Download PDF for ${row.id}`"
              class="rounded-lg p-1.5 text-meridian-400 transition hover:bg-meridian-50 dark:hover:bg-white/10 hover:text-meridian-700 dark:hover:text-white"
            >
              <DocumentArrowDownIcon class="h-5 w-5" />
            </button>
            <button
              v-if="canVoid(row)"
              type="button"
              @click="askVoid(row)"
              title="Void invoice"
              :aria-label="`Void invoice ${row.id}`"
              class="rounded-lg p-1.5 text-meridian-400 transition hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600"
            >
              <NoSymbolIcon class="h-5 w-5" />
            </button>
          </div>
        </template>
      </DataTable>

      <div class="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-meridian-500 dark:text-meridian-400">
        <span>Showing {{ filteredInvoices.length }} of {{ invoices.length }} invoices</span>
        <span>Total of shown: <span class="font-mono font-semibold text-meridian-800 dark:text-meridian-100">{{ currency(filteredTotal) }}</span></span>
      </div>
    </section>

    <!-- Expenses -->
    <div class="card-base p-5 mt-8">
      <div class="flex flex-wrap items-center justify-between gap-2 mb-4">
        <h3 class="font-display font-semibold text-meridian-900 dark:text-white">Operating expenses</h3>
        <div class="flex items-center gap-4 text-sm font-mono text-meridian-500">
          <span>Total: <span class="text-meridian-800 dark:text-meridian-100">{{ currency(totalExpenses) }}</span></span>
          <span>Net: <span :class="netBalance >= 0 ? 'text-emerald-600' : 'text-pulse-600'">{{ currency(netBalance) }}</span></span>
        </div>
      </div>
      <ul class="divide-y divide-meridian-100 dark:divide-white/5">
        <li v-for="e in expenses" :key="e.id" class="py-3">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-meridian-800 dark:text-meridian-100">{{ e.category }}</p>
              <p class="text-xs text-meridian-500">{{ e.vendor }} · {{ e.date }}</p>
            </div>
            <div class="text-right">
              <span class="font-mono text-sm text-meridian-700 dark:text-meridian-200">{{ currency(e.amount) }}</span>
              <p class="text-xs text-meridian-400">{{ pct(e.amount, totalExpenses) }}% of total</p>
            </div>
          </div>
          <div class="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-meridian-100 dark:bg-white/10">
            <div class="h-full rounded-full bg-[#ff6b5b]/70" :style="{ width: (e.amount / maxExpense) * 100 + '%' }" />
          </div>
        </li>
      </ul>
    </div>

    <!-- New invoice modal -->
    <BaseModal v-model="createOpen" title="New invoice" size="sm">
      <form @submit.prevent="createInvoice" class="space-y-4">
        <BaseInput v-model="newInvoice.patient" label="Patient name" required />
        <BaseSelect v-model="newInvoice.type" label="Type" :options="typeOptions.filter(o => o.value)" />
        <BaseInput v-model="newInvoice.amount" type="number" label="Amount (USD)" placeholder="0.00" required />
        <p class="text-xs text-meridian-500 dark:text-meridian-400">The invoice will be issued with status <span class="font-medium">Pending</span>.</p>
        <div class="flex justify-end gap-3 pt-2">
          <BaseButton type="button" variant="outline" @click="createOpen = false">Cancel</BaseButton>
          <BaseButton type="submit">Create invoice</BaseButton>
        </div>
      </form>
    </BaseModal>

    <!-- View invoice modal -->
    <BaseModal v-model="viewOpen" :title="viewing ? `Invoice ${viewing.id.toUpperCase()}` : 'Invoice'" size="sm">
      <div v-if="viewing">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-meridian-100 dark:bg-white/10 text-sm font-semibold text-meridian-700 dark:text-meridian-100">
              {{ initials(viewing.patient) }}
            </span>
            <div>
              <p class="font-medium text-meridian-900 dark:text-white">{{ viewing.patient }}</p>
              <p class="text-xs text-meridian-500">{{ viewing.date }}</p>
            </div>
          </div>
          <span
            v-if="viewing.status === 'void'"
            class="inline-flex items-center rounded-full bg-meridian-100 dark:bg-white/10 px-2.5 py-0.5 text-xs font-medium text-meridian-600 dark:text-meridian-200"
          >Void</span>
          <BaseBadge v-else :tone="statusTone[viewing.status]" class="capitalize">{{ viewing.status }}</BaseBadge>
        </div>

        <div class="mt-5 rounded-xl bg-meridian-50 dark:bg-white/5 px-4 py-3 text-center">
          <p class="text-xs text-meridian-500">Amount</p>
          <p class="mt-0.5 font-mono text-3xl font-semibold tabular-nums text-meridian-900 dark:text-white" :class="{ 'line-through opacity-50': viewing.status === 'void' }">
            {{ currency(viewing.amount) }}
          </p>
        </div>

        <dl class="mt-4 divide-y divide-meridian-100 dark:divide-white/10 text-sm">
          <div class="flex items-center justify-between gap-4 py-2.5">
            <dt class="text-meridian-500">Invoice ID</dt>
            <dd class="font-mono text-meridian-800 dark:text-meridian-100">{{ viewing.id.toUpperCase() }}</dd>
          </div>
          <div class="flex items-center justify-between gap-4 py-2.5">
            <dt class="text-meridian-500">Patient ID</dt>
            <dd class="font-mono text-meridian-800 dark:text-meridian-100">{{ viewing.patientId || '—' }}</dd>
          </div>
          <div class="flex items-center justify-between gap-4 py-2.5">
            <dt class="text-meridian-500">Doctor</dt>
            <dd class="text-meridian-800 dark:text-meridian-100">{{ viewing.doctor || '—' }}</dd>
          </div>
          <div class="flex items-center justify-between gap-4 py-2.5">
            <dt class="text-meridian-500">Type</dt>
            <dd class="text-meridian-800 dark:text-meridian-100">{{ viewing.type }}</dd>
          </div>
          <div class="flex items-center justify-between gap-4 py-2.5">
            <dt class="text-meridian-500">Payment method</dt>
            <dd class="text-meridian-800 dark:text-meridian-100">{{ viewing.method || '—' }}</dd>
          </div>
          <div v-if="viewing.reminders" class="flex items-center justify-between gap-4 py-2.5">
            <dt class="text-meridian-500">Reminders sent</dt>
            <dd class="text-meridian-800 dark:text-meridian-100">{{ viewing.reminders }} · last {{ viewing.lastReminder }}</dd>
          </div>
          <div v-if="viewing.voidedAt" class="flex items-center justify-between gap-4 py-2.5">
            <dt class="text-meridian-500">Voided on</dt>
            <dd class="text-meridian-800 dark:text-meridian-100">{{ viewing.voidedAt }}</dd>
          </div>
        </dl>

        <div class="mt-5 flex flex-wrap items-center justify-end gap-2">
          <BaseButton v-if="canVoid(viewing)" variant="outline" @click="askVoid(viewing)">
            <template #icon-left><NoSymbolIcon class="h-5 w-5" /></template>Void
          </BaseButton>
          <BaseButton v-if="canRemind(viewing)" variant="outline" :disabled="remindingId === viewing.id" @click="sendReminder(viewing)">
            <template #icon-left><BellAlertIcon class="h-5 w-5" /></template>Remind
          </BaseButton>
          <BaseButton @click="downloadPdf(viewing)">
            <template #icon-left><DocumentArrowDownIcon class="h-5 w-5" /></template>PDF
          </BaseButton>
        </div>
      </div>
    </BaseModal>

    <!-- Void confirmation -->
    <ConfirmModal
      v-model="voidOpen"
      title="Void this invoice?"
      :message="`${toVoid?.id?.toUpperCase()} (${toVoid ? currency(toVoid.amount) : ''}) for ${toVoid?.patient} will be cancelled and excluded from all totals.`"
      confirm-label="Void invoice"
      variant="danger"
      :loading="voiding"
      @confirm="confirmVoid"
    />
  </DashboardLayout>
</template>