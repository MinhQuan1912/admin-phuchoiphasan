<template>
   <div class="frontend-surface min-h-screen bg-gray-50 text-gray-900">
      <article class="container max-w-3xl mx-auto px-6 pt-11 pb-14">
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

         <div v-if="!renderable.length" class="py-10 text-center text-sm text-gray-500">
            Chưa có nội dung để xem thử.
         </div>

         <div v-else class="mt-7">
            <template v-for="b in renderable" :key="b.key">
               <div v-if="b.type === 'TEXT'" class="article-body" v-html="b.content"></div>
               <figure v-else class="my-7">
                  <img :src="b.content" :alt="b.caption || ''" class="w-full h-125 object-cover rounded-2xl">
                  <figcaption v-if="b.caption"
                     class="mt-2.5 text-center text-[13px] leading-relaxed text-gray-500 italic">
                     {{ b.caption }}
                  </figcaption>
               </figure>
            </template>
         </div>
      </article>
   </div>
</template>

<script setup lang="ts">
import type { ArticlePreviewDraft } from '~/types'

const props = defineProps<{
   title: string
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
   margin-bottom: 1.75rem;
}

.article-body :deep(p) {
   margin-bottom: 1.25rem;
   font-size: 16.5px;
   line-height: 2rem;
   color: var(--color-gray-500);
}

.article-body :deep(h2) {
   margin: 2.25rem 0 0.875rem;
   font-size: 1.5rem;
   font-weight: 800;
   letter-spacing: -0.025em;
   line-height: 1.3;
}

.article-body :deep(h3) {
   margin: 1.75rem 0 0.75rem;
   font-size: 1.25rem;
   font-weight: 700;
   letter-spacing: -0.02em;
   line-height: 1.35;
}

.article-body :deep(ul),
.article-body :deep(ol) {
   margin-bottom: 1.5rem;
   padding-left: 1.5rem;
   font-size: 16.5px;
   line-height: 2;
   color: var(--color-gray-500);
}

.article-body :deep(ul) {
   list-style: disc;
}

.article-body :deep(ol) {
   list-style: decimal;
}

.article-body :deep(li) {
   margin-bottom: 0.75rem;
}

.article-body :deep(li > p) {
   margin-bottom: 0;
}

.article-body :deep(strong) {
   color: var(--color-gray-900);
   font-weight: 700;
}

.article-body :deep(blockquote) {
   margin: 1.75rem 0;
   padding: 1.25rem 1.5rem;
   border-left: 4px solid var(--color-primary);
   background: var(--color-gray-100);
   border-radius: 0 0.75rem 0.75rem 0;
   font-size: 17px;
   line-height: 1.625;
   font-style: italic;
}

.article-body :deep(blockquote p) {
   margin-bottom: 0;
   font-size: inherit;
   line-height: inherit;
   color: inherit;
}

.article-body :deep(a) {
   color: var(--color-primary);
   text-decoration: underline;
}

.article-body :deep(mark) {
   padding: 0.05em 0.2em;
   border-radius: 0.25em;
   color: inherit;
}

.article-body :deep(sub),
.article-body :deep(sup) {
   line-height: 0;
   font-size: 0.75em;
}

.article-body :deep([style*="text-align"]) {
   /* TextAlign ghi style inline; đảm bảo áp cho cả heading lẫn đoạn văn */
   display: block;
}

.article-body :deep(> :last-child) {
   margin-bottom: 0;
}
</style>
