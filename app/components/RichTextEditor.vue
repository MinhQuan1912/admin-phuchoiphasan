<template>
   <div class="border border-gray-200 rounded-[10px] overflow-hidden transition-colors"
      :class="focused ? 'border-primary' : ''">
      <div v-if="editor" class="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-gray-200 bg-gray-50">
         <button v-for="t in tools" :key="t.title" type="button" :title="t.title" :disabled="t.disabled?.()"
            class="w-7 h-7 flex items-center justify-center rounded-md text-gray-500 hover:bg-gray-200 hover:text-primary disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-500"
            :class="t.active?.() ? 'bg-primary/10 text-primary' : ''"
            @click="t.run">
            <span v-if="t.label" class="text-[13px] leading-none" :class="t.labelClass">{{ t.label }}</span>
            <component :is="t.icon" v-else class="size-3.75" />
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
               class="h-6 px-2 rounded-md border border-gray-200 text-[11px] font-semibold text-gray-500 hover:bg-gray-200 transition-colors">
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
               class="h-6 px-2 rounded-md border border-gray-200 text-[11px] font-semibold text-gray-500 hover:bg-gray-200 transition-colors">
               Bỏ nền
            </button>
         </template>
      </div>

      <div v-if="editor?.isActive('table')"
         class="flex flex-wrap items-center gap-1.5 px-2 py-2 border-b border-gray-200 bg-white">
         <button v-for="t in tableTools" :key="t.title" type="button" @click="t.run"
            class="h-6 px-2 rounded-md border text-[11px] font-semibold transition-colors"
            :class="t.danger
               ? 'border-rose-200 text-rose-700 hover:bg-rose-50'
               : 'border-gray-200 text-gray-500 hover:bg-gray-200'">
            {{ t.title }}
         </button>
      </div>

      <EditorContent :editor="editor" @focusin="focused = true" @focusout="focused = false" />
   </div>

   <div v-if="linkForm" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      @click.self="linkForm = null">
      <div class="bg-white rounded-[14px] p-6 w-full max-w-105">
         <h3 class="text-base font-extrabold">{{ linkForm.editing ? 'Sửa liên kết' : 'Chèn liên kết' }}</h3>

         <label class="block text-[13px] font-semibold mt-4 mb-1.5">Địa chỉ</label>
         <input ref="linkInput" v-model="linkForm.href" placeholder="https://vi.wikipedia.org/..."
            @keyup.enter="submitLink" @keyup.esc="linkForm = null"
            class="w-full h-10.5 border border-gray-200 rounded-[10px] px-3.5 text-sm outline-none focus:border-primary transition-colors" />

         <div class="mt-5 flex justify-end gap-2.5">
            <button type="button" class="h-10 px-4 bg-white border border-gray-200 rounded-[10px] font-semibold text-sm hover:bg-gray-200 transition-colors"
               @click="linkForm = null">Hủy</button>
            <button type="button" class="h-10 px-4 bg-primary text-white rounded-[10px] font-bold text-sm hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0 transition-all"
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
import { TableKit, TableView } from '@tiptap/extension-table'
import type { Component } from 'vue'
import {
   IconsAlignCenter, IconsAlignLeft, IconsAlignRight, IconsBulletList, IconsColor,
   IconsFormatClear, IconsHighlight, IconsLink, IconsOrderedList, IconsQuote,
   IconsRedo, IconsSubscript, IconsSuperscript, IconsTable, IconsUndo, IconsUnlink,
} from '#components'

const props = defineProps<{ placeholder?: string }>()
const model = defineModel<string>({ required: true })

const focused = ref(false)

const TEXT_COLORS = ['#dc2626', '#ea580c', '#ca8a04', '#16a34a', '#2563eb', '#7c3aed']
const HIGHLIGHT_COLORS = ['#fef08a', '#bbf7d0', '#bfdbfe', '#fbcfe8', '#fed7aa']

const TABLE_COLS = 3
const TABLE_ROWS = 3

const TABLE_UNITS = 1000
const MIN_COL_UNITS = 60
const HANDLE_ZONE = 5

