<script setup>
import { useUiStore } from '@/stores/ui'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppNavbar from '@/components/layout/AppNavbar.vue'

const ui = useUiStore()
</script>

<template>
  <div class="min-h-screen bg-surface-light dark:bg-surface-dark">
    <AppSidebar />
    <div class="transition-all duration-300" :class="ui.sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'">
      <AppNavbar />
      <main class="p-4 lg:p-6 max-w-[1600px] mx-auto">
        <slot />
      </main>
    </div>
  </div>
</template>
