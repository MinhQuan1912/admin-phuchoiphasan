<template>
   <div class="grid lg:grid-cols-[1fr_320px] gap-[18px] items-start">
      <div class="bg-white border border-gray-200 rounded-[14px] p-6">
         <label class="block text-[13px] font-semibold mb-1.5">Tiêu đề bài viết</label>
         <input v-model="title" placeholder="Nhập tiêu đề..."
            class="w-full h-12 border border-gray-200 rounded-[10px] px-3.5 text-base font-semibold outline-none focus:border-primary transition-colors mb-[18px]" />

         <label class="block text-[13px] font-semibold mb-1.5">
            Đường dẫn (slug)
         </label>
         <div class="flex items-center gap-2 mb-1.5">
            <span class="text-[13px] text-gray-400 shrink-0 font-mono">/tin-tuc/</span>
            <input v-model="slug" placeholder="tu-sinh-tu-tieu-de" @input="slugTouched = true"
               class="flex-1 h-[42px] border border-gray-200 rounded-[10px] px-3.5 text-sm font-mono outline-none focus:border-primary transition-colors" />
            <button v-if="slugTouched || isEdit" type="button" title="Sinh lại từ tiêu đề" @click="regenerateSlug"
               class="h-[42px] px-3 shrink-0 border border-gray-200 rounded-[10px] text-gray-500 hover:border-primary hover:text-primary transition-colors">
               <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
            </button>
         </div>
         <label class="block text-[13px] font-semibold mb-1.5">Mô tả ngắn (sapo)</label>
         <textarea v-model="description" placeholder="Tóm tắt nội dung hiển thị ở danh sách..."
            class="w-full h-[76px] border border-gray-200 rounded-[10px] p-3 text-sm leading-relaxed outline-none focus:border-primary transition-colors resize-y mb-[18px]"></textarea>

         <div class="flex items-center justify-between mb-1.5">
            <label class="block text-[13px] font-semibold">Nội dung</label>
            <span class="text-[11px] font-semibold text-gray-500">{{ blocks.length }} khối</span>
         </div>
         <ArticleBlockEditor v-model="blocks" />
      </div>

      <div class="flex flex-col gap-[18px]">
         <div class="bg-white border border-gray-200 rounded-[14px] p-5">
            <h3 class="text-[15px] font-extrabold mb-3">Ảnh đại diện</h3>
            <label class="block cursor-pointer">
               <img v-if="displayThumbnail" :src="displayThumbnail"
                  class="w-full aspect-video rounded-[10px] border border-gray-200 object-cover">
               <div v-else
                  class="aspect-video border-[1.5px] border-dashed border-gray-300 rounded-[10px] flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-primary hover:text-primary transition-colors">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                  <span class="text-[13px] font-semibold">Tải ảnh lên</span>
                  <span class="text-[11px]">PNG, JPG</span>
               </div>
               <input type="file" accept="image/*" class="hidden" @change="onPickThumbnail">
            </label>
            <p v-if="displayThumbnail" class="mt-2 text-[11px] text-gray-500">
               {{ isEdit && !thumbnailFile ? 'Ảnh hiện tại — bấm vào ảnh để đổi.' : 'Bấm vào ảnh để chọn ảnh khác.' }}
            </p>
         </div>

         <div class="bg-white border border-gray-200 rounded-[14px] p-5">
            <h3 class="text-[15px] font-extrabold mb-3.5">Phân loại</h3>
            <label class="block text-[13px] font-semibold mb-1.5">Chuyên mục</label>
            <div class="relative">
               <select v-model="categoryId" :disabled="!categories.length"
                  class="w-full h-[42px] border border-gray-200 rounded-[10px] pl-3 pr-9 text-sm appearance-none outline-none cursor-pointer bg-white focus:border-primary transition-colors disabled:opacity-60">
                  <option value="" disabled>{{ categories.length ? 'Chọn chuyên mục' : 'Đang tải...' }}</option>
                  <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
               </select>
               <span class="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none flex">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
               </span>
            </div>
         </div>

         <div class="bg-white border border-gray-200 rounded-[14px] p-5">
            <h3 class="text-[15px] font-extrabold mb-3.5">Đăng</h3>
            <label class="block text-[13px] font-semibold mb-1.5">Trạng thái</label>
            <div class="grid grid-cols-2 gap-1 p-1 bg-gray-100 rounded-[10px]">
               <button v-for="s in statusOptions" :key="s.value" type="button" @click="status = s.value"
                  class="h-[34px] inline-flex items-center justify-center gap-1.5 rounded-[7px] text-[13px] font-semibold transition-colors"
                  :class="status === s.value ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-900'">
                  <span class="flex" v-html="s.icon"></span>
                  {{ s.label }}
               </button>
            </div>
            <p class="mt-2 mb-4 text-[11px] text-gray-500">
               {{ status === 'PUBLISHED' ? 'Bài viết hiển thị trên website.' : 'Bản nháp chỉ mình bạn thấy.' }}
            </p>

            <button type="button" title="Mở bản xem thử ở tab mới" @click="onPreview"
               class="w-full h-11 mb-2.5 inline-flex items-center justify-center gap-2 bg-white border border-gray-200 rounded-[10px] font-semibold text-sm hover:border-primary hover:text-primary transition-colors">
               <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1.5 12S5 5 12 5s10.5 7 10.5 7-3.5 7-10.5 7S1.5 12 1.5 12z"/><circle cx="12" cy="12" r="3"/></svg>
               Xem thử
            </button>
            <div class="flex gap-2.5">
               <button type="button" :disabled="loading" class="flex-1 h-11 bg-primary text-white rounded-[10px] font-bold text-sm disabled:opacity-60" @click="onSubmit">
                  {{ loading ? 'Đang lưu...' : (isEdit ? 'Lưu thay đổi' : 'Tạo bài viết') }}
               </button>
               <NuxtLink to="/bai-viet" class="h-11 px-4 inline-flex items-center bg-white border border-gray-200 rounded-[10px] font-semibold text-sm">
                  Hủy
               </NuxtLink>
            </div>
         </div>
      </div>
   </div>
