<template>
  <UApp :toaster="(toaster as any)">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <SessionEndedModal />
  </UApp>
</template>
<script setup lang="ts">
const toaster = { position: 'top-right', duration: 2000 }
</script>
