<template>
   <div>
      <NuxtLink to="/bai-viet"
         class="inline-flex items-center gap-1.5 text-[13px] font-semibold text-gray-500 hover:text-primary transition-colors mb-4">
         <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"
            stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6" />
         </svg>
         Quay lại danh sách
      </NuxtLink>

      <ArticleForm :loading="loading" @submit="onSubmit" />
   </div>
</template>

<script setup lang="ts">
import { useArticleForm } from '~/composables/useArticleForm'
import { useToastMessage } from '~/composables/useToastMessage'
import { useArticleStore } from '~/stores/article'
import type { ArticleStatus, EditorBlock } from '~/types'

definePageMeta({ middleware: 'auth' })
useHead({ title: 'Soạn bài viết · Quản trị' })

const store = useArticleStore()
const toast = useToastMessage()
const { buildArticleFormData } = useArticleForm()

const loading = ref(false)

async function onSubmit(payload: {
   title: string
   slug: string
   description: string
   categoryId: string
   status: ArticleStatus
   thumbnailFile: File | null
   blocks: EditorBlock[]
}) {
   loading.value = true
   try {
      const fd = buildArticleFormData(payload)
      const res = await store.create(fd)
      toast.success(res.message)
      await navigateTo('/bai-viet')
   } catch (e: any) {
      toast.error(e.message)
   } finally {
      loading.value = false
   }
}
</script>
