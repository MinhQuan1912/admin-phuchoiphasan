<template>
   <div class="frontend-surface min-h-screen bg-gray-50 text-gray-900">
      <article class="container mx-auto px-6 pt-11 pb-14 max-w-[900px]">
         <nav class="text-sm text-gray-500 mb-5">
            <span>Trang chủ</span>
            <span class="opacity-60 mx-1">/</span>
            <span>Tin tức</span>
            <template v-if="categoryName">
               <span class="opacity-60 mx-1">/</span>
               <span>{{ categoryName }}</span>
            </template>
         </nav>

         <h1 class="mt-4 mb-5 text-4xl/tight font-extrabold tracking-tight">
            {{ title || 'Bài viết chưa có tiêu đề' }}
         </h1>

         <div class="flex items-center gap-3.5 pb-6 border-b border-gray-200 text-[13px] text-gray-500">
            <span>{{ today }}</span>
            <span class="opacity-60">·</span>
            <span>{{ readingTime }} phút đọc</span>
         </div>

         <div v-if="thumbnail" class="aspect-video my-7 rounded-2xl overflow-hidden">
            <img :src="thumbnail" alt="" class="w-full h-full object-cover">
         </div>
         <div v-else
            class="aspect-video my-7 rounded-2xl border-[1.5px] border-dashed border-gray-300 flex items-center justify-center text-[13px] text-gray-400">
            Chưa có ảnh đại diện
         </div>

         <p v-if="description" class="mb-5 text-[19px] leading-relaxed font-medium">{{ description }}</p>

         <div v-if="!renderable.length" class="py-10 text-center text-sm text-gray-500">
            Chưa có nội dung để xem thử.
         </div>

         <template v-for="b in renderable" :key="b.key">
            <div v-if="b.type === 'TEXT'" class="article-body" v-html="b.content"></div>
            <figure v-else class="my-7">
               <img :src="b.content" alt="" class="w-full rounded-2xl">
            </figure>
         </template>
      </article>
   </div>
</template>

<script setup lang="ts">
import type { ArticlePreviewDraft } from '~/types'

const props = defineProps<{
   title: string
   description: string
   thumbnail?: string
   categoryName?: string
   blocks: ArticlePreviewDraft['blocks']
}>()

const renderable = computed(() => props.blocks.filter(b => !!b.content))

const today = computed(() =>
   new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }),
)

const readingTime = computed(() => {
   const words = props.blocks
      .filter(b => b.type === 'TEXT')
      .map(b => b.content.replace(/<[^>]+>/g, ' '))
      .join(' ')
      .trim()
      .split(/\s+/)
      .filter(Boolean).length
   return Math.max(1, Math.round(words / 200))
})
</script>

<style scoped>
.frontend-surface {
   --color-primary: #5772ff;
   font-family: 'Be Vietnam Pro', sans-serif;
}

.article-body {
   :deep(p) {
      margin-bottom: 1.25rem;
      font-size: 16.5px;
      line-height: 2rem;
      color: var(--color-gray-500);
   }

   :deep(h2) {
      margin: 2.25rem 0 0.875rem;
      font-size: 1.5rem;
      font-weight: 800;
      letter-spacing: -0.025em;
      line-height: 1.3;
   }

   :deep(h3) {
      margin: 1.75rem 0 0.75rem;
      font-size: 1.25rem;
      font-weight: 700;
      letter-spacing: -0.02em;
      line-height: 1.35;
   }

   :deep(ul),
   :deep(ol) {
      margin-bottom: 1.5rem;
      padding-left: 1.5rem;
      font-size: 16.5px;
      line-height: 2;
      color: var(--color-gray-500);
   }

   :deep(ul) {
      list-style: disc;
   }

   :deep(ol) {
      list-style: decimal;
   }

   :deep(li) {
      margin-bottom: 0.75rem;
   }

   :deep(li > p) {
      margin-bottom: 0;
   }

   :deep(strong) {
      color: var(--color-gray-900);
      font-weight: 700;
   }

   :deep(blockquote) {
      margin: 1.75rem 0;
      padding: 1.25rem 1.5rem;
      border-left: 4px solid var(--color-primary);
      background: var(--color-gray-100);
      border-radius: 0 0.75rem 0.75rem 0;
      font-size: 17px;
      line-height: 1.625;
      font-style: italic;
   }

   :deep(blockquote p) {
      margin-bottom: 0;
      font-size: inherit;
      line-height: inherit;
      color: inherit;
   }

   :deep(a) {
      color: var(--color-primary);
      text-decoration: underline;
   }

   :deep(:last-child) {
      margin-bottom: 0;
   }
}
</style>
