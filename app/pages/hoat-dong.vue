<template>
   <div>
      <div class="bg-white border border-gray-200 rounded-[14px] p-5 mb-4.5">
         <div class="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
            <div>
               <label class="block text-[13px] font-semibold mb-1.5">Từ ngày</label>
               <input v-model="filters.from" type="date" :max="filters.to || undefined"
                  class="w-full h-9.5 border border-gray-200 rounded-[10px] px-3 text-sm outline-none focus:border-primary transition-colors">
            </div>
            <div>
               <label class="block text-[13px] font-semibold mb-1.5">Đến ngày</label>
               <input v-model="filters.to" type="date" :min="filters.from || undefined"
                  class="w-full h-9.5 border border-gray-200 rounded-[10px] px-3 text-sm outline-none focus:border-primary transition-colors">
            </div>
            <div>
               <label class="block text-[13px] font-semibold mb-1.5">Loại nội dung</label>
               <select v-model="filters.kind"
                  class="w-full h-9.5 border border-gray-200 rounded-[10px] px-2.5 text-sm outline-none focus:border-primary transition-colors">
                  <option value="">Tất cả</option>
                  <option v-for="(label, k) in KIND_LABEL" :key="k" :value="k">{{ label }}</option>
               </select>
            </div>
            <div>
               <label class="block text-[13px] font-semibold mb-1.5">Người thao tác</label>
               <USelect v-model="filters.adminId" :items="actorItems" placeholder="Tất cả" variant="outline"
                  class="w-full" :ui="{ base: 'w-full h-9.5 rounded-[10px]' }" />
            </div>
         </div>

         <div v-if="hasFilter" class="mt-3.5">
            <button type="button" @click="clearFilters"
               class="h-9 px-3.5 bg-white border border-gray-200 rounded-[10px] font-semibold text-[13px] hover:bg-gray-200 transition-colors">
               Xóa bộ lọc
            </button>
         </div>
      </div>

      <div class="bg-white border border-gray-200 rounded-[14px] p-5">
         <div v-if="loading" class="py-1">
            <div v-for="i in 8" :key="i" class="h-14 border-t border-gray-100 first:border-t-0 flex items-center">
               <div class="h-10 w-full rounded-md" :class="showSkeleton ? 'bg-gray-100 animate-pulse' : ''"></div>
            </div>
         </div>

         <p v-else-if="!items.length" class="py-10 text-center text-sm text-gray-500">
            {{ hasFilter ? 'Không có hoạt động nào khớp bộ lọc.' : 'Chưa có hoạt động nào được ghi nhận.' }}
         </p>

         <template v-else>
            <div v-for="a in items" :key="a.id"
               class="flex items-center gap-3.5 py-3.5 border-t border-gray-100 first:border-t-0">
               <span
                  class="w-9 h-9 shrink-0 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[13px]">
                  {{ a.adminName.slice(0, 2).toUpperCase() }}
               </span>
               <div class="flex-1 min-w-0">
                  <div class="text-sm leading-snug truncate">
                     <span class="font-semibold">{{ a.adminName }}</span>
                     {{ ' ' }}{{ ACTIVITY_ACTION_LABEL[a.action] }}
                     {{ ACTIVITY_TARGET_LABEL[a.targetType] }}
                     <span class="font-semibold">"{{ a.targetTitle }}"</span>
                  </div>
                  <div class="text-xs text-gray-500 mt-0.5">
                     {{ formatDateTime(a.createdAt) }}
                     <template v-if="a.targetKind"> · {{ KIND_LABEL[a.targetKind] }}</template>
                  </div>
               </div>
               <span class="text-[13px] font-bold uppercase tracking-wide px-3 py-1.5 rounded-full whitespace-nowrap"
                  :class="ACTIVITY_ACTION_STYLE[a.action]">
                  {{ ACTIVITY_ACTION_LABEL[a.action] }}
               </span>
            </div>

            <div v-if="totalPages > 1" class="mt-5 flex items-center justify-between gap-3">
               <span class="text-[13px] text-gray-500">
                  Trang {{ page }}/{{ totalPages }} · {{ formatNumber(total) }} hoạt động
               </span>
               <div class="flex gap-2">
                  <button type="button" :disabled="page <= 1" @click="go(page - 1)"
                     class="h-9 px-3.5 bg-white border border-gray-200 rounded-[10px] font-semibold text-[13px] hover:bg-gray-200 disabled:opacity-50 disabled:hover:bg-white transition-colors">
                     Trước
                  </button>
                  <button type="button" :disabled="page >= totalPages" @click="go(page + 1)"
                     class="h-9 px-3.5 bg-white border border-gray-200 rounded-[10px] font-semibold text-[13px] hover:bg-gray-200 disabled:opacity-50 disabled:hover:bg-white transition-colors">
                     Sau
                  </button>
               </div>
            </div>
         </template>
      </div>
   </div>
</template>

<script setup lang="ts">
import { useToastMessage } from '~/composables/useToastMessage'
import { useActivityStore } from '~/stores/activity'
import {
   ACTIVITY_ACTION_LABEL,
   ACTIVITY_ACTION_STYLE,
   ACTIVITY_TARGET_LABEL,
   KIND_LABEL,
   type ActivityListFilters,
   type CategoryKind,
} from '~/types'

definePageMeta({ middleware: 'auth' })
useHead({ title: 'Hoạt động · Quản trị' })

const LIMIT = 20

const store = useActivityStore()
const toast = useToastMessage()
const loading = ref(true)
const showSkeleton = useDelayedFlag(loading)

const filters = reactive({
   from: '',
   to: '',
   kind: '' as CategoryKind | '',
   adminId: undefined as string | undefined,
})
const page = ref(1)

const actorItems = computed(() => [
   { label: 'Tất cả', value: undefined as string | undefined },
   ...store.actors
      .filter(a => !!a.id)
      .map(a => ({ label: a.name, value: a.id as string | undefined })),
])

const items = computed(() => store.list?.items ?? [])
const total = computed(() => store.list?.total ?? 0)
const totalPages = computed(() => store.list?.totalPages ?? 1)
const hasFilter = computed(() => !!(filters.from || filters.to || filters.kind || filters.adminId))

function buildQuery(): ActivityListFilters {
   return {
      page: page.value,
      limit: LIMIT,
      ...(filters.from ? { from: filters.from } : {}),
      ...(filters.to ? { to: filters.to } : {}),
      ...(filters.kind ? { kind: filters.kind } : {}),
      ...(filters.adminId ? { adminId: filters.adminId } : {}),
   }
}

async function load() {
   loading.value = true
   try {
      await store.fetchList(buildQuery())
   } catch (e: any) {
      toast.error(e.message)
   } finally {
      loading.value = false
   }
}

function go(next: number) {
   page.value = next
   scrollTo({ top: 0, behavior: 'smooth' })
   load()
}

function clearFilters() {
   filters.from = ''
   filters.to = ''
   filters.kind = ''
   filters.adminId = undefined
}

watch(filters, () => {
   page.value = 1
   load()
})

onMounted(async () => {
   await Promise.all([
      load(),
      store.fetchActors().catch((e: any) => toast.error(e.message)),
   ])
})

function formatDateTime(d: string) {
   return new Date(d).toLocaleString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
   })
}
</script>
