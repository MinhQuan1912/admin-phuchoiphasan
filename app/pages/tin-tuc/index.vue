<template>
   <ArticleListView kind="NEWS" base-path="/tin-tuc" add-label="Tin tức mới" item-noun="tin tức" />
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
useHead({ title: 'Quản lý tin tức · Quản trị' })
</script>
