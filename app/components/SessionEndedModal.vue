<template>
   <Transition name="modal">
      <div v-if="message" class="fixed inset-0 z-100 flex items-center justify-center bg-black/40 p-4">
         <div class="modal-panel bg-white rounded-[14px] p-6 w-full max-w-105">
            <h3 class="text-base font-extrabold">Phiên đăng nhập đã kết thúc</h3>
            <p class="mt-2 text-sm text-gray-500 leading-relaxed">{{ message }}</p>
            <div class="mt-5 flex justify-end">
               <button type="button"
                  class="h-10 px-4 bg-primary text-white rounded-[10px] font-bold text-sm hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0 transition-all"
                  @click="confirm">
                  Xác nhận
               </button>
            </div>
         </div>
      </div>
   </Transition>
</template>

<script setup lang="ts">
const message = useSessionEnded()
const auth = useAuthStore()

async function confirm() {
   auth.logout()
   await navigateTo('/dang-nhap')
   message.value = null
}
</script>
