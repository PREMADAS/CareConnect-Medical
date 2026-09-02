<script setup>
import { watch } from 'vue'
import { XMarkIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: '' },
  size: { type: String, default: 'md' }, // sm | md | lg | xl
})
const emit = defineEmits(['update:modelValue'])

const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }

function close() {
  emit('update:modelValue', false)
}

watch(
  () => props.modelValue,
  (open) => {
    document.body.style.overflow = open ? 'hidden' : ''
  }
)
</script>

<template>
  <Teleport to="body">
    <transition name="modal-fade">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        :aria-label="title"
      >
        <div class="absolute inset-0 bg-meridian-950/50 backdrop-blur-sm" @click="close" />
        <div
          class="relative w-full glass-panel p-6 animate-scale-in"
          :class="sizes[size]"
        >
          <div class="flex items-start justify-between mb-4">
            <h3 class="text-lg font-display font-semibold text-meridian-900 dark:text-white">{{ title }}</h3>
            <button
              @click="close"
              aria-label="Close dialog"
              class="rounded-lg p-1.5 text-meridian-400 hover:bg-meridian-100 dark:hover:bg-white/10 btn-focus-ring"
            >
              <XMarkIcon class="h-5 w-5" />
            </button>
          </div>
          <slot />
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>
