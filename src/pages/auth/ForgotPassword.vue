<script setup>
import { ref } from 'vue'
import { authService } from '@/services/authService'
import AuthLayout from '@/layouts/AuthLayout.vue'
import BaseInput from '@/components/forms/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { EnvelopeIcon, CheckCircleIcon } from '@heroicons/vue/24/outline'

const email = ref('')
const loading = ref(false)
const sent = ref(false)
const error = ref('')

async function onSubmit() {
  error.value = ''
  if (!email.value) {
    error.value = 'Enter the email associated with your account.'
    return
  }
  loading.value = true
  try {
    await authService.forgotPassword(email.value)
    sent.value = true
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <AuthLayout eyebrow="Reset password" title="Forgot your password?" subtitle="We'll send a reset link to your email address.">
    <div v-if="sent" class="text-center py-6 animate-scale-in">
      <span class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-meridian-50 dark:bg-meridian-500/10 text-meridian-600">
        <CheckCircleIcon class="h-7 w-7" />
      </span>
      <h3 class="font-display font-semibold text-meridian-900 dark:text-white mb-1.5">Check your inbox</h3>
      <p class="text-sm text-meridian-500 dark:text-meridian-400">We sent a password reset link to <span class="font-medium text-meridian-700 dark:text-meridian-200">{{ email }}</span>.</p>
      <router-link to="/login" class="mt-6 inline-block text-sm font-medium text-meridian-600 hover:text-pulse-500">Back to sign in</router-link>
    </div>
    <form v-else @submit.prevent="onSubmit" class="space-y-4" novalidate>
      <BaseInput v-model="email" type="email" label="Email address" placeholder="you@careconnect.io" required :error="error">
        <template #icon><EnvelopeIcon class="h-5 w-5" /></template>
      </BaseInput>
      <BaseButton type="submit" block :loading="loading">Send reset link</BaseButton>
      <router-link to="/login" class="block text-center text-sm font-medium text-meridian-600 hover:text-pulse-500">Back to sign in</router-link>
    </form>
  </AuthLayout>
</template>
