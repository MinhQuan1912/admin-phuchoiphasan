<template>
   <div class="border border-gray-200 rounded-[10px] overflow-hidden transition-colors"
      :class="focused ? 'border-primary' : ''">
      <div v-if="editor" class="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-gray-200 bg-gray-50">
         <button v-for="t in tools" :key="t.title" type="button" :title="t.title" :disabled="t.disabled?.()"
            class="w-7 h-7 flex items-center justify-center rounded-md text-gray-500 hover:bg-gray-200 hover:text-primary disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-500"
            :class="t.active?.() ? 'bg-primary/10 text-primary' : ''"
            @click="t.run">
            <span v-if="t.label" class="text-[13px] leading-none" :class="t.labelClass">{{ t.label }}</span>
            <span v-else class="flex" v-html="t.icon"></span>
         </button>
      </div>

      <div v-if="palette" class="flex flex-wrap items-center gap-1.5 px-2 py-2 border-b border-gray-200 bg-white">
         <template v-if="palette === 'color'">
            <button v-for="c in TEXT_COLORS" :key="c" type="button" :title="c" @click="applyColor(c)"
               class="w-6 h-6 rounded-md border border-gray-200 hover:scale-110 transition-transform"
               :style="{ backgroundColor: c }"></button>
            <label title="Chọn màu tùy ý"
               class="w-6 h-6 shrink-0 rounded-md border border-gray-200 overflow-hidden cursor-pointer relative"
               :style="{ backgroundColor: currentColor || '#000000' }">
               <span class="absolute inset-0 flex items-center justify-center text-white mix-blend-difference text-[13px] font-bold leading-none">+</span>
               <input type="color" :value="currentColor || '#000000'" @input="applyColor(($event.target as HTMLInputElement).value, false)"
                  class="absolute inset-0 opacity-0 cursor-pointer">
            </label>
            <button type="button" title="Bỏ màu chữ" @click="clearColor"
               class="h-6 px-2 rounded-md border border-gray-200 text-[11px] font-semibold text-gray-500 hover:text-primary hover:border-primary">
               Bỏ màu
            </button>
         </template>
         <template v-else>
            <button v-for="c in HIGHLIGHT_COLORS" :key="c" type="button" :title="c" @click="applyHighlight(c)"
               class="w-6 h-6 rounded-md border border-gray-200 hover:scale-110 transition-transform"
               :style="{ backgroundColor: c }"></button>
            <label title="Chọn màu tùy ý"
               class="w-6 h-6 shrink-0 rounded-md border border-gray-200 overflow-hidden cursor-pointer relative"
               :style="{ backgroundColor: currentHighlight || '#fef08a' }">
               <span class="absolute inset-0 flex items-center justify-center text-gray-700 text-[13px] font-bold leading-none">+</span>
               <input type="color" :value="currentHighlight || '#fef08a'" @input="applyHighlight(($event.target as HTMLInputElement).value, false)"
                  class="absolute inset-0 opacity-0 cursor-pointer">
            </label>
            <button type="button" title="Bỏ bôi nền" @click="clearHighlight"
               class="h-6 px-2 rounded-md border border-gray-200 text-[11px] font-semibold text-gray-500 hover:text-primary hover:border-primary">
               Bỏ nền
            </button>
         </template>
      </div>

      <EditorContent :editor="editor" @focusin="focused = true" @focusout="focused = false" />
   </div>

   <div v-if="linkForm" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      @click.self="linkForm = null">
      <div class="bg-white rounded-[14px] p-6 w-full max-w-[420px]">
         <h3 class="text-base font-extrabold">{{ linkForm.editing ? 'Sửa liên kết' : 'Chèn liên kết' }}</h3>

         <label class="block text-[13px] font-semibold mt-4 mb-1.5">Địa chỉ</label>
         <input ref="linkInput" v-model="linkForm.href" placeholder="https://vi.wikipedia.org/..."
            @keyup.enter="submitLink" @keyup.esc="linkForm = null"
            class="w-full h-[42px] border border-gray-200 rounded-[10px] px-3.5 text-sm outline-none focus:border-primary transition-colors" />

         <div class="mt-5 flex justify-end gap-2.5">
            <button type="button" class="h-10 px-4 bg-white border border-gray-200 rounded-[10px] font-semibold text-sm"
               @click="linkForm = null">Hủy</button>
            <button type="button" class="h-10 px-4 bg-primary text-white rounded-[10px] font-bold text-sm"
               @click="submitLink">Lưu</button>
         </div>
      </div>
   </div>
