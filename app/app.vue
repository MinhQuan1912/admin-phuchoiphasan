<template>
  <UApp :toaster="(toaster as any)">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
<script setup lang="ts">
const toaster = { position: 'top-right', duration: 2000 }
</script>