interface EditorViewLike {
   state: { tr: any }
   dispatch: (tr: any) => void
   posAtDOM: (node: Node, offset: number) => number
}

function toPercentColumns(table: HTMLTableElement, colgroup: Element) {
   const cols = Array.from(colgroup.children) as HTMLElement[]
   if (!cols.length) return

   const raw = cols.map(c => parseFloat(c.style.width) || 0)
   const known = raw.filter(Boolean)
   if (!known.length) return

   const avg = known.reduce((a, b) => a + b, 0) / known.length
   const widths = raw.map(w => w || avg)
   const total = widths.reduce((a, b) => a + b, 0)

   cols.forEach((c, i) => {
      const next = `${((widths[i]! / total) * 100).toFixed(4)}%`
      if (c.style.minWidth) c.style.removeProperty('min-width')
      if (c.style.width !== next) c.style.width = next
   })
   if (table.style.width) table.style.removeProperty('width')
   if (table.style.minWidth) table.style.removeProperty('min-width')
}

class FullWidthTableView extends TableView {
   private editorView: EditorViewLike
   private drag: { index: number; startX: number; units: number[] } | null = null

   constructor(...args: ConstructorParameters<typeof TableView>) {
      super(...args)
      this.editorView = args[2] as unknown as EditorViewLike
      toPercentColumns(this.table, this.colgroup)

      this.table.addEventListener('pointermove', this.onHover)
      this.table.addEventListener('pointerleave', this.onLeave)
      this.table.addEventListener('pointerdown', this.onDragStart)
   }

   override update(node: Parameters<TableView['update']>[0]) {
      const updated = super.update(node)
      if (updated) toPercentColumns(this.table, this.colgroup)
      return updated
   }

   destroy() {
      this.table.removeEventListener('pointermove', this.onHover)
      this.table.removeEventListener('pointerleave', this.onLeave)
      this.table.removeEventListener('pointerdown', this.onDragStart)
      this.stopDrag()
   }

   private boundaryAt(clientX: number) {
      const row = this.table.rows[0]
      if (!row) return -1
      for (let i = 0; i < row.cells.length - 1; i++) {
         const right = row.cells[i]!.getBoundingClientRect().right
         if (Math.abs(clientX - right) <= HANDLE_ZONE) return i
      }
      return -1
   }

   private currentUnits() {
      const cols = Array.from(this.colgroup.children) as HTMLElement[]
      if (!cols.length) return []
      const raw = cols.map(c => parseFloat(c.style.width) || 0)
      const total = raw.reduce((a, b) => a + b, 0)
      if (!total) return cols.map(() => TABLE_UNITS / cols.length)
      return raw.map(w => (w / total) * TABLE_UNITS)
   }

   private applyUnits(units: number[]) {
      const total = units.reduce((a, b) => a + b, 0) || 1
      const cols = Array.from(this.colgroup.children) as HTMLElement[]
      cols.forEach((c, i) => {
         c.style.removeProperty('min-width')
         c.style.width = `${(((units[i] ?? 0) / total) * 100).toFixed(4)}%`
      })
   }

   private onHover = (event: PointerEvent) => {
      if (this.drag) return
      this.table.style.cursor = this.boundaryAt(event.clientX) >= 0 ? 'col-resize' : ''
   }

   private onLeave = () => {
      if (!this.drag) this.table.style.cursor = ''
   }

   private onDragStart = (event: PointerEvent) => {
      if (event.button !== 0) return
      const index = this.boundaryAt(event.clientX)
      if (index < 0) return

      const units = this.currentUnits()
      const pair = (units[index] ?? 0) + (units[index + 1] ?? 0)
      if (pair < MIN_COL_UNITS * 2) return

      event.preventDefault()
      this.drag = { index, startX: event.clientX, units }
      this.table.style.cursor = 'col-resize'
      window.addEventListener('pointermove', this.onDragMove)
      window.addEventListener('pointerup', this.onDragEnd)
      window.addEventListener('pointercancel', this.onDragEnd)
   }

