<template>
   <div>
      <div class="flex flex-wrap gap-3 items-start justify-between mb-4.5">
         <div class="flex-1 min-w-65 max-w-100">
            <!-- relative bọc riêng ô nhập: dòng đếm bên dưới không được kéo lệch
                 icon và nút Tìm đang căn theo top-1/2 -->
            <div class="relative">
               <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 flex">
                  <IconsSearch class="size-4.25" />
               </span>
               <input ref="searchInput" v-model="query" type="text" :placeholder="searchPlaceholder"
                  class="w-full h-10.5 border border-gray-200 rounded-[10px] pl-10 pr-27 text-sm outline-none focus:border-primary transition-colors bg-white"
                  @keyup.enter="submitSearch" @keyup.esc="clearSearch" />
               <div class="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <button v-if="query || searchTerm" type="button" title="Xóa tìm kiếm"
                     class="w-7 h-7 flex items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                     @click="clearSearch">
                     <IconsClose class="size-3.75" />
                  </button>
                  <button type="button" title="Bấm Enter hoặc bấm đây để tìm"
                     class="h-8 px-3.5 rounded-md bg-primary text-white text-[13px] font-semibold hover:opacity-90 transition-opacity"
                     @click="submitSearch">
                     Tìm
                  </button>
               </div>
            </div>
            <p v-if="searchTerm" class="mt-1.5 text-[13px] text-gray-500">
               <strong class="text-gray-900">{{ formatNumber(store.total) }}</strong> {{ noun }} phù hợp
            </p>
         </div>
         <NuxtLink :to="`${basePath}/create`"
            class="h-10.5 inline-flex items-center gap-2 px-4.5 bg-primary text-white rounded-[10px] font-semibold text-sm hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0 transition-all">
            <IconsPlus class="size-4" />
            {{ addLabel }}
         </NuxtLink>
      </div>

      <div class="flex flex-wrap gap-2.5 mb-4 items-center">
         <button v-for="s in statusTabs" :key="s.label" type="button" class="h-8.5 px-3.5 inline-flex items-center rounded-full text-[13px] font-semibold border transition-all"
            :class="s.value === activeStatus ? 'bg-primary text-white border-primary' : 'bg-white border-gray-200 hover:bg-gray-200'"
            @click="onChangeStatus(s.value)">
            {{ s.label }}
         </button>
         <USelect v-if="showCategory" v-model="selectedCategoryId" :items="categoryItems"
            :placeholder="allCategoriesLabel" size="md" variant="outline"
            class="ml-auto min-w-45 max-w-full rounded-full"
            :ui="{ base: 'rounded-full font-semibold', content: 'rounded-xl' }" />
      </div>

      <div class="bg-white border border-gray-200 rounded-[14px] overflow-x-auto">
         <div class="grid min-w-230 gap-4 items-center px-5 py-3.5 bg-gray-100 uppercase tracking-wide text-[11px] font-bold text-gray-500" :class="gridCols">
            <div>Tiêu đề</div><div v-if="showCategory">Chuyên mục</div><div v-else-if="showDocumentCode">Số hiệu</div><div>{{ dateLabel }}</div><div>Lượt xem</div><div>Trạng thái</div><div class="text-right">Thao tác</div>
         </div>

         <div v-if="firstLoad">
            <div v-for="i in PAGE_SIZE" :key="i"
               class="flex items-center px-5 py-3.5 border-t border-gray-100">
               <div class="h-8.5 w-full rounded-md"
                  :class="showSkeleton ? 'bg-gray-100 animate-pulse' : ''"></div>
            </div>
         </div>

         <div v-else-if="!store.items.length && !store.loading" class="px-5 py-14 text-center">
            <p class="text-sm text-gray-500">{{ emptyMessage }}</p>
            <NuxtLink v-if="!isFiltered" :to="`${basePath}/create`" class="inline-block mt-2 text-sm font-semibold text-primary">{{ firstItemLabel }}</NuxtLink>
         </div>

         <div v-else :aria-busy="store.loading"
            :class="showLoading ? 'opacity-60 transition-opacity duration-150' : 'opacity-100'">
            <div v-for="p in store.items" :key="p.id"
               class="grid min-w-230 gap-4 items-center px-5 py-3.5 border-t border-gray-100 hover:bg-gray-50/60 transition-colors"
               :class="gridCols">
               <div class="flex items-center gap-3 min-w-0">
                  <img v-if="p.thumbnail" :src="p.thumbnail" :alt="p.title"
                     class="w-12 h-8.5 shrink-0 rounded-md object-cover bg-gray-100">
                  <div class="min-w-0 flex items-center gap-1.5">
                     <span v-if="p.featured" title="Bài nổi bật" class="shrink-0 text-amber-500 leading-none">★</span>
                     <NuxtLink :to="`${basePath}/${p.id}`" class="block text-sm font-semibold leading-snug truncate hover:text-primary transition-colors">{{ p.title }}</NuxtLink>
                  </div>
               </div>
               <div v-if="showCategory" class="text-[13px] text-gray-500 truncate">{{ p.category.name }}</div>
               <div v-else-if="showDocumentCode" class="text-[13px] text-gray-500 truncate">{{ p.documentCode || '—' }}
               </div>
               <div class="text-[13px] text-gray-500">
                  {{ formatDate(showDocumentCode ? p.effectiveDate : p.createdAt) }}
               </div>
               <div class="flex items-center gap-1.5 text-[13px] text-gray-500" title="Lượt xem trang chi tiết">
                  <IconsEye class="size-3.75 shrink-0" />
                  {{ formatNumber(p.views) }}
               </div>
               <div>
                  <button type="button" :disabled="busyId === p.id"
                     :title="p.status === 'PUBLISHED' ? 'Bấm để chuyển về bản nháp' : 'Bấm để đăng'"
                     class="text-[11px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap transition-opacity hover:opacity-75 disabled:opacity-40"
                     :class="badge(p.status)" @click="onToggleStatus(p)">
                     {{ STATUS_LABEL[p.status] }}
                  </button>
               </div>
               <div class="flex gap-2 justify-end">
                  <NuxtLink :to="`${basePath}/${p.id}`" title="Sửa" class="text-gray-500 hover:text-primary flex">
                     <IconsEdit class="size-4.25" />
                  </NuxtLink>
                  <button type="button" title="Xóa" :disabled="busyId === p.id" class="text-gray-500 hover:text-rose-800 disabled:opacity-40 flex" @click="askDelete(p)">
                     <IconsTrash class="size-4.25" />
                  </button>
               </div>
            </div>
         </div>
      </div>

      <div v-if="!firstLoad && store.items.length && store.totalPages > 1" class="flex justify-center mt-4">
         <UPagination :page="store.page" :total="store.total" :items-per-page="PAGE_SIZE"
            @update:page="goPage" />
      </div>

      <div v-if="pendingDelete" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" @click.self="pendingDelete = null">
         <div class="bg-white rounded-[14px] p-6 w-full max-w-105">
            <h3 class="text-base font-extrabold">Xóa {{ noun }}?</h3>
            <p class="mt-2 text-sm text-gray-500 leading-relaxed">
               {{ nounCap }} <strong class="text-gray-900">“{{ pendingDelete.title }}”</strong> cùng toàn bộ nội dung và ảnh sẽ bị xóa. Không thể hoàn tác.
            </p>
            <div class="mt-5 flex justify-end gap-2.5">
               <button type="button" class="h-10 px-4 bg-white border border-gray-200 rounded-[10px] font-semibold text-sm hover:bg-gray-200 transition-colors" @click="pendingDelete = null">Hủy</button>
               <button type="button" :disabled="deleting" class="h-10 px-4 bg-rose-700 text-white rounded-[10px] font-bold text-sm hover:bg-rose-800 hover:shadow-lg hover:shadow-rose-700/30 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:shadow-none disabled:translate-y-0 disabled:hover:bg-rose-700 transition-all" @click="confirmDelete">
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
import { STATUS_LABEL, hasCategoryPicker, sortNoticeTypes, type Article, type ArticleStatus, type CategoryKind } from '~/types'

