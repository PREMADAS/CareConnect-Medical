import { defineStore } from 'pinia'
import { authService } from '@/services/authService'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('careconnect-user') || 'null'),
    token: localStorage.getItem('careconnect-token') || null,
    pendingOtpUser: null,
    loading: false,
    error: null,
  }),
  getters: {
    isAuthenticated: (state) => !!state.token && !!state.user,
    role: (state) => state.user?.role || null,
    initials: (state) =>
      state.user?.name
        ?.split(' ')
        .map((p) => p[0])
        .slice(0, 2)
        .join('')
        .toUpperCase() || 'CC',
  },
  actions: {
    async login(credentials) {
      this.loading = true
      this.error = null
      try {
        const res = await authService.login(credentials)
        if (res.requiresOtp) {
          this.pendingOtpUser = res.user
          return { requiresOtp: true }
        }
        this._setSession(res.user, res.token)
        return { requiresOtp: false }
      } catch (e) {
        this.error = e.message
        throw e
      } finally {
        this.loading = false
      }
    },

    async verifyOtp(code) {
      if (!this.pendingOtpUser) {
        const err = new Error('Your sign-in session has expired. Please log in again.')
        this.error = err.message
        throw err
      }
      this.loading = true
      this.error = null
      try {
        await authService.verifyOtp({ userId: this.pendingOtpUser.id, code })
        const token = `dummy-jwt.${this.pendingOtpUser.id}.${Date.now()}`
        this._setSession(this.pendingOtpUser, token)
        this.pendingOtpUser = null
      } catch (e) {
        this.error = e.message
        throw e
      } finally {
        this.loading = false
      }
    },

    _setSession(user, token) {
      this.user = user
      this.token = token
      localStorage.setItem('careconnect-user', JSON.stringify(user))
      localStorage.setItem('careconnect-token', token)
    },

    logout() {
      this.user = null
      this.token = null
      localStorage.removeItem('careconnect-user')
      localStorage.removeItem('careconnect-token')
    },
  },
})
