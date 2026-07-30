<template>
   <ArticleListView kind="LEGAL" base-path="/van-ban-phap-luat" add-label="Thêm văn bản" item-noun="văn bản" />
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
useHead({ title: 'Văn bản pháp luật · Quản trị' })
</script>
