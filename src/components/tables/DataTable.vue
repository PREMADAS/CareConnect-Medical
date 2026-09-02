<script setup>
import { ref, computed } from 'vue'
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/vue/20/solid'
import EmptyState from '@/components/ui/EmptyState.vue'
import SkeletonTable from '@/components/skeletons/SkeletonTable.vue'
import { InboxIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  columns: { type: Array, required: true }, // [{ key, label, sortable }]
  rows: { type: Array, required: true },
  loading: { type: Boolean, default: false },
  emptyTitle: { type: String, default: 'Nothing here yet' },
  emptyMessage: { type: String, default: 'Records will appear here once available.' },
})

const sortKey = ref('')
const sortDir = ref('asc')

function toggleSort(key) {
  if (sortKey.value === key) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortDir.value = 'asc'
  }
}

const sortedRows = computed(() => {
  if (!sortKey.value) return props.rows
  return [...props.rows].sort((a, b) => {
    const av = a[sortKey.value]
    const bv = b[sortKey.value]
    if (av < bv) return sortDir.value === 'asc' ? -1 : 1
    if (av > bv) return sortDir.value === 'asc' ? 1 : -1
    return 0
  })
})
</script>

<template>
  <SkeletonTable v-if="loading" :cols="columns.length" />
  <div v-else class="card-base overflow-hidden">
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead class="border-b border-meridian-100 dark:border-white/10 bg-meridian-50/50 dark:bg-white/5">
          <tr>
            <th
              v-for="col in columns"
              :key="col.key"
              scope="col"
              class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-meridian-500 dark:text-meridian-400"
            >
              <button
                v-if="col.sortable"
                @click="toggleSort(col.key)"
                class="inline-flex items-center gap-1 hover:text-meridian-700 dark:hover:text-white btn-focus-ring rounded"
              >
                {{ col.label }}
                <span class="flex flex-col -space-y-1">
                  <ChevronUpIcon class="h-3 w-3" :class="sortKey === col.key && sortDir === 'asc' ? 'text-meridian-700 dark:text-white' : 'opacity-30'" />
                  <ChevronDownIcon class="h-3 w-3" :class="sortKey === col.key && sortDir === 'desc' ? 'text-meridian-700 dark:text-white' : 'opacity-30'" />
                </span>
              </button>
              <span v-else>{{ col.label }}</span>
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-meridian-100 dark:divide-white/5">
          <tr
            v-for="(row, i) in sortedRows"
            :key="row.id || i"
            class="hover:bg-meridian-50/60 dark:hover:bg-white/[0.03] transition-colors"
          >
            <td v-for="col in columns" :key="col.key" class="px-5 py-3.5 text-meridian-700 dark:text-meridian-200 whitespace-nowrap">
              <slot :name="`cell-${col.key}`" :row="row" :value="row[col.key]">
                {{ row[col.key] }}
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <EmptyState v-if="!sortedRows.length" :title="emptyTitle" :message="emptyMessage">
      <template #icon><InboxIcon class="h-8 w-8 text-meridian-400" /></template>
    </EmptyState>
  </div>
</template>
