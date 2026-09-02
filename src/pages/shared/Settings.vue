<script setup>
import { ref } from 'vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import ToggleSwitch from '@/components/forms/ToggleSwitch.vue'
import BaseInput from '@/components/forms/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import ConfirmModal from '@/components/modals/ConfirmModal.vue'
import { useThemeStore } from '@/stores/theme'
import { useUiStore } from '@/stores/ui'

const theme = useThemeStore()
const ui = useUiStore()

const notifPrefs = ref({
  medicineReminders: true,
  appointmentAlerts: true,
  prescriptionUpdates: true,
  marketingEmails: false,
})
const security = ref({ twoFactor: true })
const showDeleteModal = ref(false)
const deleting = ref(false)

function saveNotifs() {
  ui.toast({ type: 'success', title: 'Preferences saved' })
}
async function confirmDelete() {
  deleting.value = true
  await new Promise((r) => setTimeout(r, 900))
  deleting.value = false
  showDeleteModal.value = false
  ui.toast({ type: 'info', title: 'Deletion request received', message: 'Our support team will follow up via email.' })
}
</script>

<template>
  <DashboardLayout>
    <h1 class="font-display text-2xl font-semibold text-meridian-900 dark:text-white mb-6">Settings</h1>

    <div class="space-y-6 max-w-3xl">
      <section class="card-base p-6">
        <h2 class="font-display font-semibold text-meridian-900 dark:text-white mb-1">Appearance</h2>
        <p class="text-sm text-meridian-500 mb-4">Choose how CareConnect looks on this device.</p>
        <div class="flex gap-3">
          <button
            @click="theme.mode = 'light'; theme.apply()"
            class="flex-1 rounded-xl border p-4 text-left btn-focus-ring"
            :class="theme.mode === 'light' ? 'border-meridian-600 ring-2 ring-meridian-600/20' : 'border-meridian-200 dark:border-white/10'"
          >
            <div class="h-16 rounded-lg bg-gradient-to-br from-white to-meridian-50 border border-meridian-100 mb-2"></div>
            <p class="text-sm font-medium text-meridian-800 dark:text-meridian-100">Light</p>
          </button>
          <button
            @click="theme.mode = 'dark'; theme.apply()"
            class="flex-1 rounded-xl border p-4 text-left btn-focus-ring"
            :class="theme.mode === 'dark' ? 'border-meridian-600 ring-2 ring-meridian-600/20' : 'border-meridian-200 dark:border-white/10'"
          >
            <div class="h-16 rounded-lg bg-gradient-to-br from-meridian-900 to-surface-dark border border-white/10 mb-2"></div>
            <p class="text-sm font-medium text-meridian-800 dark:text-meridian-100">Dark</p>
          </button>
        </div>
      </section>

      <section class="card-base p-6">
        <h2 class="font-display font-semibold text-meridian-900 dark:text-white mb-1">Notifications</h2>
        <p class="text-sm text-meridian-500 mb-2">Choose what CareConnect notifies you about.</p>
        <div class="divide-y divide-meridian-100 dark:divide-white/5">
          <ToggleSwitch v-model="notifPrefs.medicineReminders" label="Medicine reminders" description="Get notified when it's time to take a dose." />
          <ToggleSwitch v-model="notifPrefs.appointmentAlerts" label="Appointment alerts" description="Reminders before scheduled appointments." />
          <ToggleSwitch v-model="notifPrefs.prescriptionUpdates" label="Prescription updates" description="When a new prescription is issued or fulfilled." />
          <ToggleSwitch v-model="notifPrefs.marketingEmails" label="Product updates" description="Occasional news about new CareConnect features." />
        </div>
        <div class="flex justify-end mt-4">
          <BaseButton @click="saveNotifs">Save preferences</BaseButton>
        </div>
      </section>

      <section class="card-base p-6">
        <h2 class="font-display font-semibold text-meridian-900 dark:text-white mb-1">Security</h2>
        <p class="text-sm text-meridian-500 mb-2">Manage how you sign in.</p>
        <ToggleSwitch v-model="security.twoFactor" label="Two-factor authentication" description="Require a one-time code at sign-in." />
        <div class="grid sm:grid-cols-2 gap-4 mt-4">
          <BaseInput type="password" label="New password" placeholder="••••••••" />
          <BaseInput type="password" label="Confirm new password" placeholder="••••••••" />
        </div>
        <div class="flex justify-end mt-4">
          <BaseButton variant="outline">Update password</BaseButton>
        </div>
      </section>

      <section class="card-base p-6 border-pulse-200 dark:border-pulse-500/20">
        <h2 class="font-display font-semibold text-pulse-600 mb-1">Danger zone</h2>
        <p class="text-sm text-meridian-500 mb-4">Permanently delete your account and all associated health data.</p>
        <BaseButton variant="danger" @click="showDeleteModal = true">Delete account</BaseButton>
      </section>
    </div>

    <ConfirmModal
      v-model="showDeleteModal"
      title="Delete your account?"
      message="This will permanently remove your profile, prescriptions, and reminder history. This action cannot be undone."
      confirm-label="Delete account"
      :loading="deleting"
      @confirm="confirmDelete"
    />
  </DashboardLayout>
</template>
