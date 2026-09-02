import users from '@/data/users.json'
import { simulateLatency } from '@/utils/simulateLatency'
// import api from '@/services/api' // uncomment when wiring the real backend

export const authService = {
  async login({ email, password }) {
    await simulateLatency(null, 700)
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase())
    if (!user || user.password !== password) {
      const err = new Error('The email or password you entered is incorrect.')
      err.code = 'INVALID_CREDENTIALS'
      throw err
    }
    const { password: _pw, ...safeUser } = user
    return {
      user: safeUser,
      token: `dummy-jwt.${user.id}.${Date.now()}`,
      requiresOtp: user.twoFactorEnabled,
    }
    // Real call: return (await api.post('/auth/login', { email, password })).data
  },

  async verifyOtp({ userId, code }) {
    await simulateLatency(null, 600)
    if (code.length !== 6) {
      const err = new Error('Enter the 6-digit code sent to your device.')
      throw err
    }
    if (code !== '123456') {
      const err = new Error('That code is incorrect or has expired.')
      throw err
    }
    return { verified: true }
    // Real call: return (await api.post('/auth/verify-otp', { userId, code })).data
  },

  async register(payload) {
    await simulateLatency(null, 800)
    return { id: `usr_${Math.floor(Math.random() * 9000 + 1000)}`, ...payload }
    // Real call: return (await api.post('/auth/register', payload)).data
  },

  async forgotPassword(email) {
    await simulateLatency(null, 700)
    return { sent: true, email }
    // Real call: return (await api.post('/auth/forgot-password', { email })).data
  },

  async resetPassword(payload) {
    await simulateLatency(null, 700)
    return { reset: true }
    // Real call: return (await api.post('/auth/reset-password', payload)).data
  },
}
