<template>
   <div>
      <div class="flex flex-wrap gap-3 items-center justify-between mb-[18px]">
         <div class="relative flex-1 min-w-[260px] max-w-[400px]">
            <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 flex">
               <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                  stroke-linecap="round">
                  <circle cx="11" cy="11" r="7" />
                  <line x1="21" y1="21" x2="16.5" y2="16.5" />
               </svg>
            </span>
            <input v-model="query" type="text" placeholder="Tìm thông báo..."
               class="w-full h-[42px] border border-gray-200 rounded-[10px] pl-10 pr-3.5 text-sm outline-none focus:border-primary transition-colors bg-white" />
         </div>
         <button type="button"
            class="h-[42px] inline-flex items-center gap-2 px-[18px] bg-primary text-white rounded-[10px] font-semibold text-sm">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"
               stroke-linecap="round">
               <line x1="12" y1="5" x2="12" y2="19" />
               <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Thêm thông báo
         </button>
      </div>

      <div class="bg-white border border-gray-200 rounded-[14px] overflow-hidden">
         <div
            class="grid grid-cols-[190px_1fr_140px_160px_90px] gap-4 items-center px-5 py-3.5 bg-gray-100 uppercase tracking-wide text-[11px] font-bold text-gray-500">
            <div>Tòa án</div>
            <div>Doanh nghiệp</div>
            <div>Loại</div>
            <div>Số quyết định</div>
            <div class="text-right">Thao tác</div>
         </div>
         <div v-for="a in filtered" :key="a.no"
            class="grid grid-cols-[190px_1fr_140px_160px_90px] gap-4 items-center px-5 py-3.5 border-t border-gray-100 hover:bg-gray-50/60 transition-colors">
            <div class="text-[13px] font-semibold text-primary">{{ a.court }}</div>
            <div class="min-w-0">
               <div class="text-sm font-semibold truncate">{{ a.title }}</div>
               <div class="text-xs text-gray-500 mt-0.5">{{ a.date }}</div>
            </div>
            <div><span
                  class="inline-block bg-primary/10 text-primary text-[11px] font-semibold px-2.5 py-1 rounded-full">{{
                  a.type }}</span></div>
            <div class="text-[13px] text-gray-500 font-mono">{{ a.no }}</div>
            <div class="flex gap-2 justify-end">
               <button type="button" title="Sửa" class="text-gray-500 hover:text-primary flex">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                     stroke-linecap="round" stroke-linejoin="round">
                     <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                     <path d="M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4z" />
                  </svg>
               </button>
               <button type="button" title="Xóa" class="text-gray-500 hover:text-rose-800 flex">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                     stroke-linecap="round" stroke-linejoin="round">
                     <polyline points="3 6 5 6 21 6" />
                     <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
               </button>
            </div>
         </div>
      </div>

      <div class="mt-4 text-[13px] text-gray-500">Hiển thị {{ filtered.length }} thông báo</div>
   </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
useHead({ title: 'Thông báo phá sản · Quản trị' })

const query = ref('')

const announcements = [
   { court: 'TAND TP.HCM', title: 'Công ty CP Đầu tư Nam Phú', type: 'Mở thủ tục', no: '151/2026/QĐ-MTTPS', date: '13/07/2026' },
   { court: 'TAND tỉnh Bình Dương', title: 'Công ty TNHH Thương mại ABC', type: 'Mở thủ tục', no: '145/2026/QĐ-MTTPS', date: '12/07/2026' },
   { court: 'TAND TP. Hà Nội', title: 'Công ty CP Xây dựng Đại Phát', type: 'Hội nghị chủ nợ', no: '132/2026/TB-TA', date: '11/07/2026' },
   { court: 'TAND tỉnh Đồng Nai', title: 'Công ty TNHH Dệt may Hồng Ân', type: 'Tuyên bố phá sản', no: '118/2026/QĐ-TBPS', date: '09/07/2026' },
   { court: 'TAND TP.HCM', title: 'Công ty CP Địa ốc Tân Thành', type: 'Bán đấu giá', no: '110/2026/TB-QTV', date: '08/07/2026' },
   { court: 'TAND TP. Đà Nẵng', title: 'Công ty CP Du lịch Biển Xanh', type: 'Mở thủ tục', no: '098/2026/QĐ-MTTPS', date: '05/07/2026' }
]

const filtered = computed(() => {
   const q = query.value.trim().toLowerCase()
   return announcements.filter((a) => !q || a.title.toLowerCase().includes(q) || a.no.toLowerCase().includes(q))
})
</script>