const props = defineProps<{
   kind: CategoryKind
   basePath: string
   addLabel: string
   itemNoun?: string
}>()

const store = useArticleStore()
const categoryStore = useCategoryStore()
const toast = useToastMessage()

const noun = computed(() => props.itemNoun ?? 'bài viết')
const nounCap = computed(() => noun.value.charAt(0).toUpperCase() + noun.value.slice(1))
const searchPlaceholder = computed(() => `Tìm ${noun.value}...`)
const allCategoriesLabel = computed(() => props.kind === 'NOTICE' ? 'Tất cả loại' : 'Tất cả chuyên mục')
const firstItemLabel = computed(() => `Tạo ${noun.value} đầu tiên`)
const showCategory = computed(() => hasCategoryPicker(props.kind))
const showDocumentCode = computed(() => props.kind === 'LEGAL')
const dateLabel = computed(() => (showDocumentCode.value ? 'Hiệu lực' : 'Ngày'))
const gridCols = computed(() =>
   showCategory.value || showDocumentCode.value
      ? 'grid-cols-[1fr_150px_130px_90px_120px_90px]'
      : 'grid-cols-[1fr_130px_90px_120px_90px]')

const statusTabs: { label: string; value?: ArticleStatus }[] = [
   { label: 'Tất cả', value: undefined },
   { label: 'Đã đăng', value: 'PUBLISHED' },
   { label: 'Bản nháp', value: 'DRAFT' },
]

