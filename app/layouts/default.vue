<template>
   <div class="min-h-screen bg-gray-50 text-gray-900 font-sans flex">
      <div v-if="mobileOpen" class="fixed inset-0 z-40 bg-black/50 lg:hidden" @click="mobileOpen = false"></div>

      <aside :class="[
         'bg-[#0f1e35] text-white flex flex-col shrink-0 z-50 h-screen transition-[transform,width] duration-200',
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
               <component :is="item.icon" class="shrink-0 size-[18px]" />
               <span v-if="expanded" class="whitespace-nowrap">{{ item.label }}</span>
            </NuxtLink>
         </nav>
         <div class="p-3 border-t border-white/8">
            <button type="button" @click="onLogout" :title="expanded ? undefined : 'Đăng xuất'"
               class="w-full flex items-center gap-3 h-[42px] rounded-[9px] text-white/70 text-sm font-semibold hover:bg-white/8 hover:text-white transition-colors"
               :class="expanded ? 'px-3' : 'justify-center'">
               <IconsLogout class="shrink-0 size-[18px]" />
               <span v-if="expanded" class="whitespace-nowrap">Đăng xuất</span>
            </button>
         </div>
      </aside>

      <div class="flex flex-col min-w-0 flex-1">
         <header
            class="h-16 bg-white border-b border-gray-200 flex items-center justify-between gap-2 px-4 sm:px-6 sticky top-0 z-30">
            <div class="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
               <button type="button" @click="mobileOpen = true" aria-label="Mở menu"
                  class="lg:hidden shrink-0 w-9 h-9 -ml-1 flex items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 transition-colors">
                  <IconsMenu class="size-[18px]" />
               </button>
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
import { IconsAnnouncements, IconsDashboard, IconsPosts, IconsTag } from '#components'
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

const menu = [
   { to: '/', label: 'Tổng quan', icon: IconsDashboard, exact: true },
   { to: '/bai-viet', label: 'Bài viết', icon: IconsPosts },
   { to: '/chuyen-muc', label: 'Chuyên mục', icon: IconsTag },
   { to: '/thong-bao', label: 'Thông báo', icon: IconsAnnouncements },
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