</template>

<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import { Placeholder } from '@tiptap/extensions'
import TextAlign from '@tiptap/extension-text-align'
import Highlight from '@tiptap/extension-highlight'
import Subscript from '@tiptap/extension-subscript'
import Superscript from '@tiptap/extension-superscript'
import { TextStyle, Color } from '@tiptap/extension-text-style'

const props = defineProps<{ placeholder?: string }>()
const model = defineModel<string>({ required: true })

const focused = ref(false)

// Bảng màu preset: người soạn chọn từ danh sách cố định thay vì color picker tự
// do, để bài viết giữ được bộ màu nhất quán với giao diện site.
const TEXT_COLORS = ['#dc2626', '#ea580c', '#ca8a04', '#16a34a', '#2563eb', '#7c3aed']
const HIGHLIGHT_COLORS = ['#fef08a', '#bbf7d0', '#bfdbfe', '#fbcfe8', '#fed7aa']

const editor = useEditor({
   content: model.value,
   extensions: [
      StarterKit.configure({
         link: { openOnClick: false },
      }),
      Placeholder.configure({ placeholder: () => props.placeholder ?? '' }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Highlight.configure({ multicolor: true }),
      Subscript,
      Superscript,
      TextStyle,
      Color,
   ],
   editorProps: {
      attributes: {
         class: 'tiptap-content p-3 text-sm leading-relaxed outline-none min-h-[120px]',
      },
   },
   onUpdate: ({ editor }) => {
      model.value = editor.isEmpty ? '' : editor.getHTML()
   },
})

const icons = {
   bulletList: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/><circle cx="4.5" cy="6" r="1.3" fill="currentColor" stroke="none"/><circle cx="4.5" cy="12" r="1.3" fill="currentColor" stroke="none"/><circle cx="4.5" cy="18" r="1.3" fill="currentColor" stroke="none"/></svg>',
   orderedList: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="10" y1="6" x2="20" y2="6"/><line x1="10" y1="12" x2="20" y2="12"/><line x1="10" y1="18" x2="20" y2="18"/><text x="1.5" y="8.5" font-size="7.5" font-weight="700" fill="currentColor" stroke="none">1</text><text x="1.5" y="14.5" font-size="7.5" font-weight="700" fill="currentColor" stroke="none">2</text><text x="1.5" y="20.5" font-size="7.5" font-weight="700" fill="currentColor" stroke="none">3</text></svg>',
   quote: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 17h3l2-4V7H5v6h3zm9 0h3l2-4V7h-6v6h3z"/></svg>',
   link: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.5 1.5"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7L12 19"/></svg>',
   unlink: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18.8 13.7l1.7-1.7a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M5.2 10.3L3.5 12a5 5 0 0 0 7 7l1.7-1.7"/><line x1="3" y1="3" x2="21" y2="21"/></svg>',
   undo: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 14 4 9 9 4"/><path d="M20 20v-5a6 6 0 0 0-6-6H4"/></svg>',
   redo: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 14 20 9 15 4"/><path d="M4 20v-5a6 6 0 0 1 6-6h10"/></svg>',
   clear: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7V4h16v3"/><path d="M5 20h6"/><path d="M13 4L8 20"/><line x1="15" y1="12" x2="21" y2="18"/><line x1="21" y1="12" x2="15" y2="18"/></svg>',
   alignLeft: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="14" y2="12"/><line x1="3" y1="18" x2="18" y2="18"/></svg>',
   alignCenter: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="6" y1="12" x2="18" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg>',
   alignRight: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="6" y1="18" x2="21" y2="18"/></svg>',
   highlight: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l-4 4v3h3l4-4"/><path d="M14 6l4 4"/><path d="M12 8l4-4a2 2 0 0 1 3 3l-4 4z"/></svg>',
   color: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l4 8H8z"/><path d="M8 11h8l-1.5 5h-5z"/><line x1="7" y1="21" x2="17" y2="21"/></svg>',
   sub: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6l8 10M12 6L4 16"/><path d="M20 20h-4c0-1.5 1-2 2-2.5s2-1 2-2.2A1.3 1.3 0 0 0 17 14"/></svg>',
   sup: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8l8 10M12 8L4 18"/><path d="M20 10h-4c0-1.5 1-2 2-2.5s2-1 2-2.2A1.3 1.3 0 0 0 17 4"/></svg>',
}

interface Tool {
   title: string
   label?: string
   labelClass?: string
   icon?: string
   run: () => void
   active?: () => boolean
   disabled?: () => boolean
}

const tools = computed<Tool[]>(() => {
   const e = editor.value
   if (!e) return []
   return [
      { title: 'In đậm', label: 'B', labelClass: 'font-extrabold', run: () => e.chain().focus().toggleBold().run(), active: () => e.isActive('bold') },
      { title: 'In nghiêng', label: 'I', labelClass: 'italic font-semibold font-serif', run: () => e.chain().focus().toggleItalic().run(), active: () => e.isActive('italic') },
      { title: 'Gạch chân', label: 'U', labelClass: 'underline font-semibold', run: () => e.chain().focus().toggleUnderline().run(), active: () => e.isActive('underline') },
      { title: 'Gạch ngang', label: 'S', labelClass: 'line-through font-semibold', run: () => e.chain().focus().toggleStrike().run(), active: () => e.isActive('strike') },
      { title: 'Tiêu đề lớn', label: 'H2', labelClass: 'font-extrabold text-[11px]', run: () => e.chain().focus().toggleHeading({ level: 2 }).run(), active: () => e.isActive('heading', { level: 2 }) },
      { title: 'Tiêu đề nhỏ', label: 'H3', labelClass: 'font-extrabold text-[11px]', run: () => e.chain().focus().toggleHeading({ level: 3 }).run(), active: () => e.isActive('heading', { level: 3 }) },
      { title: 'Danh sách đầu dòng', icon: icons.bulletList, run: () => e.chain().focus().toggleBulletList().run(), active: () => e.isActive('bulletList') },
      { title: 'Danh sách đánh số', icon: icons.orderedList, run: () => e.chain().focus().toggleOrderedList().run(), active: () => e.isActive('orderedList') },
      { title: 'Trích dẫn', icon: icons.quote, run: () => e.chain().focus().toggleBlockquote().run(), active: () => e.isActive('blockquote') },
      { title: 'Căn trái', icon: icons.alignLeft, run: () => e.chain().focus().setTextAlign('left').run(), active: () => e.isActive({ textAlign: 'left' }) },
      { title: 'Căn giữa', icon: icons.alignCenter, run: () => e.chain().focus().setTextAlign('center').run(), active: () => e.isActive({ textAlign: 'center' }) },
      { title: 'Căn phải', icon: icons.alignRight, run: () => e.chain().focus().setTextAlign('right').run(), active: () => e.isActive({ textAlign: 'right' }) },
      { title: 'Màu chữ', icon: icons.color, run: () => togglePalette('color'), active: () => e.isActive('textStyle') },
      { title: 'Bôi nền', icon: icons.highlight, run: () => togglePalette('highlight'), active: () => e.isActive('highlight') },
      { title: 'Chỉ số dưới', icon: icons.sub, run: () => e.chain().focus().toggleSubscript().run(), active: () => e.isActive('subscript') },
      { title: 'Chỉ số trên', icon: icons.sup, run: () => e.chain().focus().toggleSuperscript().run(), active: () => e.isActive('superscript') },
      { title: 'Chèn link', icon: icons.link, run: openLinkForm, active: () => e.isActive('link') },
      { title: 'Bỏ link', icon: icons.unlink, run: () => e.chain().focus().unsetLink().run(), disabled: () => !e.isActive('link') },
      { title: 'Xóa định dạng', icon: icons.clear, run: () => e.chain().focus().unsetAllMarks().clearNodes().run() },
      { title: 'Hoàn tác', icon: icons.undo, run: () => e.chain().focus().undo().run(), disabled: () => !e.can().undo() },
      { title: 'Làm lại', icon: icons.redo, run: () => e.chain().focus().redo().run(), disabled: () => !e.can().redo() },
   ]
})

const palette = ref<'color' | 'highlight' | null>(null)

function togglePalette(which: 'color' | 'highlight') {
   palette.value = palette.value === which ? null : which
}

// Màu đang áp cho vùng chọn, để ô "tùy ý" mở đúng màu hiện tại
const currentColor = computed(() => editor.value?.getAttributes('textStyle').color as string | undefined)
const currentHighlight = computed(() => editor.value?.getAttributes('highlight').color as string | undefined)

// close=false khi kéo trong color picker: sự kiện input bắn liên tục, đóng panel
// mỗi lần sẽ giật; preset bấm một phát thì đóng luôn cho gọn
function applyColor(hex: string, close = true) {
   editor.value?.chain().focus().setColor(hex).run()
   if (close) palette.value = null
}

function clearColor() {
   editor.value?.chain().focus().unsetColor().run()
   palette.value = null
}

function applyHighlight(hex: string, close = true) {
   editor.value?.chain().focus().setHighlight({ color: hex }).run()
   if (close) palette.value = null
}

function clearHighlight() {
   editor.value?.chain().focus().unsetHighlight().run()
   palette.value = null
}

const linkForm = ref<{ href: string; editing: boolean } | null>(null)
const linkInput = useTemplateRef<HTMLInputElement>('linkInput')

function openLinkForm() {
   const e = editor.value
   if (!e) return
   const current = e.getAttributes('link').href as string | undefined
   linkForm.value = { href: current ?? '', editing: !!current }
   nextTick(() => linkInput.value?.select())
}

function submitLink() {
   const e = editor.value
   const href = linkForm.value?.href.trim()
   linkForm.value = null
   if (!e) return

   if (!href) {
      e.chain().focus().unsetLink().run()
      return
   }

   e.chain().focus().extendMarkRange('link').setLink({ href: withScheme(href) }).run()
}

function withScheme(href: string) {
   if (/^(https?:|mailto:|tel:|\/|#)/i.test(href)) return href
   return `https://${href}`
}

watch(model, (v) => {
   const e = editor.value
   if (!e) return
   if (v !== (e.isEmpty ? '' : e.getHTML())) {
      e.commands.setContent(v || '', { emitUpdate: false })
   }
})
</script>

<style scoped>

:deep(.tiptap-content) {
   h2 {
      font-size: 1.25rem;
      font-weight: 800;
      line-height: 1.35;
      margin: 0.75em 0 0.4em;
   }

   h3 {
      font-size: 1.05rem;
      font-weight: 700;
      line-height: 1.4;
      margin: 0.7em 0 0.35em;
   }

   p {
      margin: 0 0 0.6em;
   }

   ul,
   ol {
      margin: 0 0 0.6em;
      padding-left: 1.4em;
   }

   ul {
      list-style: disc;
   }

   ol {
      list-style: decimal;
   }

   li>p {
      margin: 0;
   }

   blockquote {
      margin: 0 0 0.6em;
      padding-left: 0.9em;
      border-left: 3px solid var(--color-gray-300);
      color: var(--color-gray-500);
   }

   a {
      color: var(--color-primary);
      text-decoration: underline;
   }

   mark {
      padding: 0.05em 0.18em;
      border-radius: 0.25em;
      color: inherit;
   }

   sub,
   sup {
      line-height: 0;
      font-size: 0.75em;
   }

   :first-child {
      margin-top: 0;
   }

   :last-child {
      margin-bottom: 0;
   }

   p.is-editor-empty:first-child::before {
      content: attr(data-placeholder);
      float: left;
      height: 0;
      pointer-events: none;
      color: var(--color-gray-400);
   }
}
</style>