   private onDragMove = (event: PointerEvent) => {
      const drag = this.drag
      if (!drag) return

      const delta = ((event.clientX - drag.startX) / (this.table.clientWidth || 1)) * TABLE_UNITS
      const first = drag.units[drag.index]!
      const pair = first + drag.units[drag.index + 1]!
      const next = Math.min(Math.max(first + delta, MIN_COL_UNITS), pair - MIN_COL_UNITS)

      const units = drag.units.slice()
      units[drag.index] = next
      units[drag.index + 1] = pair - next
      this.applyUnits(units)
   }

   private onDragEnd = () => {
      const dragged = !!this.drag
      this.stopDrag()
      if (dragged) this.commitUnits()
   }

   private stopDrag() {
      this.drag = null
      this.table.style.cursor = ''
      window.removeEventListener('pointermove', this.onDragMove)
      window.removeEventListener('pointerup', this.onDragEnd)
      window.removeEventListener('pointercancel', this.onDragEnd)
   }

   private commitUnits() {
      const view = this.editorView
      const row = this.node.firstChild
      const units = this.currentUnits()
      if (!view || !row || row.childCount !== units.length) return

      let cellPos: number
      try {
         cellPos = view.posAtDOM(this.contentDOM, 0) + 1
      } catch {
         return
      }

      const tr = view.state.tr
      let changed = false
      row.forEach((cell, offset, index) => {
         const width = Math.round(units[index] ?? 0)
         const prev = cell.attrs.colwidth as number[] | null
         if (prev?.length === 1 && prev[0] === width) return
         tr.setNodeMarkup(cellPos + offset, undefined, { ...cell.attrs, colwidth: [width] })
         changed = true
      })
      if (changed) view.dispatch(tr)
   }
}

function normalizeTableHtml(html: string) {
   if (!html.includes('<table')) return html
   const doc = new DOMParser().parseFromString(html, 'text/html')
   for (const table of doc.querySelectorAll('table')) {
      const colgroup = table.querySelector('colgroup')
      if (colgroup) toPercentColumns(table, colgroup)
   }
   return doc.body.innerHTML
}

const currentHtml = (e: { isEmpty: boolean; getHTML: () => string }) =>
   (e.isEmpty ? '' : normalizeTableHtml(e.getHTML()))

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
      TableKit.configure({ table: { resizable: false, View: FullWidthTableView } }),
   ],
   editorProps: {
      attributes: {
         class: 'tiptap-content p-3 text-sm leading-relaxed outline-none min-h-30',
      },
   },
   onUpdate: ({ editor }) => {
      model.value = currentHtml(editor)
   },
})

interface Tool {
   title: string
   label?: string
   labelClass?: string
   icon?: Component
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
      { title: 'Danh sách đầu dòng', icon: IconsBulletList, run: () => e.chain().focus().toggleBulletList().run(), active: () => e.isActive('bulletList') },
      { title: 'Danh sách đánh số', icon: IconsOrderedList, run: () => e.chain().focus().toggleOrderedList().run(), active: () => e.isActive('orderedList') },
      { title: 'Trích dẫn', icon: IconsQuote, run: () => e.chain().focus().toggleBlockquote().run(), active: () => e.isActive('blockquote') },
      { title: 'Chèn bảng', icon: IconsTable, run: () => insertTable(e), active: () => e.isActive('table') },
      { title: 'Căn trái', icon: IconsAlignLeft, run: () => e.chain().focus().setTextAlign('left').run(), active: () => e.isActive({ textAlign: 'left' }) },
      { title: 'Căn giữa', icon: IconsAlignCenter, run: () => e.chain().focus().setTextAlign('center').run(), active: () => e.isActive({ textAlign: 'center' }) },
      { title: 'Căn phải', icon: IconsAlignRight, run: () => e.chain().focus().setTextAlign('right').run(), active: () => e.isActive({ textAlign: 'right' }) },
      { title: 'Màu chữ', icon: IconsColor, run: () => togglePalette('color'), active: () => e.isActive('textStyle') },
      { title: 'Bôi nền', icon: IconsHighlight, run: () => togglePalette('highlight'), active: () => e.isActive('highlight') },
      { title: 'Chỉ số dưới', icon: IconsSubscript, run: () => e.chain().focus().toggleSubscript().run(), active: () => e.isActive('subscript') },
      { title: 'Chỉ số trên', icon: IconsSuperscript, run: () => e.chain().focus().toggleSuperscript().run(), active: () => e.isActive('superscript') },
      { title: 'Chèn link', icon: IconsLink, run: openLinkForm, active: () => e.isActive('link') },
      { title: 'Bỏ link', icon: IconsUnlink, run: () => e.chain().focus().unsetLink().run(), disabled: () => !e.isActive('link') },
      { title: 'Xóa định dạng', icon: IconsFormatClear, run: () => e.chain().focus().unsetAllMarks().clearNodes().run() },
      { title: 'Hoàn tác', icon: IconsUndo, run: () => e.chain().focus().undo().run(), disabled: () => !e.can().undo() },
      { title: 'Làm lại', icon: IconsRedo, run: () => e.chain().focus().redo().run(), disabled: () => !e.can().redo() },
   ]
})

