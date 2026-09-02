<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { authService } from '@/services/authService'
import { useUiStore } from '@/stores/ui'
import AuthLayout from '@/layouts/AuthLayout.vue'
import BaseInput from '@/components/forms/BaseInput.vue'
import BaseSelect from '@/components/forms/BaseSelect.vue'
import BaseCheckbox from '@/components/forms/BaseCheckbox.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { UserIcon, EnvelopeIcon, LockClosedIcon } from '@heroicons/vue/24/outline'

const router = useRouter()
const ui = useUiStore()
const loading = ref(false)
const errors = ref({})
const form = ref({ name: '', email: '', role: '', password: '', confirmPassword: '', agree: false })

const roleOptions = [
  { label: 'Patient', value: 'patient' },
  { label: 'Caretaker', value: 'caretaker' },
  { label: 'Doctor', value: 'doctor' },
  { label: 'Pharmacist', value: 'pharmacist' },
]

async function onSubmit() {
  errors.value = {}
  if (!form.value.name) errors.value.name = 'Full name is required.'
  if (!form.value.email) errors.value.email = 'Email is required.'
  if (!form.value.role) errors.value.role = 'Choose your role.'
  if (form.value.password.length < 8) errors.value.password = 'Use at least 8 characters.'
  if (form.value.password !== form.value.confirmPassword) errors.value.confirmPassword = 'Passwords do not match.'
  if (!form.value.agree) errors.value.agree = 'You must accept the terms to continue.'
  if (Object.keys(errors.value).length) return

  loading.value = true
  try {
    await authService.register(form.value)
    ui.toast({ type: 'success', title: 'Account created', message: 'You can now sign in.' })
    router.push('/login')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <AuthLayout eyebrow="Create account" title="Get started with CareConnect" subtitle="Set up your account to manage prescriptions and reminders in one place.">
    <form @submit.prevent="onSubmit" class="space-y-4" novalidate>
      <BaseInput v-model="form.name" label="Full name" placeholder="Elena Whitfield" required :error="errors.name">
        <template #icon><UserIcon class="h-5 w-5" /></template>
      </BaseInput>
      <BaseInput v-model="form.email" type="email" label="Email address" placeholder="you@careconnect.io" required :error="errors.email">
        <template #icon><EnvelopeIcon class="h-5 w-5" /></template>
      </BaseInput>
      <BaseSelect v-model="form.role" label="I am a…" :options="roleOptions" required :error="errors.role" />
      <BaseInput v-model="form.password" type="password" label="Password" placeholder="At least 8 characters" required :error="errors.password">
        <template #icon><LockClosedIcon class="h-5 w-5" /></template>
      </BaseInput>
      <BaseInput v-model="form.confirmPassword" type="password" label="Confirm password" placeholder="Re-enter password" required :error="errors.confirmPassword">
        <template #icon><LockClosedIcon class="h-5 w-5" /></template>
      </BaseInput>

      <BaseCheckbox v-model="form.agree" label="I agree to the Terms of Service and Privacy Policy" />
      <p v-if="errors.agree" class="text-xs text-pulse-600 -mt-2">{{ errors.agree }}</p>

      <BaseButton type="submit" block :loading="loading">Create account</BaseButton>
    </form>

    <p class="mt-6 text-center text-sm text-meridian-500 dark:text-meridian-400">
      Already have an account? <router-link to="/login" class="font-medium text-meridian-600 hover:text-pulse-500">Sign in</router-link>
    </p>
  </AuthLayout>
</template>
