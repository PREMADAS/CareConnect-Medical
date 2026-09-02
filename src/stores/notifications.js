import { defineStore } from 'pinia'
import notificationsData from '@/data/notifications.json'
import { simulateLatency } from '@/utils/simulateLatency'

export const useNotificationStore = defineStore('notifications', {
  state: () => ({
    items: [],
    loading: false,
  }),
  getters: {
    unreadCount: (state) => state.items.filter((n) => !n.read).length,
  },
  actions: {
    async fetch() {
      this.loading = true
      this.items = await simulateLatency(notificationsData, 500)
      // Real call: this.items = (await api.get('/notifications')).data
      this.loading = false
    },
    markAllRead() {
      this.items = this.items.map((n) => ({ ...n, read: true }))
    },
    markRead(id) {
      const n = this.items.find((i) => i.id === id)
      if (n) n.read = true
    },
  },
})
