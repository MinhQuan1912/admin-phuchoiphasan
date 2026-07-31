<template>
   <ArticleListView kind="NOTICE" base-path="/thong-bao" add-label="Thêm thông báo" item-noun="thông báo" />
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
useHead({ title: 'Thông báo · Quản trị' })
</script>
