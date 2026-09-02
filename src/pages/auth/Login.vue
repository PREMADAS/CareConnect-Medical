<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'
import AuthLayout from '@/layouts/AuthLayout.vue'
import BaseInput from '@/components/forms/BaseInput.vue'
import BaseCheckbox from '@/components/forms/BaseCheckbox.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { EnvelopeIcon, LockClosedIcon, EyeIcon, EyeSlashIcon } from '@heroicons/vue/24/outline'

const router = useRouter()
const auth = useAuthStore()
const ui = useUiStore()

const form = ref({ email: '', password: '', remember: false })
const showPassword = ref(false)
const errors = ref({})

const roleHome = {
  'super-admin': '/super-admin/dashboard',
  doctor: '/doctor/dashboard',
  pharmacist: '/pharmacist/dashboard',
  patient: '/patient/dashboard',
  caretaker: '/caretaker/dashboard',
}

async function onSubmit() {
  errors.value = {}
  if (!form.value.email) errors.value.email = 'Email is required.'
  if (!form.value.password) errors.value.password = 'Password is required.'
  if (Object.keys(errors.value).length) return

  try {
    const res = await auth.login(form.value)
    if (res.requiresOtp) {
      router.push('/verify-otp')
    } else {
      ui.toast({ type: 'success', title: 'Welcome back', message: `Signed in as ${auth.user.name}` })
      router.push(roleHome[auth.role] || '/patient/dashboard')
    }
  } catch (e) {
    errors.value.password = e.message
  }
}

function quickFill(email) {
  form.value.email = email
  form.value.password = 'password'
}
</script>

<template>
  <AuthLayout eyebrow="Sign in" title="Welcome back" subtitle="Enter your credentials to access your CareConnect dashboard.">
    <form @submit.prevent="onSubmit" class="space-y-4" novalidate>
      <BaseInput v-model="form.email" type="email" label="Email address" placeholder="you@careconnect.io" required :error="errors.email" autocomplete="email">
        <template #icon><EnvelopeIcon class="h-5 w-5" /></template>
      </BaseInput>

      <BaseInput
        v-model="form.password"
        :type="showPassword ? 'text' : 'password'"
        label="Password"
        placeholder="••••••••"
        required
        :error="errors.password"
        autocomplete="current-password"
      >
        <template #icon><LockClosedIcon class="h-5 w-5" /></template>
        <template #suffix>
          <button type="button" @click="showPassword = !showPassword" class="text-meridian-400 hover:text-meridian-600" :aria-label="showPassword ? 'Hide password' : 'Show password'">
            <EyeSlashIcon v-if="showPassword" class="h-5 w-5" />
            <EyeIcon v-else class="h-5 w-5" />
          </button>
        </template>
      </BaseInput>

      <div class="flex items-center justify-between">
        <BaseCheckbox v-model="form.remember" label="Remember me" />
        <router-link to="/forgot-password" class="text-sm font-medium text-meridian-600 hover:text-pulse-500">Forgot password?</router-link>
      </div>

      <BaseButton type="submit" block :loading="auth.loading">Sign in</BaseButton>
    </form>

    <div class="mt-6 rounded-lg border border-dashed border-meridian-200 dark:border-white/15 p-3.5">
      <p class="text-xs font-medium text-meridian-500 mb-2">Demo accounts (password: <code class="font-mono">password</code>)</p>
      <div class="flex flex-wrap gap-1.5">
        <button v-for="r in ['admin','doctor','pharmacist','patient','caretaker']" :key="r" type="button" @click="quickFill(`${r}@careconnect.io`)" class="text-xs rounded-full border border-meridian-200 dark:border-white/15 px-2.5 py-1 text-meridian-600 dark:text-meridian-300 hover:bg-meridian-50 dark:hover:bg-white/5 capitalize">
          {{ r }}
        </button>
      </div>
    </div>

    <p class="mt-6 text-center text-sm text-meridian-500 dark:text-meridian-400">
      New to CareConnect? <router-link to="/register" class="font-medium text-meridian-600 hover:text-pulse-500">Create an account</router-link>
    </p>
  </AuthLayout>
</template>
