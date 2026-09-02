<script setup>
import BaseModal from './BaseModal.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { ExclamationTriangleIcon } from '@heroicons/vue/24/outline'

defineProps({
  modelValue: Boolean,
  title: { type: String, default: 'Are you sure?' },
  message: { type: String, default: '' },
  confirmLabel: { type: String, default: 'Confirm' },
  variant: { type: String, default: 'danger' },
  loading: { type: Boolean, default: false },
})
const emit = defineEmits(['update:modelValue', 'confirm'])
</script>

<template>
  <BaseModal :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" size="sm" :title="title">
    <div class="flex gap-3">
      <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-pulse-100 dark:bg-pulse-500/15 text-pulse-600">
        <ExclamationTriangleIcon class="h-5 w-5" />
      </span>
      <p class="text-sm text-meridian-600 dark:text-meridian-300 pt-2">{{ message }}</p>
    </div>
    <div class="mt-6 flex justify-end gap-3">
      <BaseButton variant="outline" @click="$emit('update:modelValue', false)">Cancel</BaseButton>
      <BaseButton :variant="variant" :loading="loading" @click="$emit('confirm')">{{ confirmLabel }}</BaseButton>
    </div>
  </BaseModal>
</template>
