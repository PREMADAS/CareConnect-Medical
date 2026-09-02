<script setup>
import { ref, computed, onMounted } from 'vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import SkeletonCard from '@/components/skeletons/SkeletonCard.vue'
import pharmaciesData from '@/data/pharmacies.json'
import { MagnifyingGlassIcon, MapPinIcon, StarIcon, BuildingStorefrontIcon } from '@heroicons/vue/24/outline'
import { StarIcon as StarSolid } from '@heroicons/vue/24/solid'

const loading = ref(true)
onMounted(() => setTimeout(() => (loading.value = false), 600))

const search = ref('')
const openOnly = ref(false)
const pharmacies = ref(pharmaciesData)

const filtered = computed(() =>
  pharmacies.value.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.value.toLowerCase())
    const matchesOpen = !openOnly.value || p.open
    return matchesSearch && matchesOpen
  })
)
</script>

<template>
  <DashboardLayout>
    <h1 class="font-display text-2xl font-semibold text-meridian-900 dark:text-white mb-1">Find a Pharmacy</h1>
    <p class="text-sm text-meridian-500 dark:text-meridian-400 mb-6">Pharmacies near you with your prescribed medication in stock.</p>

    <div class="flex flex-col sm:flex-row gap-3 mb-5">
      <div class="relative flex-1">
        <MagnifyingGlassIcon class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-meridian-400" />
        <input v-model="search" type="search" placeholder="Search pharmacies…" class="w-full rounded-lg border border-meridian-200 dark:border-white/10 bg-white/60 dark:bg-white/5 py-2.5 pl-10 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-pulse-400/60" />
      </div>
      <label class="inline-flex items-center gap-2 rounded-lg border border-meridian-200 dark:border-white/10 px-4 py-2.5 text-sm cursor-pointer select-none">
        <input type="checkbox" v-model="openOnly" class="accent-meridian-600" /> Open now
      </label>
    </div>

    <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <SkeletonCard v-for="i in 4" :key="i" />
    </div>
    <div v-else-if="filtered.length" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div v-for="p in filtered" :key="p.id" class="card-base p-5">
        <div class="flex items-start justify-between mb-2">
          <span class="flex h-10 w-10 items-center justify-center rounded-xl bg-meridian-50 dark:bg-white/5 text-meridian-600">
            <BuildingStorefrontIcon class="h-5 w-5" />
          </span>
          <BaseBadge :tone="p.open ? 'success' : 'neutral'">{{ p.open ? 'Open now' : 'Closed' }}</BaseBadge>
        </div>
        <h3 class="font-display font-semibold text-meridian-900 dark:text-white">{{ p.name }}</h3>
        <p class="flex items-center gap-1 text-xs text-meridian-500 mt-1"><MapPinIcon class="h-3.5 w-3.5" /> {{ p.address }} · {{ p.distance }}</p>
        <div class="flex items-center gap-1 mt-2">
          <StarSolid class="h-4 w-4 text-amber-400" />
          <span class="text-sm font-medium text-meridian-700 dark:text-meridian-200">{{ p.rating }}</span>
        </div>
        <div class="mt-3">
          <div class="flex items-center justify-between text-xs text-meridian-500 mb-1">
            <span>Stock match</span><span>{{ p.stockMatch }}%</span>
          </div>
          <div class="h-1.5 rounded-full bg-meridian-100 dark:bg-white/10 overflow-hidden">
            <div class="h-full bg-meridian-600 rounded-full" :style="{ width: p.stockMatch + '%' }" />
          </div>
        </div>
        <BaseButton block variant="outline" class="mt-4">Get directions</BaseButton>
      </div>
    </div>
    <EmptyState v-else title="No pharmacies found" message="Try a different search term or clear filters.">
      <template #icon><BuildingStorefrontIcon class="h-8 w-8 text-meridian-400" /></template>
    </EmptyState>
  </DashboardLayout>
</template>
