<template>
   <ArticleListView kind="EVENT" base-path="/su-kien" add-label="Thêm sự kiện" item-noun="sự kiện" />
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
useHead({ title: 'Sự kiện · Quản trị' })
</script>
