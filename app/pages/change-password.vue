<template>
   <div class="mx-auto max-w-md space-y-6">
      <h1 class="text-2xl font-semibold">Đổi mật khẩu</h1>

      <UCard>
         <UForm :validate="validate" :state="state" class="space-y-4" @submit="onSubmit">
            <UFormField label="Mật khẩu hiện tại" name="oldPassword" required>
               <UInput v-model="state.oldPassword" type="password" class="w-full" />
            </UFormField>

            <UFormField label="Mật khẩu mới" name="newPassword" required>
               <UInput v-model="state.newPassword" type="password" class="w-full" />
            </UFormField>

            <UFormField label="Xác nhận mật khẩu mới" name="confirmPassword" required>
               <UInput v-model="state.confirmPassword" type="password" class="w-full" />
            </UFormField>

            <UButton type="submit" block :loading="loading" label="Đổi mật khẩu" />
         </UForm>
      </UCard>
   </div>
</template>

<script setup lang="ts">
import { useToastMessage } from '~/composables/useToastMessage'

definePageMeta({ middleware: 'auth' })

const auth = useAuthStore()
const toast = useToastMessage()

const state = reactive({ oldPassword: '', newPassword: '', confirmPassword: '' })
const loading = ref(false)

function validate(s: typeof state) {
   const errors: { name: string; message: string }[] = []
   if (!s.oldPassword) errors.push({ name: 'oldPassword', message: 'Vui lòng nhập mật khẩu cũ' })
   if (s.newPassword.length < 6) errors.push({ name: 'newPassword', message: 'Mật khẩu mới tối thiểu 6 ký tự' })
   if (s.confirmPassword !== s.newPassword) errors.push({ name: 'confirmPassword', message: 'Mật khẩu xác nhận không khớp' })
   return errors
}

async function onSubmit() {
   loading.value = true
   try {
      const msg = await auth.changePassword(state.oldPassword, state.newPassword)
      toast.success(msg)
      Object.assign(state, { oldPassword: '', newPassword: '', confirmPassword: '' })
   } catch (e: any) {
      toast.error(e.message)
   } finally {
      loading.value = false
   }
}
</script>
