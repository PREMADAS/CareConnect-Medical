<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'
import AuthLayout from '@/layouts/AuthLayout.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { ShieldCheckIcon } from '@heroicons/vue/24/outline'

const router = useRouter()
const auth = useAuthStore()
const ui = useUiStore()

const hasSession = computed(() => !!auth.pendingOtpUser)

const digits = ref(['', '', '', '', '', ''])
const inputs = ref([])
const error = ref('')
const countdown = ref(30)
let timer = null

const roleHome = {
  'super-admin': '/super-admin/dashboard',
  doctor: '/doctor/dashboard',
  pharmacist: '/pharmacist/dashboard',
  patient: '/patient/dashboard',
  caretaker: '/caretaker/dashboard',
}

onMounted(() => {
  if (hasSession.value) {
    inputs.value[0]?.focus()
    startCountdown()
  }
})
onBeforeUnmount(() => clearInterval(timer))

function startCountdown() {
  countdown.value = 30
  clearInterval(timer)
  timer = setInterval(() => {
    if (countdown.value > 0) countdown.value--
    else clearInterval(timer)
  }, 1000)
}

// Driven by :value + a single @input handler (not v-model) so there is
// exactly one source of truth per keystroke instead of two competing writers.
function onInput(i, e) {
  const val = e.target.value.replace(/\D/g, '')
  digits.value[i] = val.slice(-1)
  e.target.value = digits.value[i] // keep the DOM in sync with the sanitized value
  error.value = ''
  if (val && i < 5) inputs.value[i + 1]?.focus()
}
function onKeydown(i, e) {
  if (e.key === 'Backspace' && !digits.value[i] && i > 0) inputs.value[i - 1]?.focus()
}
function onPaste(e) {
  e.preventDefault()
  const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
  text.split('').forEach((d, i) => (digits.value[i] = d))
  error.value = ''
  inputs.value[Math.min(text.length, 5)]?.focus()
}

const isComplete = computed(() => digits.value.every((d) => d !== ''))

async function verify() {
  if (!isComplete.value) {
    error.value = 'Enter all 6 digits to continue.'
    return
  }
  error.value = ''
  const code = digits.value.join('')
  try {
    await auth.verifyOtp(code)
    ui.toast({ type: 'success', title: 'Verified', message: `Welcome back, ${auth.user.name}` })
    router.push(roleHome[auth.role] || '/patient/dashboard')
  } catch (e) {
    error.value = e.message
    digits.value = ['', '', '', '', '', '']
    inputs.value[0]?.focus()
  }
}

function resend() {
  startCountdown()
  ui.toast({ type: 'info', title: 'Code resent', message: 'Use 123456 for this demo.' })
}
</script>

<template>
  <AuthLayout eyebrow="Two-factor authentication" title="Verify it's you" :subtitle="hasSession ? `Enter the 6-digit code sent to ${auth.pendingOtpUser?.email}.` : ''">
    <div v-if="!hasSession" class="text-center py-4 animate-fade-up">
      <p class="text-sm text-meridian-500 dark:text-meridian-400 mb-6">
        Your sign-in session has expired or this page was opened directly. Please log in again to request a new code.
      </p>
      <BaseButton block @click="router.replace('/login')">Back to sign in</BaseButton>
    </div>

    <form v-else @submit.prevent="verify" class="space-y-6" novalidate>
      <div class="flex justify-between gap-2" @paste="onPaste">
        <input
          v-for="(d, i) in digits"
          :key="i"
          :ref="(el) => (inputs[i] = el)"
          :value="digits[i]"
          @input="onInput(i, $event)"
          @keydown="onKeydown(i, $event)"
          type="text"
          inputmode="numeric"
          maxlength="1"
          class="h-14 w-12 rounded-lg border text-center text-lg font-semibold font-mono text-meridian-900 dark:text-white bg-white/60 dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-pulse-400/60"
          :class="error ? 'border-pulse-500' : 'border-meridian-200 dark:border-white/15'"
          :aria-label="`Digit ${i + 1} of 6`"
        />
      </div>
      <p v-if="error" class="text-xs text-pulse-600 -mt-3">{{ error }}</p>

      <BaseButton type="submit" block :loading="auth.loading" :disabled="!isComplete">
        <template #icon-left><ShieldCheckIcon class="h-5 w-5" /></template>
        Verify and continue
      </BaseButton>

      <p class="text-center text-sm text-meridian-500 dark:text-meridian-400">
        <span v-if="countdown > 0">Resend code in {{ countdown }}s</span>
        <button v-else type="button" @click="resend" class="font-medium text-meridian-600 hover:text-pulse-500">Resend code</button>
      </p>
      <p class="text-center text-xs text-meridian-400">Demo code: <code class="font-mono">123456</code></p>
    </form>
  </AuthLayout>
</template>
