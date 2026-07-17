<template>
   <div class="min-h-screen bg-gray-50 text-gray-900 font-sans flex">
      <div v-if="mobileOpen" class="fixed inset-0 z-40 bg-black/50 lg:hidden" @click="mobileOpen = false"></div>

      <aside :class="[
         'bg-[#0f1e35] text-white flex flex-col shrink-0 z-50 h-screen transition-transform duration-200',
         'fixed inset-y-0 left-0 w-[248px] lg:sticky lg:top-0 lg:translate-x-0',
         sidebarOpen ? 'lg:w-[248px]' : 'lg:w-[72px]',
         mobileOpen ? 'translate-x-0' : '-translate-x-full',
      ]">
         <button type="button" @click="onToggleSidebar"
            :title="sidebarOpen ? 'Thu gọn thanh bên' : 'Mở rộng thanh bên'"
            class="h-16 w-full flex items-center gap-2.5 px-4.5 border-b border-white/8 hover:bg-white/5 transition-colors">
            <div
               class="w-9 h-9 shrink-0 rounded-[9px] bg-primary text-white flex items-center justify-center font-extrabold text-[13px]">
               QTV</div>
            <span v-if="expanded" class="font-extrabold text-[15px] whitespace-nowrap">Admin QTV</span>
         </button>
         <nav class="flex-1 p-3 flex flex-col gap-1">
            <NuxtLink v-for="item in menu" :key="item.to" :to="item.to" :title="expanded ? undefined : item.label"
               @click="mobileOpen = false"
               class="flex items-center gap-3 h-[42px] rounded-[9px] text-sm font-semibold transition-colors"
               :class="[
                  expanded ? 'px-3' : 'justify-center',
                  isActive(item)
                     ? 'bg-primary text-white'
                     : 'text-white/70 hover:bg-white/8 hover:text-white',
               ]">
               <span class="shrink-0 flex" v-html="item.icon"></span>
               <span v-if="expanded" class="whitespace-nowrap">{{ item.label }}</span>
            </NuxtLink>
         </nav>
         <div class="p-3 border-t border-white/8">
            <button type="button" @click="onLogout" :title="expanded ? undefined : 'Đăng xuất'"
               class="w-full flex items-center gap-3 h-[42px] rounded-[9px] text-white/70 text-sm font-semibold hover:bg-white/8 hover:text-white transition-colors"
               :class="expanded ? 'px-3' : 'justify-center'">
               <span class="shrink-0 flex" v-html="icons.logout"></span>
               <span v-if="expanded" class="whitespace-nowrap">Đăng xuất</span>
            </button>
         </div>
      </aside>

      <div class="flex flex-col min-w-0 flex-1">
         <header
            class="h-16 bg-white border-b border-gray-200 flex items-center justify-between gap-2 px-4 sm:px-6 sticky top-0 z-30">
            <div class="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
               <button type="button" @click="mobileOpen = true" aria-label="Mở menu"
                  class="lg:hidden shrink-0 w-9 h-9 -ml-1 flex items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                  v-html="icons.menu"></button>
               <div class="min-w-0">
                  <div class="text-sm sm:text-base font-extrabold tracking-tight truncate">{{ title }}</div>
                  <div class="hidden sm:block text-xs text-gray-500 truncate">{{ subtitle }}</div>
               </div>
            </div>
            <div class="flex items-center gap-2.5 sm:gap-3.5 shrink-0">
               <NuxtLink to="/"
                  class="hidden sm:inline text-[13px] font-semibold text-gray-500 hover:text-primary transition-colors">Xem
                  website →</NuxtLink>
               <div class="hidden sm:block w-px h-6.5 bg-gray-200"></div>
               <div class="flex items-center gap-2.5">
                  <div
                     class="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[13px]">
                     {{ initials }}</div>
                  <div class="hidden md:block leading-tight">
                     <div class="text-[13px] font-bold">{{ auth.admin?.email ?? '—' }}</div>
                     <div class="text-[11px] text-gray-500">Quản trị viên</div>
                  </div>
               </div>
            </div>
         </header>

         <main class="flex-1 px-4 sm:px-6 pt-5 sm:pt-6.5 pb-10">
            <slot />
         </main>
      </div>
   </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

const route = useRoute()
const auth = useAuthStore()
const sidebarOpen = ref(true)
const mobileOpen = ref(false)

const expanded = computed(() => mobileOpen.value || sidebarOpen.value)

function onToggleSidebar() {
   if (mobileOpen.value) {
      mobileOpen.value = false
   } else {
      sidebarOpen.value = !sidebarOpen.value
   }
}

watch(mobileOpen, (open) => {
   if (import.meta.client) document.body.style.overflow = open ? 'hidden' : ''
})

watch(() => route.path, () => {
   mobileOpen.value = false
})

onBeforeUnmount(() => {
   if (import.meta.client) document.body.style.overflow = ''
})

const initials = computed(() => {
   const email = auth.admin?.email
   return email ? email.slice(0, 2).toUpperCase() : '--'
})

async function onLogout() {
   auth.logout()
   await navigateTo('/dang-nhap')
}

const icons = {
   dashboard: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>',
   posts: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16v16H4z"/><line x1="8" y1="9" x2="16" y2="9"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="12" y2="17"/></svg>',
   announcements: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></svg>',
   users: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/></svg>',
   tag: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>',
   logout: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>',
   menu: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>'
}

const menu = [
   { to: '/', label: 'Tổng quan', icon: icons.dashboard, exact: true },
   { to: '/bai-viet', label: 'Bài viết', icon: icons.posts },
   { to: '/chuyen-muc', label: 'Chuyên mục', icon: icons.tag },
   { to: '/thong-bao', label: 'Thông báo', icon: icons.announcements },
]

function isActive(item: { to: string; exact?: boolean }) {
   return item.exact ? route.path === item.to : route.path.startsWith(item.to)
}

const meta = computed(() => {
   const p = route.path
   if (p === '/') return ['Tổng quan', 'Bảng điều khiển quản trị']
   if (p === '/bai-viet/create') return ['Soạn bài viết', 'Trình soạn thảo nội dung']
   if (p.startsWith('/bai-viet/')) return ['Sửa bài viết', 'Trình soạn thảo nội dung']
   if (p.startsWith('/bai-viet')) return ['Quản lý bài viết', 'Danh sách toàn bộ bài viết']
   if (p.startsWith('/chuyen-muc')) return ['Chuyên mục', 'Phân loại bài viết']
   if (p.startsWith('/thong-bao')) return ['Thông báo phá sản', 'Quản lý thông báo phá sản']
   if (p.startsWith('/change-password')) return ['Đổi mật khẩu', 'Cập nhật mật khẩu đăng nhập']
   return ['Quản trị', '']
})
const title = computed(() => meta.value[0])
const subtitle = computed(() => meta.value[1])
</script>
