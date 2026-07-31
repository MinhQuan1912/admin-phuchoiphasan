<template>
   <div>
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4.5 mb-6">
         <div v-for="k in kpis" :key="k.label" class="bg-white border border-gray-200 rounded-[14px] p-5">
            <div class="flex items-center justify-between">
               <span class="text-[13px] text-gray-500">{{ k.label }}</span>
               <span class="w-8.5 h-8.5 rounded-[9px] bg-primary/10 text-primary flex items-center justify-center">
                  <component :is="k.icon" class="size-4.25" />
               </span>
            </div>
            <div v-if="loading" class="h-9 w-16 mt-2.5 rounded-md"
               :class="showSkeleton ? 'bg-gray-100 animate-pulse' : ''"></div>
            <div v-else class="text-3xl font-extrabold tracking-tight mt-2.5">{{ k.value }}</div>
            <div class="text-xs text-gray-500 mt-1">{{ k.hint }}</div>
         </div>
      </div>

      <div class="bg-white border border-gray-200 rounded-[14px] p-5">
         <div class="flex items-center justify-between mb-1.5">
            <div class="flex items-center gap-2.5">
               <span class="w-1 h-5 bg-primary rounded-sm"></span>
               <h3 class="text-base font-extrabold">Bài viết mới nhất</h3>
            </div>
            <NuxtLink to="/tin-tuc" class="text-[13px] font-semibold text-primary">Xem tất cả →</NuxtLink>
         </div>

         <div v-if="loading" class="py-3.5">
            <div v-for="i in 5" :key="i" class="h-14 border-t border-gray-100 first:border-t-0 flex items-center">
               <div class="h-10 w-full rounded-md" :class="showSkeleton ? 'bg-gray-100 animate-pulse' : ''"></div>
            </div>
         </div>

         <p v-else-if="!store.items.length" class="py-10 text-center text-sm text-gray-500">
            Chưa có tin tức nào.
            <NuxtLink to="/tin-tuc/create" class="font-semibold text-primary">Tạo tin đầu tiên</NuxtLink>
         </p>

         <NuxtLink v-for="p in store.items" v-else :key="p.id" :to="`/tin-tuc/${p.id}`"
            class="flex items-center gap-3.5 py-3.5 border-t border-gray-100 first:border-t-0 hover:bg-gray-50/60 transition-colors">
            <img :src="p.thumbnail" :alt="p.title" class="w-14 h-10 shrink-0 rounded-lg object-cover bg-gray-100">
            <div class="flex-1 min-w-0">
               <div class="text-sm font-semibold leading-snug truncate">{{ p.title }}</div>
               <div class="text-xs text-gray-500 mt-0.5">{{ p.category.name }} · {{ formatDate(p.createdAt) }}</div>
            </div>
            <span class="text-[11px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap" :class="badge(p.status)">
               {{ STATUS_LABEL[p.status] }}
            </span>
         </NuxtLink>
      </div>
   </div>
</template>

<script setup lang="ts">
import { IconsAnnouncements, IconsCheck, IconsEye, IconsPosts } from '#components'
import { useToastMessage } from '~/composables/useToastMessage'
import { useArticleStore } from '~/stores/article'
import { STATUS_LABEL, type ArticleStatus } from '~/types'

definePageMeta({ middleware: 'auth' })
useHead({ title: 'Tổng quan · Quản trị' })

const store = useArticleStore()
const toast = useToastMessage()
const loading = ref(true)
const showSkeleton = useDelayedFlag(loading)

const kpis = computed(() => [
   { label: 'Tổng tin tức', value: formatNumber(store.stats?.total ?? 0), hint: 'Gồm cả bản nháp', icon: IconsPosts },
   { label: 'Tin tức đã đăng', value: formatNumber(store.stats?.published ?? 0), hint: 'Tin tức đang hiển thị trên website', icon: IconsCheck },
   { label: 'Tổng lượt xem', value: formatNumber(store.stats?.views ?? 0), hint: 'Mọi loại nội dung', icon: IconsEye },
   { label: 'Thông báo', value: formatNumber(store.stats?.notices ?? 0), hint: 'Gồm cả bản nháp', icon: IconsAnnouncements },
])

onMounted(async () => {
   try {
      const pending = Promise.all([
         store.fetchStats(),
         store.fetchList({ page: 1, limit: 5, status: undefined, q: '' }),
      ])
      loading.value = !store.stats || !store.listFromCache
      await pending
   } catch (e: any) {
      toast.error(e.message)
   } finally {
      loading.value = false
   }
})

function formatDate(d: string) {
   return new Date(d).toLocaleDateString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
   })
}

function badge(status: ArticleStatus) {
   return status === 'PUBLISHED'
      ? 'bg-emerald-50 text-emerald-700'
      : 'bg-gray-100 text-gray-500'
}
</script>
