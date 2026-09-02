<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'
import { useNavigation } from '@/composables/useNavigation'
import PulseLine from '@/components/ui/PulseLine.vue'
import { ChevronDoubleLeftIcon, HeartIcon } from '@heroicons/vue/24/outline'

const auth = useAuthStore()
const ui = useUiStore()
const route = useRoute()

const items = computed(() => useNavigation(auth.role))
const roleLabel = computed(() =>
  ({
    'super-admin': 'Super Admin',
    doctor: 'Doctor',
    pharmacist: 'Pharmacist',
    patient: 'Patient',
    caretaker: 'Caretaker',
  }[auth.role] || '')
)
</script>

<template>
  <!-- Mobile overlay -->
  <div
    v-if="ui.mobileSidebarOpen"
    class="fixed inset-0 z-40 bg-meridian-950/50 lg:hidden"
    @click="ui.toggleMobileSidebar(false)"
  />

  <aside
    class="fixed inset-y-0 left-0 z-50 flex flex-col border-r border-meridian-100 dark:border-white/10 bg-white/90 dark:bg-surface-darkcard/90 backdrop-blur-glass transition-all duration-300 lg:translate-x-0"
    :class="[
      ui.sidebarCollapsed ? 'lg:w-20' : 'lg:w-64',
      ui.mobileSidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64 lg:flex',
    ]"
  >
    <div class="flex h-16 items-center gap-2.5 px-5 border-b border-meridian-100 dark:border-white/10 shrink-0">
      <span class="flex h-9 w-9 items-center justify-center rounded-lg bg-meridian-600 text-white shrink-0">
        <HeartIcon class="h-5 w-5" />
      </span>
      <div v-if="!ui.sidebarCollapsed" class="min-w-0 animate-fade-up">
        <p class="font-display font-semibold text-meridian-900 dark:text-white leading-tight truncate">CareConnect</p>
        <p class="text-[11px] text-meridian-500 dark:text-meridian-400 truncate">{{ roleLabel }}</p>
      </div>
    </div>

    <nav class="flex-1 overflow-y-auto px-3 py-4 space-y-1">
      <router-link
        v-for="item in items"
        :key="item.to"
        :to="item.to"
        class="group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors btn-focus-ring"
        :class="
          route.path === item.to
            ? 'bg-meridian-600 text-white shadow-sm'
            : 'text-meridian-600 dark:text-meridian-300 hover:bg-meridian-50 dark:hover:bg-white/5'
        "
        @click="ui.toggleMobileSidebar(false)"
      >
        <component :is="item.icon" class="h-5 w-5 shrink-0" />
        <span v-if="!ui.sidebarCollapsed" class="truncate">{{ item.label }}</span>
      </router-link>
    </nav>

    <div class="p-3 border-t border-meridian-100 dark:border-white/10">
      <PulseLine class="hidden lg:block mb-2 opacity-40" :animated="false" v-if="!ui.sidebarCollapsed" />
      <button
        class="hidden lg:flex w-full items-center justify-center gap-2 rounded-lg py-2 text-xs font-medium text-meridian-500 hover:bg-meridian-50 dark:hover:bg-white/5 btn-focus-ring"
        @click="ui.toggleSidebar()"
      >
        <ChevronDoubleLeftIcon class="h-4 w-4 transition-transform" :class="ui.sidebarCollapsed ? 'rotate-180' : ''" />
        <span v-if="!ui.sidebarCollapsed">Collapse</span>
      </button>
    </div>
  </aside>
</template>
