<template>
   <div class="space-y-3">
      <div v-if="!blocks.length"
         class="rounded-[10px] border-[1.5px] border-dashed border-gray-300 p-8 text-center text-sm text-gray-500">
         Chưa có nội dung. Thêm đoạn văn bản hoặc ảnh bên dưới.
      </div>

      <div v-for="(b, i) in blocks" :key="b.key" :draggable="dragEnabled && isVi"
         @dragstart="onDragStart(i, $event)" @dragover.prevent="onDragOver(i)" @drop="onDrop(i)"
         @dragend="onDragEnd"
         class="relative border border-gray-200 rounded-[10px] p-4 bg-white transition-all"
         :class="dragIndex === i ? 'opacity-40' : ''">
         <div v-if="overIndex === i && dragIndex !== null && dragIndex !== i"
            class="absolute left-0 right-0 h-0.5 bg-primary rounded-full pointer-events-none"
            :class="dragIndex > i ? '-top-1' : '-bottom-1'"></div>
         <div class="flex items-center justify-between" :class="collapsed[b.key] ? '' : 'mb-3'">
            <div class="flex items-center gap-2 min-w-0 flex-1">
               <span v-if="isVi" title="Giữ và kéo để đổi vị trí" @mousedown="dragEnabled = true"
                  @mouseup="dragEnabled = false" @mouseleave="dragEnabled = false"
                  class="shrink-0 w-7 h-7 flex items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 cursor-grab active:cursor-grabbing select-none">
                  <svg viewBox="0 0 20 20" fill="currentColor" class="size-3.75">
                     <circle cx="7" cy="5" r="1.6" /><circle cx="13" cy="5" r="1.6" />
                     <circle cx="7" cy="10" r="1.6" /><circle cx="13" cy="10" r="1.6" />
                     <circle cx="7" cy="15" r="1.6" /><circle cx="13" cy="15" r="1.6" />
                  </svg>
               </span>
               <span class="shrink-0 text-[11px] font-semibold px-2.5 py-1 rounded-full"
                  :class="BLOCK_CHIP[b.type]">
                  {{ BLOCK_LABEL[b.type] }}
               </span>
               <span class="shrink-0 text-xs text-gray-500">#{{ i + 1 }}</span>
            </div>
            <div class="shrink-0 flex items-center gap-1">
               <button type="button" :title="collapsed[b.key] ? 'Mở rộng' : 'Thu gọn'" @click="toggleCollapse(b.key)"
                  class="w-7 h-7 flex items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-primary cursor-pointer">
                  <IconsChevronDown class="size-3.75 transition-transform" :class="collapsed[b.key] ? '-rotate-90' : ''" />
               </button>
               <button v-if="isVi" type="button" title="Xóa khối" @click="remove(i)"
                  class="w-7 h-7 flex items-center justify-center rounded-md text-gray-500 hover:bg-rose-50 hover:text-rose-800 cursor-pointer">
                  <IconsTrash class="size-3.75" />
               </button>
            </div>
         </div>

         <p v-if="collapsed[b.key] && preview(b)" class="mt-2 truncate text-xs text-gray-400">
            {{ preview(b) }}
         </p>

         <div v-show="!collapsed[b.key]">
            <template v-if="b.type === 'TEXT'">
               <RichTextEditor v-if="isVi" v-model="b.content" placeholder="Nhập nội dung đoạn văn..." />
               <RichTextEditor v-else :model-value="b.contentEn ?? ''" @update:model-value="v => b.contentEn = v"
                  placeholder="Nhập nội dung tiếng Anh cho khối này..." />
            </template>

            <div v-else-if="b.type === 'FILE'" class="space-y-3">
               <div v-if="b.file || b.content"
                  class="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-[10px]">
                  <span
                     class="shrink-0 w-9 h-9 rounded-[9px] bg-primary/10 text-primary flex items-center justify-center">
                     <IconsFile class="size-4.5" />
                  </span>
                  <div class="min-w-0">
                     <div class="text-sm font-semibold truncate">{{ fileName(b) }}</div>
                     <div class="text-[11px] text-gray-500">
                        {{ b.file ? `PDF · ${formatBytes(b.file.size)}` : 'Tệp hiện tại (giữ nguyên nếu không chọn tệp mới)' }}
                     </div>
                  </div>
               </div>

               <input v-if="isVi" type="file" :accept="FILE_ACCEPT"
                  class="block w-full text-sm text-gray-500 file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-white file:font-semibold file:cursor-pointer"
                  @change="e => onPickFile(i, e)">

               <input v-if="isVi" v-model="b.caption" type="text"
                  placeholder="Tên hiển thị (bỏ trống thì lấy tên tệp)"
                  class="w-full h-9.5 border border-gray-200 rounded-[10px] px-3 text-sm outline-none focus:border-primary transition-colors">
               <input v-else v-model="b.captionEn" type="text" placeholder="Tên hiển thị tiếng Anh"
                  class="w-full h-9.5 border border-gray-200 rounded-[10px] px-3 text-sm outline-none focus:border-primary transition-colors">
            </div>

            <div v-else class="space-y-3">
               <img v-if="b.preview || b.content" :src="b.preview || b.content"
                  class="max-w-full max-h-56 rounded-[10px] border border-gray-200 object-contain">
               <input v-if="isVi" type="file" accept="image/*"
                  class="block w-full text-sm text-gray-500 file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-white file:font-semibold file:cursor-pointer"
                  @change="e => onPickImage(i, e)">
               <p v-if="isVi && b.content && !b.file" class="text-xs text-gray-500">
                  Ảnh hiện tại (giữ nguyên nếu không chọn ảnh mới)
               </p>

               <input v-if="isVi" v-model="b.caption" type="text" placeholder="Tiêu đề ảnh (không bắt buộc)"
                  class="w-full h-9.5 border border-gray-200 rounded-[10px] px-3 text-sm outline-none focus:border-primary transition-colors">
               <input v-else v-model="b.captionEn" type="text" placeholder="Tiêu đề ảnh tiếng Anh"
                  class="w-full h-9.5 border border-gray-200 rounded-[10px] px-3 text-sm outline-none focus:border-primary transition-colors">
            </div>
         </div>
      </div>

      <!-- Bố cục khối dùng chung hai ngôn ngữ: chỉ thêm/xóa/sắp xếp ở bản tiếng Việt -->
      <p v-if="!isVi" class="text-[12px] text-gray-500">
         Đang sửa bản tiếng Anh — dịch nội dung các khối sẵn có. Muốn thêm, xóa hay đổi thứ tự khối
         thì chuyển về bản tiếng Việt.
      </p>

      <div v-else class="flex gap-2">
         <button type="button" @click="addText"
            class="h-9.5 inline-flex items-center gap-2 px-3.5 bg-white border border-gray-200 rounded-[10px] font-semibold text-[13px] hover:bg-gray-200 transition-colors">
            <IconsText class="size-3.75" />
            Thêm văn bản
         </button>
         <button type="button" @click="addImage"
            class="h-9.5 inline-flex items-center gap-2 px-3.5 bg-white border border-gray-200 rounded-[10px] font-semibold text-[13px] hover:bg-gray-200 transition-colors">
            <IconsImage class="size-3.75" />
            Thêm ảnh
         </button>
         <button type="button" @click="addFile"
            class="h-9.5 inline-flex items-center gap-2 px-3.5 bg-white border border-gray-200 rounded-[10px] font-semibold text-[13px] hover:bg-gray-200 transition-colors">
            <IconsFile class="size-3.75" />
            Thêm tệp PDF
         </button>
      </div>
   </div>
