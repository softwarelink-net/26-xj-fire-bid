<script setup lang="ts">
import { RouterView } from 'vue-router'
import GlobalStickyBanner from '@/components/common/GlobalStickyBanner.vue'
</script>

<template>
  <GlobalStickyBanner />
  <div class="min-h-[calc(100vh-40px)]">
    <RouterView />
  </div>
</template>
