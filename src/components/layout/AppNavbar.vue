<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'
import { useUiStore } from '@/stores/ui'
import { useNotificationStore } from '@/stores/notifications'
import BaseAvatar from '@/components/ui/BaseAvatar.vue'
import {
  Bars3Icon,
  MagnifyingGlassIcon,
  SunIcon,
  MoonIcon,
  BellIcon,
  ChevronDownIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightStartOnRectangleIcon,
} from '@heroicons/vue/24/outline'

const auth = useAuthStore()
const theme = useThemeStore()
const ui = useUiStore()
const notif = useNotificationStore()
const router = useRouter()

const profileOpen = ref(false)
const notifOpen = ref(false)
const menuRoot = ref(null)

function onClickOutside(e) {
  if (menuRoot.value && !menuRoot.value.contains(e.target)) {
    profileOpen.value = false
    notifOpen.value = false
  }
}
onMounted(() => {
  document.addEventListener('click', onClickOutside)
  notif.fetch()
})
onBeforeUnmount(() => document.removeEventListener('click', onClickOutside))

function logout() {
  auth.logout()
  router.push('/login')
}
</script>

<template>
  <header class="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-meridian-100 dark:border-white/10 bg-white/80 dark:bg-surface-darkcard/80 backdrop-blur-glass px-4 lg:px-6">
    <button class="lg:hidden text-meridian-600 dark:text-meridian-200" @click="ui.toggleMobileSidebar()" aria-label="Open menu">
      <Bars3Icon class="h-6 w-6" />
    </button>

    <div class="relative hidden md:block w-full max-w-sm">
      <MagnifyingGlassIcon class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-meridian-400" />
      <input
        type="search"
        placeholder="Search patients, prescriptions, records…"
        class="w-full rounded-lg border border-meridian-200 dark:border-white/10 bg-meridian-50/60 dark:bg-white/5 py-2 pl-10 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-pulse-400/60"
      />
    </div>

    <div class="ml-auto flex items-center gap-2" ref="menuRoot">
      <button
        @click="theme.toggle()"
        class="rounded-lg p-2 text-meridian-500 hover:bg-meridian-50 dark:hover:bg-white/5 btn-focus-ring"
        :aria-label="theme.mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
      >
        <SunIcon v-if="theme.mode === 'dark'" class="h-5 w-5" />
        <MoonIcon v-else class="h-5 w-5" />
      </button>

      <div class="relative">
        <button
          @click="notifOpen = !notifOpen; profileOpen = false"
          class="relative rounded-lg p-2 text-meridian-500 hover:bg-meridian-50 dark:hover:bg-white/5 btn-focus-ring"
          aria-label="Notifications"
        >
          <BellIcon class="h-5 w-5" />
          <span v-if="notif.unreadCount" class="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-pulse-500 ring-2 ring-white dark:ring-surface-darkcard" />
        </button>
        <transition name="scale-in">
          <div v-if="notifOpen" class="absolute right-0 mt-2 w-80 glass-panel p-2 origin-top-right">
            <div class="flex items-center justify-between px-3 py-2">
              <p class="text-sm font-semibold text-meridian-900 dark:text-white">Notifications</p>
              <button class="text-xs text-meridian-500 hover:text-pulse-500" @click="notif.markAllRead()">Mark all read</button>
            </div>
            <div class="max-h-80 overflow-y-auto">
              <button
                v-for="n in notif.items"
                :key="n.id"
                class="w-full text-left flex gap-3 rounded-lg px-3 py-2.5 hover:bg-meridian-50 dark:hover:bg-white/5"
                @click="notif.markRead(n.id)"
              >
                <span class="mt-1.5 h-1.5 w-1.5 rounded-full shrink-0" :class="n.read ? 'bg-transparent' : 'bg-pulse-500'" />
                <span class="min-w-0">
                  <span class="block text-sm font-medium text-meridian-800 dark:text-meridian-100 truncate">{{ n.title }}</span>
                  <span class="block text-xs text-meridian-500 dark:text-meridian-400 truncate">{{ n.body }}</span>
                  <span class="block text-[11px] text-meridian-400 mt-0.5">{{ n.time }}</span>
                </span>
              </button>
            </div>
            <router-link :to="`/${auth.role}/notifications`" class="block text-center text-xs font-medium text-meridian-600 py-2 hover:underline" @click="notifOpen = false">
              View all
            </router-link>
          </div>
        </transition>
      </div>

      <div class="relative">
        <button @click="profileOpen = !profileOpen; notifOpen = false" class="flex items-center gap-2 rounded-lg py-1.5 pl-1.5 pr-2 hover:bg-meridian-50 dark:hover:bg-white/5 btn-focus-ring">
          <BaseAvatar :src="auth.user?.avatar" :name="auth.user?.name || ''" size="sm" />
          <span class="hidden sm:block text-sm font-medium text-meridian-800 dark:text-meridian-100">{{ auth.user?.name }}</span>
          <ChevronDownIcon class="hidden sm:block h-4 w-4 text-meridian-400" />
        </button>
        <transition name="scale-in">
          <div v-if="profileOpen" class="absolute right-0 mt-2 w-56 glass-panel p-2 origin-top-right">
            <router-link :to="`/${auth.role}/profile`" class="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-meridian-700 dark:text-meridian-200 hover:bg-meridian-50 dark:hover:bg-white/5" @click="profileOpen = false">
              <UserCircleIcon class="h-5 w-5" /> My Profile
            </router-link>
            <router-link :to="`/${auth.role}/settings`" class="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-meridian-700 dark:text-meridian-200 hover:bg-meridian-50 dark:hover:bg-white/5" @click="profileOpen = false">
              <Cog6ToothIcon class="h-5 w-5" /> Settings
            </router-link>
            <hr class="my-2 border-meridian-100 dark:border-white/10" />
            <button class="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-pulse-600 hover:bg-pulse-50 dark:hover:bg-pulse-500/10" @click="logout">
              <ArrowRightStartOnRectangleIcon class="h-5 w-5" /> Sign out
            </button>
          </div>
        </transition>
      </div>
    </div>
  </header>
</template>

<style scoped>
.scale-in-enter-active, .scale-in-leave-active { transition: all 0.15s ease; }
.scale-in-enter-from, .scale-in-leave-to { opacity: 0; transform: scale(0.96) translateY(-4px); }
</style>