</template>

<script setup lang="ts">
import { useArticleForm } from '~/composables/useArticleForm'
import { useArticlePreview } from '~/composables/useArticlePreview'
import { useToastMessage } from '~/composables/useToastMessage'
import { useCategoryStore } from '~/stores/category'
import type { ArticleStatus, EditorBlock } from '~/types'

const props = defineProps<{
   isEdit?: boolean
   loading?: boolean
   initialTitle?: string
   initialSlug?: string
   initialDescription?: string
   initialThumbnailUrl?: string
   initialCategoryId?: string
   initialStatus?: ArticleStatus
   initialBlocks?: EditorBlock[]
}>()

const emit = defineEmits<{
   submit: [payload: {
      title: string
      slug: string
      description: string
      categoryId: string
      status: ArticleStatus
      thumbnailFile: File | null
      blocks: EditorBlock[]
   }]
}>()

const toast = useToastMessage()
const categoryStore = useCategoryStore()
const { validateArticle } = useArticleForm()
const { openPreview } = useArticlePreview()

const title = ref(props.initialTitle ?? '')
const slug = ref(props.initialSlug ?? '')
const description = ref(props.initialDescription ?? '')
const categoryId = ref(props.initialCategoryId ?? '')
const status = ref<ArticleStatus>(props.initialStatus ?? 'DRAFT')
const thumbnailFile = ref<File | null>(null)
const thumbnailPreview = ref<string>('')
const blocks = ref<EditorBlock[]>(props.initialBlocks ? [...props.initialBlocks] : [])

const slugTouched = ref(!!props.initialSlug)

const categories = computed(() => categoryStore.items)
const selectedCategory = computed(() => categories.value.find(c => c.id === categoryId.value))

const statusOptions: { value: ArticleStatus; label: string; icon: string }[] = [
   { value: 'DRAFT', label: 'Bản nháp', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4z"/></svg>' },
   { value: 'PUBLISHED', label: 'Đăng', icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>' },
]

watch(() => props.initialTitle, v => v !== undefined && (title.value = v))
watch(() => props.initialSlug, v => {
   if (v === undefined) return
   slug.value = v
   slugTouched.value = !!v
})
watch(() => props.initialDescription, v => v !== undefined && (description.value = v))
watch(() => props.initialCategoryId, v => v !== undefined && (categoryId.value = v))
watch(() => props.initialStatus, v => v !== undefined && (status.value = v))
watch(() => props.initialBlocks, v => v && (blocks.value = [...v]))

watch(title, (v) => {
   if (!slugTouched.value) slug.value = slugify(v)
})

function regenerateSlug() {
   slug.value = slugify(title.value)
   slugTouched.value = !!props.isEdit
}

const displayThumbnail = computed(() => thumbnailPreview.value || props.initialThumbnailUrl || '')

onMounted(async () => {
   try {
      await categoryStore.fetchAll()
      if (!categoryId.value && categories.value.length) {
         categoryId.value = categories.value[0]!.id
      }
   } catch (e: any) {
      toast.error(e.message)
   }
})

function onPickThumbnail(e: Event) {
   const input = e.target as HTMLInputElement
   const file = input.files?.[0]
   if (!file) return
   if (thumbnailPreview.value) URL.revokeObjectURL(thumbnailPreview.value)
   thumbnailFile.value = file
   thumbnailPreview.value = URL.createObjectURL(file)
}

function onPreview() {
   openPreview({
      title: title.value,
      description: description.value,
      thumbnail: displayThumbnail.value,
      categoryName: selectedCategory.value?.name,
      blocks: blocks.value,
   })
}

function onSubmit() {
   const error = validateArticle({
      title: title.value,
      description: description.value,
      categoryId: categoryId.value,
      thumbnailFile: thumbnailFile.value,
      thumbnailUrl: props.initialThumbnailUrl,
      blocks: blocks.value,
   }, props.isEdit)

   if (error) {
      toast.error(error)
      return
   }

   emit('submit', {
      title: title.value,
      slug: slug.value.trim(),
      description: description.value,
      categoryId: categoryId.value,
      status: status.value,
      thumbnailFile: thumbnailFile.value,
      blocks: blocks.value,
   })
}

onBeforeUnmount(() => {
   if (thumbnailPreview.value) URL.revokeObjectURL(thumbnailPreview.value)
})
</script>
