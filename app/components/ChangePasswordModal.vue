<template>
   <Transition name="modal">
      <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" @click.self="close">
         <div class="modal-panel bg-white rounded-[14px] p-6 w-full max-w-105">
            <h3 class="text-base font-extrabold">Đổi mật khẩu</h3>

            <UForm :validate="validate" :validate-on="validateOn" :state="state" class="mt-4 space-y-4"
               @submit="onSubmit" @error="onError">
               <UFormField label="Mật khẩu hiện tại" name="oldPassword" required>
                  <UInput v-model="state.oldPassword" :type="show.old ? 'text' : 'password'"
                     icon="i-heroicons-lock-closed" class="w-full" size="lg" :disabled="loading">
                     <template #trailing>
                        <button type="button" tabindex="-1" aria-label="Hiện/ẩn mật khẩu"
                           @click="show.old = !show.old">
                           <UIcon :name="show.old ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'" />
                        </button>
                     </template>
                  </UInput>
               </UFormField>

               <UFormField label="Mật khẩu mới" name="newPassword" required>
                  <UInput v-model="state.newPassword" :type="show.next ? 'text' : 'password'"
                     icon="i-heroicons-lock-closed" class="w-full" size="lg" :disabled="loading">
                     <template #trailing>
                        <button type="button" tabindex="-1" aria-label="Hiện/ẩn mật khẩu"
                           @click="show.next = !show.next">
                           <UIcon :name="show.next ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'" />
                        </button>
                     </template>
                  </UInput>
               </UFormField>

               <UFormField label="Nhập lại mật khẩu mới" name="confirmPassword" required>
                  <UInput v-model="state.confirmPassword" :type="show.next ? 'text' : 'password'"
                     icon="i-heroicons-lock-closed" class="w-full" size="lg" :disabled="loading" />
               </UFormField>

               <div class="pt-1 flex justify-end gap-2.5">
                  <button type="button" :disabled="loading" @click="close"
                     class="h-10 px-4 bg-white border border-gray-200 rounded-[10px] font-semibold text-sm hover:bg-gray-200 disabled:opacity-60 transition-colors">
                     Hủy
                  </button>
                  <button type="submit" :disabled="loading"
                     class="h-10 px-4 bg-primary text-white rounded-[10px] font-bold text-sm hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:shadow-none disabled:translate-y-0 transition-all">
                     {{ loading ? 'Đang lưu...' : 'Cập nhật' }}
                  </button>
               </div>
            </UForm>
         </div>
      </div>
   </Transition>
</template>

<script setup lang="ts">
import type { FormErrorEvent, FormSubmitEvent } from '@nuxt/ui'
import { useToastMessage } from '~/composables/useToastMessage'

const open = defineModel<boolean>({ required: true })

const auth = useAuthStore()
const toast = useToastMessage()

const state = reactive({ oldPassword: '', newPassword: '', confirmPassword: '' })
const show = reactive({ old: false, next: false })
const loading = ref(false)

const submitted = ref(false)
const validateOn = computed<any[]>(() => (submitted.value ? ['input'] : []))

watch(open, (isOpen) => {
   if (isOpen) reset()
})

function reset() {
   state.oldPassword = ''
   state.newPassword = ''
   state.confirmPassword = ''
   show.old = false
   show.next = false
   submitted.value = false
}

function close() {
   if (loading.value) return
   open.value = false
}

function validate(s: typeof state) {
   const errors: { name: string; message: string }[] = []
   if (!s.oldPassword) errors.push({ name: 'oldPassword', message: 'Vui lòng nhập mật khẩu hiện tại' })
   if (!s.newPassword) errors.push({ name: 'newPassword', message: 'Vui lòng nhập mật khẩu mới' })
   else if (s.newPassword.length < 6) errors.push({ name: 'newPassword', message: 'Mật khẩu mới tối thiểu 6 ký tự' })
   else if (s.newPassword === s.oldPassword) errors.push({ name: 'newPassword', message: 'Mật khẩu mới phải khác mật khẩu hiện tại' })
   if (s.confirmPassword !== s.newPassword) errors.push({ name: 'confirmPassword', message: 'Nhập lại mật khẩu chưa khớp' })
   return errors
}

function onError(_e: FormErrorEvent) {
   submitted.value = true
}

async function onSubmit(_e: FormSubmitEvent<typeof state>) {
   submitted.value = true
   loading.value = true
   try {
      const msg = await auth.changePassword(state.oldPassword, state.newPassword)
      toast.success(msg)
      open.value = false
   } catch (e: any) {
      toast.error(e.message)
   } finally {
      loading.value = false
   }
}
</script>