function insertTable(e: NonNullable<typeof editor.value>) {
   const unit = Math.round(TABLE_UNITS / TABLE_COLS)
   e.chain().focus().insertTable({ rows: TABLE_ROWS, cols: TABLE_COLS, withHeaderRow: true }).run()

   const $from = e.state.selection.$from
   for (let depth = $from.depth; depth > 0; depth--) {
      const table = $from.node(depth)
      if (table.type.name !== 'table') continue

      const row = table.firstChild
      if (!row) return
      const tr = e.state.tr
      let pos = $from.before(depth) + 2
      row.forEach((cell) => {
         tr.setNodeMarkup(pos, undefined, { ...cell.attrs, colwidth: [unit] })
         pos += cell.nodeSize
      })
      e.view.dispatch(tr)
      return
   }
}

const tableTools = computed(() => {
   const e = editor.value
   if (!e) return []
   return [
      { title: '+ Hàng trên', run: () => e.chain().focus().addRowBefore().run() },
      { title: '+ Hàng dưới', run: () => e.chain().focus().addRowAfter().run() },
      { title: '+ Cột trái', run: () => e.chain().focus().addColumnBefore().run() },
      { title: '+ Cột phải', run: () => e.chain().focus().addColumnAfter().run() },
      { title: 'Xóa hàng', run: () => e.chain().focus().deleteRow().run() },
      { title: 'Xóa cột', run: () => e.chain().focus().deleteColumn().run() },
      { title: 'Gộp / tách ô', run: () => e.chain().focus().mergeOrSplit().run() },
      { title: 'Dòng tiêu đề', run: () => e.chain().focus().toggleHeaderRow().run() },
      { title: 'Xóa bảng', danger: true, run: () => e.chain().focus().deleteTable().run() },
   ]
})

const palette = ref<'color' | 'highlight' | null>(null)

function togglePalette(which: 'color' | 'highlight') {
   palette.value = palette.value === which ? null : which
}

const currentColor = computed(() => editor.value?.getAttributes('textStyle').color as string | undefined)
const currentHighlight = computed(() => editor.value?.getAttributes('highlight').color as string | undefined)

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
   if (v !== currentHtml(e)) {
      e.commands.setContent(v || '', { emitUpdate: false })
   }
})
</script>

<style scoped>

:deep(.tiptap-content) {
   font-weight: 500;

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

   .tableWrapper {
      margin: 0 0 0.6em;
      overflow-x: auto;
   }

   table {
      width: 100%;
      border-collapse: collapse;
      table-layout: fixed;
   }

   th,
   td {
      position: relative;
      padding: 0.35em 0.5em;
      border: 1px solid var(--color-gray-400);
      vertical-align: top;
   }

   th {
      background: var(--color-gray-100);
      font-weight: 700;
      text-align: left;
   }

   th>p,
   td>p {
      margin: 0;
   }

   .selectedCell::after {
      content: '';
      position: absolute;
      inset: 0;
      background: var(--color-primary);
      opacity: 0.12;
      pointer-events: none;
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
