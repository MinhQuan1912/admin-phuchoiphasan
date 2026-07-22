<template>
   <ArticleListView kind="NOTICE" base-path="/thong-bao-pha-san" add-label="Thêm thông báo" item-noun="thông báo" />
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
useHead({ title: 'Thông báo phá sản · Quản trị' })
</script>
