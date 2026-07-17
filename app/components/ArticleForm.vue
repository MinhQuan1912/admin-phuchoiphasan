<template>
   <div class="grid lg:grid-cols-[1fr_320px] gap-[18px] items-start">
      <div class="bg-white border border-gray-200 rounded-[14px] p-6">
         <label class="block text-[13px] font-semibold mb-1.5">Tiêu đề bài viết</label>
         <input v-model="title" placeholder="Nhập tiêu đề..."
            class="w-full h-12 border border-gray-200 rounded-[10px] px-3.5 text-base font-semibold outline-none focus:border-primary transition-colors mb-[18px]" />

         <label class="block text-[13px] font-semibold mb-1.5">
            Đường dẫn
         </label>
         <div class="flex items-center gap-2 mb-1.5">
            <span class="text-[13px] text-gray-400 shrink-0 font-mono">/tin-tuc/</span>
            <input v-model="slug" placeholder="tu-sinh-tu-tieu-de" @input="slugTouched = true"
               class="flex-1 h-[42px] border border-gray-200 rounded-[10px] px-3.5 text-sm font-mono outline-none focus:border-primary transition-colors" />
            <button v-if="slugTouched || isEdit" type="button" title="Hoàn tác" @click="regenerateSlug"
               class="h-[42px] px-3 shrink-0 border border-gray-200 rounded-[10px] text-gray-500 hover:border-primary hover:text-primary transition-colors">
               <IconsRefresh class="size-[15px]" />
            </button>
         </div>
         <label class="block text-[13px] font-semibold mb-1.5">Mô tả ngắn</label>
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
                  class="w-full aspect-video rounded-[10px] border border-gray-200 object-contain">
               <div v-else
                  class="aspect-video border-[1.5px] border-dashed border-gray-300 rounded-[10px] flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-primary hover:text-primary transition-colors">
                  <IconsImage class="size-[26px]" stroke-width="1.8" />
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
                  <IconsChevronDown class="size-3" />
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
                  <component :is="s.icon" class="size-[14px]" />
                  {{ s.label }}
               </button>
            </div>
            <p class="mt-2 mb-4 text-[11px] text-gray-500">
               {{ status === 'PUBLISHED' ? 'Bài viết hiển thị trên website.' : 'Bản nháp chỉ mình bạn thấy.' }}
            </p>

            <button type="button" title="Mở bản xem thử ở tab mới" @click="onPreview"
               class="w-full h-11 mb-2.5 inline-flex items-center justify-center gap-2 bg-white border border-gray-200 rounded-[10px] font-semibold text-sm hover:border-primary hover:text-primary transition-colors">
               <IconsEye class="size-4" />
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
import type { Component } from 'vue'
import { IconsCheck, IconsEdit } from '#components'
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

const statusOptions: { value: ArticleStatus; label: string; icon: Component }[] = [
   { value: 'DRAFT', label: 'Bản nháp', icon: IconsEdit },
   { value: 'PUBLISHED', label: 'Đăng', icon: IconsCheck },
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
