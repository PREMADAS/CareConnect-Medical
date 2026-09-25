<script setup>
import { ref } from 'vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import BaseAvatar from '@/components/ui/BaseAvatar.vue'
import BaseInput from '@/components/forms/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'
import { CameraIcon, PlusIcon, XMarkIcon } from '@heroicons/vue/24/outline'

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
  // Doctor-only additions
  designation: auth.user?.designation || '',
  degrees: auth.user?.degrees?.length ? auth.user.degrees.map(d => ({ ...d })) : [{ degree: '', institute: '' }],
  chambers: auth.user?.chambers?.length ? auth.user.chambers.map(c => ({ ...c })) : [{ name: '', address: '', phone: '' }],
})

function addDegree() {
  form.value.degrees.push({ degree: '', institute: '' })
}
function removeDegree(i) {
  form.value.degrees.splice(i, 1)
}

function addChamber() {
  form.value.chambers.push({ name: '', address: '', phone: '' })
}
function removeChamber(i) {
  form.value.chambers.splice(i, 1)
}

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
          <BaseInput v-if="auth.role === 'doctor'" v-model="form.license" label="BMDC Registration No." />
          <BaseInput v-if="auth.role === 'doctor'" v-model="form.designation" label="Designation" placeholder="e.g. Specialist Physician" />
          <BaseInput v-if="auth.role === 'pharmacist'" v-model="form.pharmacy" label="Pharmacy" />
          <BaseInput v-if="['patient','caretaker'].includes(auth.role)" v-model="form.dob" type="date" label="Date of birth" />
          <BaseInput v-if="auth.role === 'patient'" v-model="form.bloodType" label="Blood type" />
        </div>

        <!-- Doctor-only: Degrees / Qualifications -->
        <div v-if="auth.role === 'doctor'" class="pt-2">
          <h3 class="text-sm font-semibold text-meridian-500 mb-2">Degrees &amp; Qualifications</h3>
          <div class="space-y-2.5">
            <div
              v-for="(d, i) in form.degrees" :key="i"
              class="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-2.5 items-center bg-meridian-50 dark:bg-white/5 border border-meridian-100 dark:border-white/10 rounded-xl px-3.5 py-2.5"
            >
              <input
                v-model="d.degree" type="text" :aria-label="`Degree ${i + 1}`"
                placeholder="e.g. MBBS"
                class="w-full bg-transparent outline-none text-sm text-meridian-900 dark:text-white"
              />
              <input
                v-model="d.institute" type="text" :aria-label="`Institute for degree ${i + 1}`"
                placeholder="e.g. Dhaka Medical College"
                class="w-full bg-transparent outline-none text-sm text-meridian-900 dark:text-white"
              />
              <button
                type="button" @click="removeDegree(i)" :aria-label="`Remove degree ${i + 1}`"
                class="w-7 h-7 flex items-center justify-center rounded-full shrink-0 text-meridian-400 transition-colors hover:bg-pulse-50 hover:text-pulse-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pulse-400 justify-self-end sm:justify-self-auto"
              >
                <XMarkIcon class="w-4 h-4" />
              </button>
            </div>
          </div>
          <button
            type="button" @click="addDegree"
            class="mt-2.5 w-full flex items-center justify-center gap-1.5 py-2.5 border-[1.5px] border-dashed border-meridian-200 dark:border-white/15 rounded-xl text-pulse-600 text-sm font-semibold transition-colors hover:bg-meridian-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pulse-400"
          >
            <PlusIcon class="w-4 h-4" /> Add degree
          </button>
        </div>

        <!-- Doctor-only: Chambers / Hospitals -->
        <div v-if="auth.role === 'doctor'" class="pt-2">
          <h3 class="text-sm font-semibold text-meridian-500 mb-2">Chambers / Hospitals</h3>
          <div class="space-y-2.5">
            <div
              v-for="(c, i) in form.chambers" :key="i"
              class="grid grid-cols-1 sm:grid-cols-[1fr_1fr_1fr_auto] gap-2.5 items-center bg-meridian-50 dark:bg-white/5 border border-meridian-100 dark:border-white/10 rounded-xl px-3.5 py-2.5"
            >
              <input
                v-model="c.name" type="text" :aria-label="`Hospital name ${i + 1}`"
                placeholder="Hospital / chamber name"
                class="w-full bg-transparent outline-none text-sm text-meridian-900 dark:text-white"
              />
              <input
                v-model="c.address" type="text" :aria-label="`Hospital address ${i + 1}`"
                placeholder="Address"
                class="w-full bg-transparent outline-none text-sm text-meridian-900 dark:text-white"
              />
              <input
                v-model="c.phone" type="text" :aria-label="`Hospital hotline ${i + 1}`"
                placeholder="Hotline number"
                class="w-full bg-transparent outline-none text-sm text-meridian-900 dark:text-white"
              />
              <button
                type="button" @click="removeChamber(i)" :aria-label="`Remove hospital ${i + 1}`"
                class="w-7 h-7 flex items-center justify-center rounded-full shrink-0 text-meridian-400 transition-colors hover:bg-pulse-50 hover:text-pulse-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pulse-400 justify-self-end sm:justify-self-auto"
              >
                <XMarkIcon class="w-4 h-4" />
              </button>
            </div>
          </div>
          <button
            type="button" @click="addChamber"
            class="mt-2.5 w-full flex items-center justify-center gap-1.5 py-2.5 border-[1.5px] border-dashed border-meridian-200 dark:border-white/15 rounded-xl text-pulse-600 text-sm font-semibold transition-colors hover:bg-meridian-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pulse-400"
          >
            <PlusIcon class="w-4 h-4" /> Add hospital
          </button>
        </div>

        <div class="flex justify-end pt-2">
          <BaseButton type="submit" :loading="saving">Save changes</BaseButton>
        </div>
      </form>
    </div>
  </DashboardLayout>
</template>