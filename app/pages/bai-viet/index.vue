<template>
   <div>
      <div class="flex flex-wrap gap-3 items-center justify-between mb-[18px]">
         <div class="relative flex-1 min-w-[260px] max-w-[400px]">
            <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 flex">
               <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.5" y2="16.5"/></svg>
            </span>
            <input v-model="query" type="text" placeholder="Tìm bài viết..."
               class="w-full h-[42px] border border-gray-200 rounded-[10px] pl-10 pr-3.5 text-sm outline-none focus:border-primary transition-colors bg-white" />
         </div>
         <NuxtLink to="/bai-viet/create"
            class="h-[42px] inline-flex items-center gap-2 px-[18px] bg-primary text-white rounded-[10px] font-semibold text-sm">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Bài viết mới
         </NuxtLink>
      </div>

      <div class="flex flex-wrap gap-2.5 mb-4 items-center">
         <button v-for="s in statusTabs" :key="s.label" type="button" class="h-[34px] px-3.5 inline-flex items-center rounded-full text-[13px] font-semibold border transition-all"
            :class="s.value === activeStatus ? 'bg-primary text-white border-primary' : 'bg-white border-gray-200 hover:border-primary'"
            @click="onChangeStatus(s.value)">
            {{ s.label }}
         </button>
         <div class="relative ml-auto">
            <select v-model="selectedCategoryId" @change="onChangeCategory"
               class="h-[34px] border rounded-full pl-3.5 pr-9 text-[13px] font-semibold appearance-none outline-none cursor-pointer bg-white transition-colors"
               :class="selectedCategoryId ? 'text-primary border-primary/40' : 'text-gray-600 border-gray-200 hover:border-primary'">
               <option :value="undefined">Tất cả chuyên mục</option>
               <option v-for="c in categoryStore.items" :key="c.id" :value="c.id">{{ c.name }}</option>
            </select>
            <span class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none flex"
               :class="selectedCategoryId ? 'text-primary' : 'text-gray-500'">
               <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
            </span>
         </div>
      </div>

      <div class="bg-white border border-gray-200 rounded-[14px] overflow-x-auto">
         <div class="grid min-w-[820px] grid-cols-[1fr_150px_130px_120px_90px] gap-4 items-center px-5 py-3.5 bg-gray-100 uppercase tracking-wide text-[11px] font-bold text-gray-500">
            <div>Tiêu đề</div><div>Chuyên mục</div><div>Ngày</div><div>Trạng thái</div><div class="text-right">Thao tác</div>
         </div>

         <div v-if="firstLoad" class="p-5 space-y-3">
            <div v-for="i in 5" :key="i" class="h-10 rounded-md bg-gray-100 animate-pulse"></div>
         </div>

         <div v-else-if="!store.items.length && !store.loading" class="px-5 py-14 text-center">
            <p class="text-sm text-gray-500">{{ emptyMessage }}</p>
            <NuxtLink v-if="!isFiltered" to="/bai-viet/create" class="inline-block mt-2 text-sm font-semibold text-primary">Tạo bài viết đầu tiên</NuxtLink>
         </div>

         <div v-else :aria-busy="store.loading" class="transition-opacity duration-150"
            :class="store.loading ? 'opacity-60' : 'opacity-100'">
            <div v-for="p in store.items" :key="p.id"
               class="grid min-w-[820px] grid-cols-[1fr_150px_130px_120px_90px] gap-4 items-center px-5 py-3.5 border-t border-gray-100 hover:bg-gray-50/60 transition-colors">
               <div class="flex items-center gap-3 min-w-0">
                  <img :src="p.thumbnail" :alt="p.title" class="w-12 h-[34px] shrink-0 rounded-md object-cover bg-gray-100">
                  <div class="min-w-0">
                     <NuxtLink :to="`/bai-viet/${p.id}`" class="block text-sm font-semibold leading-snug truncate hover:text-primary transition-colors">{{ p.title }}</NuxtLink>
                  </div>
               </div>
               <div class="text-[13px] text-gray-500 truncate">{{ p.category.name }}</div>
               <div class="text-[13px] text-gray-500">{{ formatDate(p.createdAt) }}</div>
               <div>
                  <button type="button" :disabled="busyId === p.id"
                     :title="p.status === 'PUBLISHED' ? 'Bấm để chuyển về bản nháp' : 'Bấm để đăng'"
                     class="text-[11px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap transition-opacity hover:opacity-75 disabled:opacity-40"
                     :class="badge(p.status)" @click="onToggleStatus(p)">
                     {{ STATUS_LABEL[p.status] }}
                  </button>
               </div>
               <div class="flex gap-2 justify-end">
                  <NuxtLink :to="`/bai-viet/${p.id}`" title="Sửa" class="text-gray-500 hover:text-primary flex">
                     <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4z"/></svg>
                  </NuxtLink>
                  <button type="button" title="Xóa" :disabled="busyId === p.id" class="text-gray-500 hover:text-rose-800 disabled:opacity-40 flex" @click="askDelete(p)">
                     <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                  </button>
               </div>
            </div>
         </div>
      </div>

      <div v-if="!firstLoad && store.items.length" class="flex items-center justify-between mt-4">
         <div v-if="store.totalPages > 1" class="flex gap-2">
            <button type="button" class="w-9 h-9 flex items-center justify-center border border-gray-200 rounded-lg disabled:text-gray-400 hover:border-primary disabled:hover:border-gray-200"
               :disabled="store.page <= 1" @click="goPage(store.page - 1)">‹</button>
            <button v-for="n in store.totalPages" :key="n" type="button" class="w-9 h-9 flex items-center justify-center rounded-lg text-sm"
               :class="n === store.page ? 'bg-primary text-white font-semibold' : 'border border-gray-200 hover:border-primary'"
               @click="goPage(n)">{{ n }}</button>
            <button type="button" class="w-9 h-9 flex items-center justify-center border border-gray-200 rounded-lg text-sm disabled:text-gray-400 hover:border-primary disabled:hover:border-gray-200"
               :disabled="store.page >= store.totalPages" @click="goPage(store.page + 1)">›</button>
         </div>
      </div>

      <div v-if="pendingDelete" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" @click.self="pendingDelete = null">
         <div class="bg-white rounded-[14px] p-6 w-full max-w-[420px]">
            <h3 class="text-base font-extrabold">Xóa bài viết?</h3>
            <p class="mt-2 text-sm text-gray-500 leading-relaxed">
               Bài viết <strong class="text-gray-900">“{{ pendingDelete.title }}”</strong> cùng toàn bộ nội dung và ảnh sẽ bị xóa. Không thể hoàn tác.
            </p>
            <div class="mt-5 flex justify-end gap-2.5">
               <button type="button" class="h-10 px-4 bg-white border border-gray-200 rounded-[10px] font-semibold text-sm" @click="pendingDelete = null">Hủy</button>
               <button type="button" :disabled="deleting" class="h-10 px-4 bg-rose-700 text-white rounded-[10px] font-bold text-sm disabled:opacity-60" @click="confirmDelete">
                  {{ deleting ? 'Đang xóa...' : 'Xóa' }}
               </button>
            </div>
         </div>
      </div>
   </div>
