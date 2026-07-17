<template>
   <div>
      <div class="flex flex-wrap gap-3 items-center justify-end
       mb-[18px]">
         <button type="button" @click="openCreate"
            class="h-[42px] inline-flex items-center gap-2 px-[18px] bg-primary text-white rounded-[10px] font-semibold text-sm">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Chuyên mục mới
         </button>
      </div>

      <div class="bg-white border border-gray-200 rounded-[14px] overflow-x-auto">
         <div class="grid min-w-[680px] grid-cols-[1fr_220px_110px_90px] gap-4 items-center px-5 py-3.5 bg-gray-100 uppercase tracking-wide text-[11px] font-bold text-gray-500">
            <div>Tên</div><div>Slug</div><div>Số bài</div><div class="text-right">Thao tác</div>
         </div>

         <div v-if="firstLoad" class="p-5 space-y-3">
            <div v-for="i in 5" :key="i" class="h-10 rounded-md bg-gray-100 animate-pulse"></div>
         </div>

         <div v-else-if="!store.items.length" class="px-5 py-14 text-center">
            <p class="text-sm text-gray-500">Chưa có chuyên mục nào.</p>
         </div>

         <div v-else :aria-busy="store.loading" class="transition-opacity duration-150"
            :class="store.loading ? 'opacity-60' : 'opacity-100'">
            <div v-for="c in store.items" :key="c.id"
               class="grid min-w-[680px] grid-cols-[1fr_220px_110px_90px] gap-4 items-center px-5 py-3.5 border-t border-gray-100 hover:bg-gray-50/60 transition-colors">
               <div class="text-sm font-semibold truncate">{{ c.name }}</div>
               <div class="text-[13px] text-gray-500 font-mono truncate">{{ c.slug }}</div>
               <div>
                  <NuxtLink v-if="c.articleCount > 0" :to="`/bai-viet?categoryId=${c.id}`"
                     class="text-[13px] text-primary font-semibold hover:underline">
                     {{ c.articleCount }} bài
                  </NuxtLink>
                  <span v-else class="text-[13px] text-gray-400">0 bài</span>
               </div>
               <div class="flex gap-2 justify-end">
                  <button type="button" title="Sửa chuyên mục" class="text-gray-500 hover:text-primary flex" @click="openEdit(c)">
                     <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4z"/></svg>
                  </button>
                  <button type="button" :disabled="c.articleCount > 0"
                     :title="c.articleCount > 0 ? `Còn ${c.articleCount} bài viết, không xóa được` : 'Xóa'"
                     class="text-gray-500 hover:text-rose-800 disabled:opacity-30 disabled:hover:text-gray-500 disabled:cursor-not-allowed flex"
                     @click="pendingDelete = c">
                     <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                  </button>
               </div>
            </div>
         </div>
      </div>

      <div v-if="editing" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" @click.self="closeForm">
         <div class="bg-white rounded-[14px] p-6 w-full max-w-[420px]">
            <h3 class="text-base font-extrabold">{{ editing.id ? 'Sửa chuyên mục' : 'Chuyên mục mới' }}</h3>

            <label class="block text-[13px] font-semibold mt-4 mb-1.5">Tên chuyên mục</label>
            <input v-model="editing.name" placeholder="VD: Pháp luật" @keyup.enter="submitForm"
               class="w-full h-[42px] border border-gray-200 rounded-[10px] px-3.5 text-sm outline-none focus:border-primary transition-colors" />

            <div class="mt-5 flex justify-end gap-2.5">
               <button type="button" class="h-10 px-4 bg-white border border-gray-200 rounded-[10px] font-semibold text-sm" @click="closeForm">Hủy</button>
               <button type="button" :disabled="saving || !editing.name.trim()"
                  class="h-10 px-4 bg-primary text-white rounded-[10px] font-bold text-sm disabled:opacity-60" @click="submitForm">
                  {{ saving ? 'Đang lưu...' : 'Lưu' }}
               </button>
            </div>
         </div>
      </div>

      <div v-if="pendingDelete" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" @click.self="pendingDelete = null">
         <div class="bg-white rounded-[14px] p-6 w-full max-w-[420px]">
            <h3 class="text-base font-extrabold">Xóa chuyên mục?</h3>
            <p class="mt-2 text-sm text-gray-500 leading-relaxed">
               Chuyên mục <strong class="text-gray-900">“{{ pendingDelete.name }}”</strong> sẽ bị xóa.
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
import { useCategoryStore } from '~/stores/category'
import type { Category } from '~/types'

definePageMeta({ middleware: 'auth' })
useHead({ title: 'Chuyên mục · Quản trị' })

const store = useCategoryStore()
const toast = useToastMessage()

const firstLoad = ref(true)
const saving = ref(false)
const deleting = ref(false)
const pendingDelete = ref<Category | null>(null)
const editing = ref<{ id?: string; name: string; slug?: string } | null>(null)

onMounted(async () => {
   try {
      await store.fetchAll(true)
   } catch (e: any) {
      toast.error(e.message)
   } finally {
      firstLoad.value = false
   }
})

function openCreate() {
   editing.value = { name: '' }
}

function openEdit(c: Category) {
   editing.value = { id: c.id, name: c.name, slug: c.slug }
}

function closeForm() {
   editing.value = null
}

async function submitForm() {
   const e = editing.value
   if (!e || !e.name.trim() || saving.value) return
   saving.value = true
   try {
      const res = e.id
         ? await store.update(e.id, e.name.trim())
         : await store.create(e.name.trim())
      toast.success(res.message)
      editing.value = null
   } catch (err: any) {
      toast.error(err.message)
   } finally {
      saving.value = false
   }
}

async function confirmDelete() {
   const c = pendingDelete.value
   if (!c) return
   deleting.value = true
   try {
      const res = await store.remove(c.id)
      toast.success(res.message)
      pendingDelete.value = null
   } catch (e: any) {
      toast.error(e.message)
   } finally {
      deleting.value = false
   }
}
</script>
