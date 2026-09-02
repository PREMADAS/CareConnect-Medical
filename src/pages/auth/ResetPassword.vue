<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { authService } from '@/services/authService'
import { useUiStore } from '@/stores/ui'
import AuthLayout from '@/layouts/AuthLayout.vue'
import BaseInput from '@/components/forms/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { LockClosedIcon } from '@heroicons/vue/24/outline'

const router = useRouter()
const ui = useUiStore()
const loading = ref(false)
const errors = ref({})
const form = ref({ password: '', confirmPassword: '' })

async function onSubmit() {
  errors.value = {}
  if (form.value.password.length < 8) errors.value.password = 'Use at least 8 characters.'
  if (form.value.password !== form.value.confirmPassword) errors.value.confirmPassword = 'Passwords do not match.'
  if (Object.keys(errors.value).length) return

  loading.value = true
  try {
    await authService.resetPassword(form.value)
    ui.toast({ type: 'success', title: 'Password updated', message: 'Sign in with your new password.' })
    router.push('/login')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <AuthLayout eyebrow="Reset password" title="Set a new password" subtitle="Choose a strong password you haven't used before.">
    <form @submit.prevent="onSubmit" class="space-y-4" novalidate>
      <BaseInput v-model="form.password" type="password" label="New password" placeholder="At least 8 characters" required :error="errors.password">
        <template #icon><LockClosedIcon class="h-5 w-5" /></template>
      </BaseInput>
      <BaseInput v-model="form.confirmPassword" type="password" label="Confirm new password" placeholder="Re-enter password" required :error="errors.confirmPassword">
        <template #icon><LockClosedIcon class="h-5 w-5" /></template>
      </BaseInput>
      <BaseButton type="submit" block :loading="loading">Update password</BaseButton>
    </form>
  </AuthLayout>
</template>
