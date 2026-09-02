<script setup>
import { ref, onMounted } from 'vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import BaseAvatar from '@/components/ui/BaseAvatar.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseModal from '@/components/modals/BaseModal.vue'
import BaseInput from '@/components/forms/BaseInput.vue'
import SkeletonCard from '@/components/skeletons/SkeletonCard.vue'
import { useUiStore } from '@/stores/ui'
import { PlusIcon, ClockIcon, CalendarDaysIcon } from '@heroicons/vue/24/outline'

const ui = useUiStore()
const loading = ref(true)
onMounted(() => setTimeout(() => (loading.value = false), 500))

const recipients = ref([
  { id: 'usr_004', name: 'Elena Whitfield', relation: 'Spouse', condition: 'Diabetes, Hypercholesterolemia', adherence: 90, nextDose: '8:00 PM', nextAppt: 'Aug 8, 10:30 AM' },
])
const addOpen = ref(false)
const form = ref({ name: '', relation: '', code: '' })

function invite() {
  addOpen.value = false
  ui.toast({ type: 'success', title: 'Invitation sent', message: `${form.value.name} will receive a linking request.` })
  form.value = { name: '', relation: '', code: '' }
}
</script>

<template>
  <DashboardLayout>
    <div class="flex items-center justify-between mb-6">
      <h1 class="font-display text-2xl font-semibold text-meridian-900 dark:text-white">Care Recipients</h1>
      <BaseButton @click="addOpen = true"><template #icon-left><PlusIcon class="h-5 w-5" /></template>Link a recipient</BaseButton>
    </div>

    <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <SkeletonCard v-for="i in 2" :key="i" />
    </div>
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div v-for="r in recipients" :key="r.id" class="card-base p-5">
        <div class="flex items-center gap-3 mb-3">
          <BaseAvatar :name="r.name" size="md" :online="true" />
          <div>
            <p class="font-medium text-meridian-900 dark:text-white">{{ r.name }}</p>
            <p class="text-xs text-meridian-500">{{ r.relation }}</p>
          </div>
        </div>
        <p class="text-xs text-meridian-500 mb-3">{{ r.condition }}</p>
        <div class="flex items-center justify-between text-xs text-meridian-500 mb-1">
          <span>Adherence</span><span>{{ r.adherence }}%</span>
        </div>
        <div class="h-1.5 rounded-full bg-meridian-100 dark:bg-white/10 overflow-hidden mb-4">
          <div class="h-full bg-meridian-600 rounded-full" :style="{ width: r.adherence + '%' }" />
        </div>
        <div class="flex items-center justify-between text-xs text-meridian-600 dark:text-meridian-300">
          <span class="flex items-center gap-1"><ClockIcon class="h-3.5 w-3.5" /> Next dose {{ r.nextDose }}</span>
          <span class="flex items-center gap-1"><CalendarDaysIcon class="h-3.5 w-3.5" /> {{ r.nextAppt }}</span>
        </div>
        <BaseBadge tone="success" class="mt-4">Linked</BaseBadge>
      </div>
    </div>

    <BaseModal v-model="addOpen" title="Link a care recipient" size="sm">
      <form @submit.prevent="invite" class="space-y-4">
        <BaseInput v-model="form.name" label="Recipient's name" required />
        <BaseInput v-model="form.relation" label="Relationship" placeholder="e.g. Parent, Spouse" required />
        <BaseInput v-model="form.code" label="Recipient's CareConnect ID" placeholder="CC-ID-USR004" required />
        <div class="flex justify-end gap-3 pt-2">
          <BaseButton type="button" variant="outline" @click="addOpen = false">Cancel</BaseButton>
          <BaseButton type="submit">Send invitation</BaseButton>
        </div>
      </form>
    </BaseModal>
  </DashboardLayout>
</template>
