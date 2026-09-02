import { defineStore } from 'pinia'

let idCounter = 0

export const useUiStore = defineStore('ui', {
  state: () => ({
    toasts: [],
    sidebarCollapsed: false,
    mobileSidebarOpen: false,
  }),
  actions: {
    toast({ type = 'info', title, message, duration = 4000 }) {
      const id = ++idCounter
      this.toasts.push({ id, type, title, message })
      if (duration) {
        setTimeout(() => this.dismiss(id), duration)
      }
      return id
    },
    dismiss(id) {
      this.toasts = this.toasts.filter((t) => t.id !== id)
    },
    toggleSidebar() {
      this.sidebarCollapsed = !this.sidebarCollapsed
    },
    toggleMobileSidebar(force) {
      this.mobileSidebarOpen = force ?? !this.mobileSidebarOpen
    },
  },
})
