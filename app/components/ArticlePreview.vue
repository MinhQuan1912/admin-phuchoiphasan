<template>
   <div class="frontend-surface min-h-screen bg-gray-50 text-gray-900">
      <div class="fixed top-0 left-0 h-0.75 bg-(--color-preview-primary) z-20 transition-[width] duration-100"
         :style="{ width: progress + '%' }"></div>

      <article class="container max-w-3xl mx-auto px-4 sm:px-6 pt-11 pb-14">
         <nav class="text-base text-gray-500 mb-5">
            <span>Trang chủ</span>
            <span class="opacity-60 mx-1">/</span>
            <span>Tin tức</span>
            <template v-if="categoryName">
               <span class="opacity-60 mx-1">/</span>
               <span>{{ categoryName }}</span>
            </template>
         </nav>

         <h1 class="mt-4 mb-5 text-3xl sm:text-4xl/tight font-extrabold tracking-tight">
            {{ title || 'Bài viết chưa có tiêu đề' }}
         </h1>

         <div class="flex items-center gap-3.5 pb-6 border-b border-gray-200 text-[15px] text-gray-500">
            <span>{{ today }}</span>
         </div>

         <div v-if="!renderable.length" class="py-10 text-center text-sm text-gray-500">
            Chưa có nội dung để xem thử.
         </div>

         <div v-else class="mt-7">
            <template v-for="b in renderable" :key="b.key">
               <div v-if="b.type === 'TEXT'" class="article-body" v-html="b.content"></div>
               <figure v-else class="my-7">
                  <div class="aspect-video rounded-2xl overflow-hidden">
                     <img :src="b.content" :alt="b.caption || ''" class="w-full h-full object-cover">
                  </div>
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

// Thanh tiến độ đọc bài, giống trang chi tiết bên frontend
const progress = ref(0)

function onScroll() {
   const max = document.documentElement.scrollHeight - window.innerHeight || 1
   progress.value = Math.min(100, Math.max(0, (window.scrollY / max) * 100))
}

onMounted(() => {
   window.addEventListener('scroll', onScroll, { passive: true })
   onScroll()
})

onUnmounted(() => window.removeEventListener('scroll', onScroll))
</script>

<style scoped>
/* Chỉ giữ phần khung trang xem thử. Style thân bài (`.article-body`) nằm ở
   app/assets/css/article-body.css — file dùng chung với Frontend. */
.frontend-surface {
   --color-preview-primary: var(--color-primary);
   font-family: 'Inter', Arial, Helvetica, sans-serif;
}

.frontend-surface h1 {
   font-family: 'Merriweather', Georgia, serif;
}
</style>