const route = useRoute()
const router = useRouter()
const activeStatus = ref<ArticleStatus | undefined>(undefined)
// `query` là chữ trong ô nhập, `searchTerm` là từ khóa đã bấm tìm — tách ra để
// gõ dở không lọc danh sách và dòng đếm luôn khớp kết quả đang hiện
const query = ref('')
const searchTerm = ref('')
const searchInput = ref<HTMLInputElement | null>(null)
const selectedCategoryId = ref<string | undefined>((route.query.categoryId as string) || undefined)
const busyId = ref<string | null>(null)
const pendingDelete = ref<Article | null>(null)
const deleting = ref(false)
const firstLoad = ref(true)
const showSkeleton = useDelayedFlag(firstLoad)

const showLoading = useDelayedFlag(computed(() => store.loading && !store.listFromCache), 250)
const PAGE_SIZE = 10

const categoryItems = computed(() => {
   const list = categoryStore.items.filter(c => c.kind === props.kind)
   const ordered = props.kind === 'NOTICE' ? sortNoticeTypes(list) : list
   return [
      { label: allCategoriesLabel.value, value: undefined },
      ...ordered.map(c => ({ label: c.name, value: c.id as string | undefined })),
   ]
})

const isFiltered = computed(
   () => !!activeStatus.value || !!searchTerm.value || !!selectedCategoryId.value,
)
const emptyMessage = computed(() =>
   isFiltered.value ? `Không tìm thấy ${noun.value} nào khớp bộ lọc.` : `Chưa có ${noun.value} nào.`,
)

function pageFromQuery() {
   const value = Number(route.query.page)
   return Number.isInteger(value) && value > 0 ? value : 1
}

function syncPageQuery(page: number) {
   if (page === pageFromQuery()) return
   const query = { ...route.query }
   if (page > 1) query.page = String(page)
   else delete query.page
   void router.replace({ query })
}

function load(page = 1) {
   store.filters.kind = props.kind
   store.filters.status = activeStatus.value
   store.filters.categoryId = selectedCategoryId.value
   store.filters.q = searchTerm.value
   syncPageQuery(page)
   return store.fetchList({ page, limit: PAGE_SIZE }).catch((e: any) => toast.error(e.message))
}

onMounted(async () => {
   categoryStore.fetchAll().catch(() => null)
   const pending = load(pageFromQuery())
   firstLoad.value = !store.listFromCache
   await pending
   firstLoad.value = false
})

watch(selectedCategoryId, () => load(1))

function submitSearch() {
   searchTerm.value = query.value.trim()
   void load(1)
}

function clearSearch() {
   // Chỉ gọi lại API khi đang thực sự lọc; xóa chữ gõ dở thì không cần
   const wasFiltering = !!searchTerm.value
   query.value = ''
   searchTerm.value = ''
   if (wasFiltering) void load(1)
   searchInput.value?.focus()
}

function onChangeStatus(s?: ArticleStatus) {
   if (activeStatus.value === s) return
   activeStatus.value = s
   load(1)
}

async function goPage(n: number) {
   if (n < 1 || n > store.totalPages || n === store.page) return
   await load(n)
   await nextTick()
   void scrollToTop()
}

async function onToggleStatus(p: Article) {
   busyId.value = p.id
   const next: ArticleStatus = p.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED'
   try {
      const res = await store.setStatus(p.id, next)
      toast.success(res.message)
      await load(store.page)
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

function formatDate(d: string | null) {
   if (!d) return '—'
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
