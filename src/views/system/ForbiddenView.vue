<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <div class="panel mx-auto max-w-lg p-10 text-center">
    <p class="text-3xl font-semibold text-rose-300">403</p>
    <p class="mt-2 text-sm text-slate-300">当前角色无权访问该模块，已按 RBAC 矩阵拦截。</p>
    <RouterLink to="/" class="btn-primary mt-6 inline-flex">返回驾驶舱</RouterLink>
  </div>
</template>
