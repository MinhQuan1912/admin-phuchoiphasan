<template>
   <div>
      <NuxtLink to="/van-ban-phap-luat"
         class="inline-flex items-center gap-1.5 text-[13px] font-semibold text-gray-500 hover:text-primary transition-colors mb-4">
         <IconsChevronLeft class="size-3.75" />
         Quay lại danh sách
      </NuxtLink>

      <div v-if="!article" class="grid lg:grid-cols-[1fr_320px] gap-4.5 items-start">
         <div class="h-130 rounded-[14px] bg-gray-100 animate-pulse"></div>
         <div class="h-80 rounded-[14px] bg-gray-100 animate-pulse"></div>
      </div>

      <ArticleForm v-else is-edit base-path="/van-ban-phap-luat" :loading="loading" :initial-title="article.title" :initial-title-en="article.titleEn ?? ''"
         :initial-thumbnail-url="article.thumbnail"
         :initial-category-id="article.categoryId" :initial-kind="article.category.kind"
         :initial-status="article.status" :initial-featured="article.featured" :initial-blocks="initialBlocks"
         :initial-document-code="article.documentCode ?? ''" :initial-effective-date="initialEffectiveDate"
         @submit="onSubmit" />
   </div>
</template>

<script setup lang="ts">
import { useArticleForm } from '~/composables/useArticleForm'
import { useToastMessage } from '~/composables/useToastMessage'
import { useArticleStore } from '~/stores/article'
import type { Article, ArticleFormPayload, EditorBlock } from '~/types'

definePageMeta({ middleware: 'auth' })
useHead({ title: 'Sửa văn bản · Quản trị' })

const route = useRoute()
const store = useArticleStore()
const toast = useToastMessage()
const { buildArticleFormData, articleToEditorBlocks } = useArticleForm()

const id = route.params.id as string
const loading = ref(false)
const article = ref<Article | null>(null)
const initialBlocks = ref<EditorBlock[]>([])

// API trả ISO đầy đủ, <input type="date"> chỉ nhận yyyy-mm-dd
const initialEffectiveDate = computed(() => article.value?.effectiveDate?.slice(0, 10) ?? '')

onMounted(async () => {
   try {
      const a = await store.fetchOne(id)
      if (a) {
         article.value = a
         initialBlocks.value = articleToEditorBlocks(a)
      }
   } catch (e: any) {
      toast.error(e.message)
      await navigateTo('/van-ban-phap-luat')
   }
})

async function onSubmit(payload: ArticleFormPayload) {
   loading.value = true
   try {
      const fd = buildArticleFormData(payload)
      const res = await store.update(id, fd)
      toast.success(res.message)
      await navigateTo('/van-ban-phap-luat')
   } catch (e: any) {
      toast.error(e.message)
   } finally {
      loading.value = false
   }
}
</script>
