<script setup>
import { ref } from 'vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import BaseAvatar from '@/components/ui/BaseAvatar.vue'
import BaseInput from '@/components/forms/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'
import { CameraIcon } from '@heroicons/vue/24/outline'

const auth = useAuthStore()
const ui = useUiStore()
const saving = ref(false)
const form = ref({
  name: auth.user?.name || '',
  email: auth.user?.email || '',
  phone: auth.user?.phone || '',
  specialty: auth.user?.specialty || '',
  license: auth.user?.license || '',
  pharmacy: auth.user?.pharmacy || '',
  bloodType: auth.user?.bloodType || '',
  dob: auth.user?.dob || '',
})

async function save() {
  saving.value = true
  await new Promise((r) => setTimeout(r, 700))
  saving.value = false
  ui.toast({ type: 'success', title: 'Profile updated', message: 'Your changes have been saved.' })
}
</script>

<template>
  <DashboardLayout>
    <h1 class="font-display text-2xl font-semibold text-meridian-900 dark:text-white mb-6">My Profile</h1>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="card-base p-6 flex flex-col items-center text-center h-fit">
        <div class="relative">
          <BaseAvatar :src="auth.user?.avatar" :name="auth.user?.name || ''" size="lg" />
          <button class="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-meridian-600 text-white ring-2 ring-white dark:ring-surface-darkcard btn-focus-ring" aria-label="Change avatar">
            <CameraIcon class="h-3.5 w-3.5" />
          </button>
        </div>
        <p class="mt-4 font-display font-semibold text-meridian-900 dark:text-white">{{ auth.user?.name }}</p>
        <p class="text-sm text-meridian-500">{{ auth.user?.email }}</p>
        <BaseBadge tone="success" class="mt-3 capitalize">{{ auth.role?.replace('-', ' ') }}</BaseBadge>
      </div>

      <form @submit.prevent="save" class="lg:col-span-2 card-base p-6 space-y-4">
        <div class="grid sm:grid-cols-2 gap-4">
          <BaseInput v-model="form.name" label="Full name" />
          <BaseInput v-model="form.email" type="email" label="Email address" />
        </div>
        <div class="grid sm:grid-cols-2 gap-4">
          <BaseInput v-model="form.phone" label="Phone number" />
          <BaseInput v-if="auth.role === 'doctor'" v-model="form.specialty" label="Specialty" />
          <BaseInput v-if="auth.role === 'doctor'" v-model="form.license" label="Medical license" />
          <BaseInput v-if="auth.role === 'pharmacist'" v-model="form.pharmacy" label="Pharmacy" />
          <BaseInput v-if="['patient','caretaker'].includes(auth.role)" v-model="form.dob" type="date" label="Date of birth" />
          <BaseInput v-if="auth.role === 'patient'" v-model="form.bloodType" label="Blood type" />
        </div>
        <div class="flex justify-end pt-2">
          <BaseButton type="submit" :loading="saving">Save changes</BaseButton>
        </div>
      </form>
    </div>
  </DashboardLayout>
</template>