</template>

<script setup lang="ts">
import { FILE_ACCEPT, MAX_FILE_BYTES, type EditorBlock } from '~/types'
import { useToastMessage } from '~/composables/useToastMessage'

const toast = useToastMessage()

const BLOCK_LABEL = { TEXT: 'Văn bản', IMAGE: 'Hình ảnh', FILE: 'Tệp PDF' } as const
const BLOCK_CHIP = {
   TEXT: 'bg-primary/10 text-primary',
   IMAGE: 'bg-emerald-50 text-emerald-700',
   FILE: 'bg-amber-50 text-amber-700',
} as const

const props = withDefaults(defineProps<{ lang?: 'vi' | 'en' }>(), { lang: 'vi' })

const blocks = defineModel<EditorBlock[]>({ required: true })

const isVi = computed(() => props.lang === 'vi')

const collapsed = reactive<Record<string, boolean>>({})
const dragEnabled = ref(false)
const dragIndex = ref<number | null>(null)
const overIndex = ref<number | null>(null)

function uid() {
   return Math.random().toString(36).slice(2, 10)
}

function toggleCollapse(key: string) {
   collapsed[key] = !collapsed[key]
}

function preview(b: EditorBlock) {
   if (b.type === 'IMAGE') return (isVi.value ? b.caption : b.captionEn)?.trim() || ''
   if (b.type === 'FILE') return isVi.value ? fileName(b) : (b.captionEn?.trim() || fileName(b))
   const html = isVi.value ? b.content : b.contentEn
   return (html || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

function onDragStart(i: number, e: DragEvent) {
   dragIndex.value = i
   if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move'
      e.dataTransfer.setData('text/plain', String(i))
   }
}

function onDragOver(i: number) {
   overIndex.value = i
}

function onDrop(target: number) {
   const from = dragIndex.value
   if (from === null || from === target) return
   const arr = blocks.value
   const [item] = arr.splice(from, 1)
   arr.splice(target, 0, item!)
}

function onDragEnd() {
   dragIndex.value = null
   overIndex.value = null
   dragEnabled.value = false
}

function addText() {
   blocks.value.push({ key: uid(), type: 'TEXT', content: '' })
}

function addImage() {
   blocks.value.push({ key: uid(), type: 'IMAGE', content: '', caption: '', file: null })
}

function addFile() {
   blocks.value.push({ key: uid(), type: 'FILE', content: '', caption: '', file: null })
}

function fileName(b: EditorBlock) {
   return b.caption?.trim() || b.file?.name || fileNameFromUrl(b.content) || 'Tệp đính kèm'
}

function fileNameFromUrl(url?: string) {
   if (!url) return ''
   try {
      const last = decodeURIComponent(new URL(url).pathname.split('/').pop() || '')
      return last.replace(/^[0-9a-f-]{36}-/i, '')
   } catch {
      return ''
   }
}

function formatBytes(bytes: number) {
   if (bytes < 1024) return `${bytes} B`
   if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
   return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function onPickFile(i: number, e: Event) {
   const input = e.target as HTMLInputElement
   const file = input.files?.[0]
   if (!file) return

   if (file.type !== FILE_ACCEPT) {
      toast.error('Chỉ nhận tệp PDF')
      input.value = ''
      return
   }
   if (file.size > MAX_FILE_BYTES) {
      toast.error(`Tệp vượt quá ${MAX_FILE_BYTES / 1024 / 1024}MB`)
      input.value = ''
      return
   }

   const b = blocks.value[i]!
   if (b.preview) URL.revokeObjectURL(b.preview)
   b.file = file
   b.content = ''
   b.preview = URL.createObjectURL(file)
}

function remove(i: number) {
   const b = blocks.value[i]
   if (b?.preview) URL.revokeObjectURL(b.preview)
   blocks.value.splice(i, 1)
}

function onPickImage(i: number, e: Event) {
   const input = e.target as HTMLInputElement
   const file = input.files?.[0]
   if (!file) return
   const b = blocks.value[i]!
   if (b.preview) URL.revokeObjectURL(b.preview)
   b.file = file
   b.content = ''
   b.preview = URL.createObjectURL(file)
}

onBeforeUnmount(() => {
   blocks.value.forEach(b => b.preview && URL.revokeObjectURL(b.preview))
})
</script>
