<template>
   <div>
      <div class="flex flex-wrap gap-3 items-center justify-end
       mb-4.5">
         <button type="button" @click="openCreate"
            class="h-10.5 inline-flex items-center gap-2 px-4.5 bg-primary text-white rounded-[10px] font-semibold text-sm hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0 transition-all">
            <IconsPlus class="size-4" />
            Chuyên mục mới
         </button>
      </div>

      <div class="bg-white border border-gray-200 rounded-[14px] overflow-x-auto">
         <div class="grid min-w-115 grid-cols-[1fr_120px_90px] gap-4 items-center px-5 py-3.5 bg-gray-100 uppercase tracking-wide text-[11px] font-bold text-gray-500">
            <div>Tên</div><div>Số bài</div><div class="text-right">Thao tác</div>
         </div>

         <div v-if="firstLoad" class="p-5 space-y-3">
            <div v-for="i in 5" :key="i" class="h-10 rounded-md bg-gray-100 animate-pulse"></div>
         </div>

         <div v-else-if="!newsCategories.length" class="px-5 py-14 text-center">
            <p class="text-sm text-gray-500">Chưa có chuyên mục nào.</p>
         </div>

         <div v-else :aria-busy="store.loading" class="transition-opacity duration-150"
            :class="store.loading ? 'opacity-60' : 'opacity-100'">
            <div v-for="c in newsCategories" :key="c.id"
               class="grid min-w-115 grid-cols-[1fr_120px_90px] gap-4 items-center px-5 py-3.5 border-t border-gray-100 hover:bg-gray-50/60 transition-colors">
               <div class="text-sm font-semibold truncate">{{ c.name }}</div>
               <div>
                  <NuxtLink v-if="c.articleCount > 0" :to="`/tin-tuc?categoryId=${c.id}`"
                     class="text-[13px] text-primary font-semibold hover:underline">
                     {{ c.articleCount }} bài
                  </NuxtLink>
                  <span v-else class="text-[13px] text-gray-400">0 bài</span>
               </div>
               <div class="flex gap-2 justify-end">
                  <button type="button" title="Sửa chuyên mục" class="text-gray-500 hover:text-primary flex" @click="openEdit(c)">
                     <IconsEdit class="size-4.25" />
                  </button>
                  <button type="button" :disabled="c.articleCount > 0"
                     :title="c.articleCount > 0 ? `Còn ${c.articleCount} bài viết, không xóa được` : 'Xóa'"
                     class="text-gray-500 hover:text-rose-800 disabled:opacity-30 disabled:hover:text-gray-500 disabled:cursor-not-allowed flex"
                     @click="pendingDelete = c">
                     <IconsTrash class="size-4.25" />
                  </button>
               </div>
            </div>
         </div>
      </div>

      <div v-if="editing" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" @click.self="closeForm">
         <div class="bg-white rounded-[14px] p-6 w-full max-w-105">
            <h3 class="text-base font-extrabold">{{ editing.id ? 'Sửa chuyên mục' : 'Chuyên mục mới' }}</h3>

            <label class="block text-[13px] font-semibold mt-4 mb-1.5">Tên chuyên mục</label>
            <input v-model="editing.name" placeholder="VD: Pháp luật" @keyup.enter="submitForm"
               class="w-full h-10.5 border border-gray-200 rounded-[10px] px-3.5 text-sm outline-none focus:border-primary transition-colors" />

            <label class="mt-3.5 mb-1.5 flex items-center gap-2 text-[13px] font-semibold">
               Tên tiếng Anh
               <span class="px-1.5 py-0.5 rounded bg-gray-100 text-[10px] font-bold text-gray-500">EN</span>
            </label>
            <input v-model="editing.nameEn" placeholder="Bỏ trống thì website tiếng Anh dùng tên tiếng Việt"
               @keyup.enter="submitForm"
               class="w-full h-10.5 border border-gray-200 rounded-[10px] px-3.5 text-sm outline-none focus:border-primary transition-colors" />

            <div class="mt-5 flex justify-end gap-2.5">
               <button type="button" class="h-10 px-4 bg-white border border-gray-200 rounded-[10px] font-semibold text-sm hover:bg-gray-200 transition-colors" @click="closeForm">Hủy</button>
               <button type="button" :disabled="saving || !editing.name.trim()"
                  class="h-10 px-4 bg-primary text-white rounded-[10px] font-bold text-sm hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:shadow-none disabled:translate-y-0 disabled:hover:bg-primary transition-all" @click="submitForm">
                  {{ saving ? 'Đang lưu...' : 'Lưu' }}
               </button>
            </div>
         </div>
      </div>

      <div v-if="pendingDelete" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" @click.self="pendingDelete = null">
         <div class="bg-white rounded-[14px] p-6 w-full max-w-105">
            <h3 class="text-base font-extrabold">Xóa chuyên mục?</h3>
            <p class="mt-2 text-sm text-gray-500 leading-relaxed">
               Chuyên mục <strong class="text-gray-900">“{{ pendingDelete.name }}”</strong> sẽ bị xóa.
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
import { useCategoryStore } from '~/stores/category'
import type { Category } from '~/types'

definePageMeta({ middleware: 'auth' })
useHead({ title: 'Chuyên mục · Quản trị' })

const store = useCategoryStore()
const toast = useToastMessage()

const newsCategories = computed(() => store.items.filter(c => c.kind === 'NEWS'))

const firstLoad = ref(true)
const saving = ref(false)
const deleting = ref(false)
const pendingDelete = ref<Category | null>(null)
const editing = ref<{ id?: string; name: string; nameEn: string; slug?: string } | null>(null)

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
   editing.value = { name: '', nameEn: '' }
}

function openEdit(c: Category) {
   editing.value = { id: c.id, name: c.name, nameEn: c.nameEn ?? '', slug: c.slug }
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
         ? await store.update(e.id, e.name.trim(), e.nameEn.trim())
         : await store.create(e.name.trim(), e.nameEn.trim())
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
