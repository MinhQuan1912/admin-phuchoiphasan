<template>
   <div>
      <NuxtLink to="/tin-tuc"
         class="inline-flex items-center gap-1.5 text-[13px] font-semibold text-gray-500 hover:text-primary transition-colors mb-4">
         <IconsChevronLeft class="size-3.75" />
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
useHead({ title: 'Soạn tin tức · Quản trị' })

const store = useArticleStore()
const toast = useToastMessage()
const { buildArticleFormData } = useArticleForm()

const loading = ref(false)

async function onSubmit(payload: {
   title: string
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
      await navigateTo('/tin-tuc')
   } catch (e: any) {
      toast.error(e.message)
   } finally {
      loading.value = false
   }
}
</script>
