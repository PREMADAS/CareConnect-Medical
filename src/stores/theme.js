import { defineStore } from 'pinia'

export const useThemeStore = defineStore('theme', {
  state: () => ({
    mode: 'light', // 'light' | 'dark'
  }),
  actions: {
    init() {
      const saved = localStorage.getItem('careconnect-theme')
      if (saved) {
        this.mode = saved
      } else {
        this.mode = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      }
      this.apply()
    },
    toggle() {
      this.mode = this.mode === 'light' ? 'dark' : 'light'
      this.apply()
    },
    apply() {
      document.documentElement.classList.toggle('dark', this.mode === 'dark')
      localStorage.setItem('careconnect-theme', this.mode)
    },
  },
})
