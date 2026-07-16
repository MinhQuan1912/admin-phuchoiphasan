<template>
   <div>
      <!-- KPI -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-[18px] mb-6">
         <div v-for="k in kpis" :key="k.label" class="bg-white border border-gray-200 rounded-[14px] p-5">
            <div class="flex items-center justify-between">
               <span class="text-[13px] text-gray-500">{{ k.label }}</span>
               <span class="w-[34px] h-[34px] rounded-[9px] bg-primary/10 text-primary flex items-center justify-center"
                  v-html="k.icon"></span>
            </div>
            <div v-if="loading" class="h-9 w-16 mt-2.5 rounded-md bg-gray-100 animate-pulse"></div>
            <div v-else class="text-3xl font-extrabold tracking-tight mt-2.5">{{ k.value }}</div>
            <div class="text-xs text-gray-500 mt-1">{{ k.hint }}</div>
         </div>
      </div>

      <!-- Recent posts -->
      <div class="bg-white border border-gray-200 rounded-[14px] p-5">
         <div class="flex items-center justify-between mb-1.5">
            <div class="flex items-center gap-2.5">
               <span class="w-1 h-5 bg-primary rounded-sm"></span>
               <h3 class="text-base font-extrabold">Bài viết mới nhất</h3>
            </div>
            <NuxtLink to="/bai-viet" class="text-[13px] font-semibold text-primary">Xem tất cả →</NuxtLink>
         </div>

         <div v-if="loading" class="py-3.5">
            <div v-for="i in 5" :key="i" class="h-14 border-t border-gray-100 first:border-t-0 flex items-center">
               <div class="h-10 w-full rounded-md bg-gray-100 animate-pulse"></div>
            </div>
         </div>

         <p v-else-if="!store.items.length" class="py-10 text-center text-sm text-gray-500">
            Chưa có bài viết nào.
            <NuxtLink to="/bai-viet/create" class="font-semibold text-primary">Tạo bài đầu tiên</NuxtLink>
         </p>

         <NuxtLink v-for="p in store.items" v-else :key="p.id" :to="`/bai-viet/${p.id}`"
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
import { useToastMessage } from '~/composables/useToastMessage'
import { useArticleStore } from '~/stores/article'
import { STATUS_LABEL, type ArticleStatus } from '~/types'

definePageMeta({ middleware: 'auth' })
useHead({ title: 'Tổng quan · Quản trị' })

const store = useArticleStore()
const toast = useToastMessage()
const loading = ref(true)

const icons = {
   posts: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16v16H4z"/><line x1="8" y1="9" x2="16" y2="9"/><line x1="8" y1="13" x2="16" y2="13"/></svg>',
   check: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
   draft: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4z"/></svg>',
   tag: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>',
}

const kpis = computed(() => [
   { label: 'Tổng bài viết', value: store.stats?.total ?? 0, hint: 'Toàn bộ bài viết', icon: icons.posts },
   { label: 'Đã đăng', value: store.stats?.published ?? 0, hint: 'Đang hiển thị trên website', icon: icons.check },
   { label: 'Bản nháp', value: store.stats?.draft ?? 0, hint: 'Chưa hiển thị công khai', icon: icons.draft },
   { label: 'Chuyên mục', value: store.stats?.categories ?? 0, hint: 'Số chuyên mục đang có', icon: icons.tag },
])

onMounted(async () => {
   try {
      await Promise.all([
         store.fetchStats(),
         store.fetchList({ page: 1, limit: 5, status: undefined, q: '' }),
      ])
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
