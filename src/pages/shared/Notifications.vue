<script setup>
import { ref, computed, onMounted } from 'vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import SkeletonLine from '@/components/skeletons/SkeletonLine.vue'
import { useNotificationStore } from '@/stores/notifications'
import {
  BellAlertIcon, ClockIcon, CalendarDaysIcon, ClipboardDocumentListIcon, Cog6ToothIcon,
} from '@heroicons/vue/24/outline'

const notif = useNotificationStore()
const filter = ref('all')
onMounted(() => notif.fetch())

const icons = { reminder: ClockIcon, appointment: CalendarDaysIcon, prescription: ClipboardDocumentListIcon, system: Cog6ToothIcon }
const filters = [
  { key: 'all', label: 'All' },
  { key: 'reminder', label: 'Reminders' },
  { key: 'appointment', label: 'Appointments' },
  { key: 'prescription', label: 'Prescriptions' },
  { key: 'system', label: 'System' },
]

const filtered = computed(() => (filter.value === 'all' ? notif.items : notif.items.filter((n) => n.type === filter.value)))
</script>

<template>
  <DashboardLayout>
    <div class="flex items-center justify-between mb-6">
      <h1 class="font-display text-2xl font-semibold text-meridian-900 dark:text-white">Notifications</h1>
      <button class="text-sm font-medium text-meridian-600 hover:text-pulse-500" @click="notif.markAllRead()">Mark all as read</button>
    </div>

    <div class="flex flex-wrap gap-2 mb-5">
      <button
        v-for="f in filters" :key="f.key" @click="filter = f.key"
        class="rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors btn-focus-ring"
        :class="filter === f.key ? 'bg-meridian-600 text-white' : 'bg-meridian-50 dark:bg-white/5 text-meridian-600 dark:text-meridian-300 hover:bg-meridian-100 dark:hover:bg-white/10'"
      >
        {{ f.label }}
      </button>
    </div>

    <div class="card-base divide-y divide-meridian-100 dark:divide-white/5">
      <div v-if="notif.loading" class="p-5 space-y-4">
        <SkeletonLine v-for="i in 5" :key="i" height="3rem" />
      </div>
      <template v-else-if="filtered.length">
        <button
          v-for="n in filtered" :key="n.id" @click="notif.markRead(n.id)"
          class="w-full text-left flex items-start gap-4 p-5 hover:bg-meridian-50/60 dark:hover:bg-white/[0.03]"
        >
          <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-meridian-50 dark:bg-white/5 text-meridian-600">
            <component :is="icons[n.type] || BellAlertIcon" class="h-5 w-5" />
          </span>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <p class="text-sm font-medium text-meridian-900 dark:text-white">{{ n.title }}</p>
              <span v-if="!n.read" class="h-1.5 w-1.5 rounded-full bg-pulse-500 shrink-0" />
            </div>
            <p class="text-sm text-meridian-500 dark:text-meridian-400 mt-0.5">{{ n.body }}</p>
          </div>
          <span class="text-xs text-meridian-400 whitespace-nowrap">{{ n.time }}</span>
        </button>
      </template>
      <EmptyState v-else title="You're all caught up" message="No notifications in this category right now.">
        <template #icon><BellAlertIcon class="h-8 w-8 text-meridian-400" /></template>
      </EmptyState>
    </div>
  </DashboardLayout>
</template>
