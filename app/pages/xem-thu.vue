<template>
   <div>
      <div class="sticky top-0 z-10 h-14 px-5 flex items-center justify-between gap-3 bg-white border-b border-gray-200">
         <button type="button" @click="closeTab"
            class="h-9 px-3.5 shrink-0 inline-flex items-center gap-1.5 border border-gray-200 rounded-[10px] font-semibold text-[13px] hover:bg-gray-200 transition-colors">
            <IconsClose class="size-3.75" />
            Đóng tab
         </button>
      </div>

      <div v-if="!draft" class="py-24 text-center">
         <p class="text-sm text-gray-500">Không tìm thấy bản nháp để xem thử.</p>
         <p class="mt-1.5 text-[13px] text-gray-400">Hãy bấm "Xem thử" lại từ trang soạn bài viết.</p>
      </div>

      <ArticlePreview v-else :title="draft.title" :category-name="draft.categoryName" :blocks="draft.blocks" />
   </div>
</template>

<script setup lang="ts">
import { PREVIEW_DRAFT_KEY } from '~/composables/useArticlePreview'
import { useAuthStore } from '~/stores/auth'
import type { ArticlePreviewDraft } from '~/types'

definePageMeta({
   layout: false,
   middleware: () => {
      const auth = useAuthStore()
      auth.loadToken()
      if (!auth.isAuthenticated) return navigateTo('/dang-nhap')
   },
})

useHead({
   // Font Inter + Merriweather do @nuxt/fonts tự nạp (khai báo ở nuxt.config.ts)
   title: 'Xem thử bài viết · Quản trị',
})

function readDraft(): ArticlePreviewDraft | null {
   // Tab soạn thảo ghi bản nháp vào localStorage ngay trước khi mở tab này
   try {
      const raw = localStorage.getItem(PREVIEW_DRAFT_KEY)
      return raw ? JSON.parse(raw) : null
   } catch {
      return null
   }
}

// Đọc thẳng trong setup thay vì đợi onMounted, để khỏi chớp một khung hình
// "không tìm thấy bản nháp" trước khi nội dung kịp hiện
const draft = import.meta.client ? readDraft() : null

function closeTab() {
   window.close()
}
</script>
