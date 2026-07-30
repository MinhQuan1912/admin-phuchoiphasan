<template>
   <div>
      <NuxtLink to="/thong-bao-pha-san"
         class="inline-flex items-center gap-1.5 text-[13px] font-semibold text-gray-500 hover:text-primary transition-colors mb-4">
         <IconsChevronLeft class="size-3.75" />
         Quay lại danh sách
      </NuxtLink>

      <ArticleForm default-kind="NOTICE" base-path="/thong-bao-pha-san" :loading="loading" @submit="onSubmit" />
   </div>
</template>

<script setup lang="ts">
import { useArticleForm } from '~/composables/useArticleForm'
import { useToastMessage } from '~/composables/useToastMessage'
import { useArticleStore } from '~/stores/article'
import type { ArticleFormPayload } from '~/types'

definePageMeta({ middleware: 'auth' })
useHead({ title: 'Soạn thông báo · Quản trị' })

const store = useArticleStore()
const toast = useToastMessage()
const { buildArticleFormData } = useArticleForm()

const loading = ref(false)

async function onSubmit(payload: ArticleFormPayload) {
   loading.value = true
   try {
      const fd = buildArticleFormData(payload)
      const res = await store.create(fd)
      toast.success(res.message)
      await navigateTo('/thong-bao-pha-san')
   } catch (e: any) {
      toast.error(e.message)
   } finally {
      loading.value = false
   }
}
</script>
