<template>
   <ArticleListView kind="FAQ" base-path="/cau-hoi-thuong-gap" add-label="Thêm câu hỏi" item-noun="câu hỏi" />
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
useHead({ title: 'Câu hỏi thường gặp · Quản trị' })
</script>
