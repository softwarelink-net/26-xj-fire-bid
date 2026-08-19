<script setup lang="ts">
defineProps<{ title: string; subtitle?: string }>()
</script>

<template>
  <div class="mb-5">
    <h1 class="text-xl font-semibold text-slate-100">{{ title }}</h1>
    <p v-if="subtitle" class="mt-1 text-sm text-slate-400">{{ subtitle }}</p>
  </div>
</template>
