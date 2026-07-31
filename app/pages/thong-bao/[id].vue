<template>
   <div>
      <NuxtLink to="/thong-bao"
         class="inline-flex items-center gap-1.5 text-[13px] font-semibold text-gray-500 hover:text-primary transition-colors mb-4">
         <IconsChevronLeft class="size-3.75" />
         Quay lại danh sách
      </NuxtLink>

      <div v-if="!article" class="grid lg:grid-cols-[1fr_320px] gap-4.5 items-start">
         <div class="h-130 rounded-[14px] bg-gray-100 animate-pulse"></div>
         <div class="h-80 rounded-[14px] bg-gray-100 animate-pulse"></div>
      </div>

      <ArticleForm v-else is-edit base-path="/thong-bao" :loading="loading" :initial-title="article.title"
         :initial-thumbnail-url="article.thumbnail"
         :initial-category-id="article.categoryId" :initial-kind="article.category.kind"
         :initial-status="article.status" :initial-featured="article.featured" :initial-blocks="initialBlocks" :initial-court="article.court ?? ''"
         @submit="onSubmit" />
   </div>
</template>

<script setup lang="ts">
import { useArticleForm } from '~/composables/useArticleForm'
import { useToastMessage } from '~/composables/useToastMessage'
import { useArticleStore } from '~/stores/article'
import type { Article, ArticleFormPayload, EditorBlock } from '~/types'

definePageMeta({ middleware: 'auth' })
useHead({ title: 'Sửa thông báo · Quản trị' })

const route = useRoute()
const store = useArticleStore()
const toast = useToastMessage()
const { buildArticleFormData, articleToEditorBlocks } = useArticleForm()

const id = route.params.id as string
const loading = ref(false)
const article = ref<Article | null>(null)
const initialBlocks = ref<EditorBlock[]>([])

onMounted(async () => {
   try {
      const a = await store.fetchOne(id)
      if (a) {
         article.value = a
         initialBlocks.value = articleToEditorBlocks(a)
      }
   } catch (e: any) {
      toast.error(e.message)
      await navigateTo('/thong-bao')
   }
})

async function onSubmit(payload: ArticleFormPayload) {
   loading.value = true
   try {
      const fd = buildArticleFormData(payload)
      const res = await store.update(id, fd)
      toast.success(res.message)
      await navigateTo('/thong-bao')
   } catch (e: any) {
      toast.error(e.message)
   } finally {
      loading.value = false
   }
}
</script>
