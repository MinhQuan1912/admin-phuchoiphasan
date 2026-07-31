<template>
   <div class="min-h-screen bg-gray-50 text-gray-900 font-sans flex">
      <div v-if="mobileOpen" class="fixed inset-0 z-40 bg-black/50 lg:hidden" @click="mobileOpen = false"></div>

      <aside :class="[
         'bg-gray-900 text-white flex flex-col shrink-0 z-50 h-screen transition-all duration-300 ease-in-out',
         'fixed inset-y-0 left-0 w-62 lg:sticky lg:top-0 lg:translate-x-0',
         sidebarOpen ? 'lg:w-62' : 'lg:w-18',
         mobileOpen ? 'translate-x-0' : '-translate-x-full',
      ]">
         <button type="button" @click="onToggleSidebar"
            :title="sidebarOpen ? 'Thu gọn thanh bên' : 'Mở rộng thanh bên'"
            class="h-16 w-full flex items-center gap-2.5 px-4.5 border-b border-white/8 hover:bg-white/5 transition-colors">
            <div
               class="w-9 h-9 shrink-0 rounded-[9px] bg-primary text-white flex items-center justify-center font-extrabold text-[13px]">
               QTV</div>
            <span v-if="expanded" class="font-extrabold text-[15px] whitespace-nowrap">Admin</span>
         </button>
         <nav class="flex-1 p-3 flex flex-col gap-1">
            <NuxtLink v-for="item in menu" :key="item.to" :to="item.to" :title="expanded ? undefined : item.label"
               @click="mobileOpen = false"
               class="flex items-center h-10.5 rounded-[9px] text-sm font-semibold transition-colors overflow-hidden"
               :class="isActive(item)
                  ? 'bg-primary text-white'
                  : 'text-white/70 hover:bg-white/8 hover:text-white'">
               <span class="w-12 shrink-0 flex items-center justify-center">
                  <component :is="item.icon" class="size-4.5" />
               </span>
               <span class="whitespace-nowrap pr-3">{{ item.label }}</span>
            </NuxtLink>
         </nav>
         <div class="p-3 border-t border-white/8">
            <button type="button" @click="onLogout" :title="expanded ? undefined : 'Đăng xuất'"
               class="w-full flex items-center h-10.5 rounded-[9px] text-white/70 text-sm font-semibold hover:bg-white/8 hover:text-white transition-colors overflow-hidden">
               <span class="w-12 shrink-0 flex items-center justify-center">
                  <IconsLogout class="size-4.5" />
               </span>
               <span class="whitespace-nowrap pr-3">Đăng xuất</span>
            </button>
         </div>
      </aside>

      <div class="flex flex-col min-w-0 flex-1">
         <header
            class="h-16 bg-white border-b border-gray-200 flex items-center justify-between gap-2 px-4 sm:px-6 sticky top-0 z-30">
            <div class="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
               <button type="button" @click="mobileOpen = true" aria-label="Mở menu"
                  class="lg:hidden shrink-0 w-9 h-9 -ml-1 flex items-center justify-center rounded-lg text-gray-600 hover:bg-gray-200 transition-colors">
                  <IconsMenu class="size-4.5" />
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
                     <div class="text-[13px] font-bold">{{ auth.admin?.username ?? '—' }}</div>
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
import { IconsAnnouncements, IconsDashboard, IconsLegal, IconsPosts, IconsQuestion, IconsTag } from '#components'
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
   const username = auth.admin?.username
   return username ? username.slice(0, 2).toUpperCase() : '--'
})

async function onLogout() {
   auth.logout()
   await navigateTo('/dang-nhap')
}

const menu = [
   { to: '/', label: 'Tổng quan', icon: IconsDashboard, exact: true },
   { to: '/tin-tuc', label: 'Tin tức', icon: IconsPosts },
   { to: '/su-kien', label: 'Sự kiện', icon: IconsPosts },
   { to: '/chuyen-muc', label: 'Chuyên mục', icon: IconsTag },
   { to: '/thong-bao', label: 'Thông báo', icon: IconsAnnouncements },
   { to: '/cau-hoi-thuong-gap', label: 'Câu hỏi thường gặp', icon: IconsQuestion },
   { to: '/van-ban-phap-luat', label: 'Văn bản pháp luật', icon: IconsLegal },
]

function isActive(item: { to: string; exact?: boolean }) {
   return item.exact ? route.path === item.to : route.path.startsWith(item.to)
}

const meta = computed(() => {
   const p = route.path
   if (p === '/') return ['Tổng quan', 'Bảng điều khiển quản trị']
   if (p === '/tin-tuc/create') return ['Soạn tin tức', 'Trình soạn thảo nội dung']
   if (p.startsWith('/tin-tuc/')) return ['Sửa tin tức', 'Trình soạn thảo nội dung']
   if (p.startsWith('/tin-tuc')) return ['Quản lý tin tức', 'Danh sách toàn bộ tin tức']
   if (p === '/su-kien/create') return ['Soạn sự kiện', 'Trình soạn thảo nội dung']
   if (p.startsWith('/su-kien/')) return ['Sửa sự kiện', 'Trình soạn thảo nội dung']
   if (p.startsWith('/su-kien')) return ['Quản lý sự kiện', 'Danh sách toàn bộ sự kiện']
   if (p.startsWith('/chuyen-muc')) return ['Chuyên mục', 'Phân loại bài viết']
   if (p === '/thong-bao/create') return ['Thêm thông báo', 'Soạn thông báo']
   if (p.startsWith('/thong-bao/')) return ['Sửa thông báo', 'Soạn thông báo']
   if (p.startsWith('/thong-bao')) return ['Thông báo', 'Quản lý thông báo']
   if (p === '/cau-hoi-thuong-gap/create') return ['Soạn câu hỏi', 'Trình soạn thảo nội dung']
   if (p.startsWith('/cau-hoi-thuong-gap/')) return ['Sửa câu hỏi', 'Trình soạn thảo nội dung']
   if (p.startsWith('/cau-hoi-thuong-gap')) return ['Câu hỏi thường gặp', 'Quản lý câu hỏi thường gặp']
   if (p === '/van-ban-phap-luat/create') return ['Soạn văn bản', 'Trình soạn thảo nội dung']
   if (p.startsWith('/van-ban-phap-luat/')) return ['Sửa văn bản', 'Trình soạn thảo nội dung']
   if (p.startsWith('/van-ban-phap-luat')) return ['Văn bản pháp luật', 'Quản lý văn bản pháp luật']
   if (p.startsWith('/change-password')) return ['Đổi mật khẩu', 'Cập nhật mật khẩu đăng nhập']
   return ['Quản trị', '']
})
const title = computed(() => meta.value[0])
const subtitle = computed(() => meta.value[1])
</script>