</template>

<script setup lang="ts">
import { useToastMessage } from '~/composables/useToastMessage'
import { useArticleStore } from '~/stores/article'
import { useCategoryStore } from '~/stores/category'
import { STATUS_LABEL, type Article, type ArticleStatus } from '~/types'

definePageMeta({ middleware: 'auth' })
useHead({ title: 'Quản lý bài viết · Quản trị' })

const store = useArticleStore()
const categoryStore = useCategoryStore()
const toast = useToastMessage()

const statusTabs: { label: string; value?: ArticleStatus }[] = [
   { label: 'Tất cả', value: undefined },
   { label: 'Đã đăng', value: 'PUBLISHED' },
   { label: 'Bản nháp', value: 'DRAFT' },
]

const activeStatus = ref<ArticleStatus | undefined>(store.filters.status)
const query = ref(store.filters.q)
const busyId = ref<string | null>(null)
const pendingDelete = ref<Article | null>(null)
const deleting = ref(false)
const firstLoad = ref(true)

const isFiltered = computed(
   () => !!activeStatus.value || !!query.value.trim() || !!store.filters.categoryId,
)
const emptyMessage = computed(() =>
   isFiltered.value ? 'Không tìm thấy bài viết nào khớp bộ lọc.' : 'Chưa có bài viết nào.',
)

function load(page = 1) {
   store.filters.status = activeStatus.value
   store.filters.q = query.value
   return store.fetchList({ page, limit: 10 }).catch((e: any) => toast.error(e.message))
}

const route = useRoute()
const selectedCategoryId = ref<string | undefined>(
   (route.query.categoryId as string) || undefined,
)
store.filters.categoryId = selectedCategoryId.value

onMounted(async () => {
   categoryStore.fetchAll().catch(() => null)
   await load(1)
   firstLoad.value = false
})

function onChangeCategory() {
   store.filters.categoryId = selectedCategoryId.value
   navigateTo({
      path: '/bai-viet',
      query: selectedCategoryId.value ? { categoryId: selectedCategoryId.value } : {},
   })
   load(1)
}

let timer: ReturnType<typeof setTimeout> | undefined
watch(query, () => {
   clearTimeout(timer)
   timer = setTimeout(() => load(1), 350)
})
onBeforeUnmount(() => clearTimeout(timer))

function onChangeStatus(s?: ArticleStatus) {
   if (activeStatus.value === s) return
   activeStatus.value = s
   load(1)
}

function goPage(n: number) {
   if (n < 1 || n > store.totalPages || n === store.page) return
   load(n)
}

async function onToggleStatus(p: Article) {
   busyId.value = p.id
   const next: ArticleStatus = p.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED'
   try {
      const res = await store.setStatus(p.id, next)
      toast.success(res.message)
      if (activeStatus.value) await load(store.page)
      await store.fetchStats().catch(() => null)
   } catch (e: any) {
      toast.error(e.message)
   } finally {
      busyId.value = null
   }
}

function askDelete(p: Article) {
   pendingDelete.value = p
}

async function confirmDelete() {
   const p = pendingDelete.value
   if (!p) return
   deleting.value = true
   busyId.value = p.id
   try {
      const res = await store.remove(p.id)
      toast.success(res.message)
      pendingDelete.value = null
      await load(store.page)
      await store.fetchStats().catch(() => null)
   } catch (e: any) {
      toast.error(e.message)
   } finally {
      deleting.value = false
      busyId.value = null
   }
}

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
