<template>
   <div class="space-y-3">
      <div v-if="!blocks.length"
         class="rounded-[10px] border-[1.5px] border-dashed border-gray-300 p-8 text-center text-sm text-gray-500">
         Chưa có nội dung. Thêm đoạn văn bản hoặc ảnh bên dưới.
      </div>

      <div v-for="(b, i) in blocks" :key="b.key" class="border border-gray-200 rounded-[10px] p-4">
         <div class="mb-3 flex items-center justify-between">
            <div class="flex items-center gap-2">
               <span class="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                  :class="b.type === 'TEXT' ? 'bg-primary/10 text-primary' : 'bg-emerald-50 text-emerald-700'">
                  {{ b.type === 'TEXT' ? 'Văn bản' : 'Hình ảnh' }}
               </span>
               <span class="text-xs text-gray-500">#{{ i + 1 }}</span>
            </div>
            <div class="flex items-center gap-1">
               <button type="button" title="Lên" :disabled="i === 0" @click="move(i, -1)"
                  class="w-7 h-7 flex items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-primary disabled:opacity-30 disabled:hover:bg-transparent">
                  <IconsChevronUp class="size-[15px]" />
               </button>
               <button type="button" title="Xuống" :disabled="i === blocks.length - 1" @click="move(i, 1)"
                  class="w-7 h-7 flex items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-primary disabled:opacity-30 disabled:hover:bg-transparent">
                  <IconsChevronDown class="size-[15px]" />
               </button>
               <button type="button" title="Xóa khối" @click="remove(i)"
                  class="w-7 h-7 flex items-center justify-center rounded-md text-gray-500 hover:bg-rose-50 hover:text-rose-800">
                  <IconsTrash class="size-[15px]" />
               </button>
            </div>
         </div>

         <RichTextEditor v-if="b.type === 'TEXT'" v-model="b.content" placeholder="Nhập nội dung đoạn văn..." />

         <div v-else class="space-y-3">
            <img v-if="b.preview || b.content" :src="b.preview || b.content"
               class="max-h-56 rounded-[10px] border border-gray-200 object-contain">
            <input type="file" accept="image/*"
               class="block w-full text-sm text-gray-500 file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-white file:font-semibold file:cursor-pointer"
               @change="e => onPickImage(i, e)">
            <p v-if="b.content && !b.file" class="text-xs text-gray-500">
               Ảnh hiện tại (giữ nguyên nếu không chọn ảnh mới)
            </p>

            <input v-model="b.caption" type="text" placeholder="Tiêu đề ảnh (không bắt buộc)"
               class="w-full h-[38px] border border-gray-200 rounded-[10px] px-3 text-sm outline-none focus:border-primary transition-colors">
         </div>
      </div>

      <div class="flex gap-2">
         <button type="button" @click="addText"
            class="h-[38px] inline-flex items-center gap-2 px-3.5 bg-white border border-gray-200 rounded-[10px] font-semibold text-[13px] hover:border-primary hover:text-primary transition-colors">
            <IconsText class="size-[15px]" />
            Thêm văn bản
         </button>
         <button type="button" @click="addImage"
            class="h-[38px] inline-flex items-center gap-2 px-3.5 bg-white border border-gray-200 rounded-[10px] font-semibold text-[13px] hover:border-primary hover:text-primary transition-colors">
            <IconsImage class="size-[15px]" />
            Thêm ảnh
         </button>
      </div>
   </div>
</template>

<script setup lang="ts">
import type { EditorBlock } from '~/types'

const blocks = defineModel<EditorBlock[]>({ required: true })

function uid() {
   return Math.random().toString(36).slice(2, 10)
}

function addText() {
   blocks.value.push({ key: uid(), type: 'TEXT', content: '' })
}

function addImage() {
   blocks.value.push({ key: uid(), type: 'IMAGE', content: '', caption: '', file: null })
}

function remove(i: number) {
   const b = blocks.value[i]
   if (b?.preview) URL.revokeObjectURL(b.preview)
   blocks.value.splice(i, 1)
}

function move(i: number, dir: -1 | 1) {
   const j = i + dir
   if (j < 0 || j >= blocks.value.length) return
   const arr = blocks.value
      ;[arr[i], arr[j]] = [arr[j]!, arr[i]!]
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
