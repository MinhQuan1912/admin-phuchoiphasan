<template>
   <UCard>
      <template #header>
         <h1 class="text-xl font-semibold">Quên mật khẩu</h1>
         <p class="mt-1 text-sm text-muted">Nhập email để nhận mã OTP (hiệu lực 15 phút)</p>
      </template>

      <UForm :state="state" class="space-y-4" @submit="onSubmit">
         <UFormField label="Email" name="email" required>
            <UInput v-model="state.email" type="email" icon="i-lucide-mail" class="w-full" />
         </UFormField>

         <UButton type="submit" block :loading="loading" label="Gửi mã OTP" />
         <UButton to="/dang-nhap" block color="neutral" variant="ghost" label="Quay lại đăng nhập" />
      </UForm>
   </UCard>
</template>

<script setup lang="ts">
import { useToastMessage } from '~/composables/useToastMessage'

definePageMeta({ layout: 'auth', middleware: 'guest' })

const auth = useAuthStore()
const toast = useToastMessage()

const state = reactive({ email: '' })
const loading = ref(false)

async function onSubmit() {
   loading.value = true
   try {
      const msg = await auth.forgotPassword(state.email)
      toast.success(msg)
      await navigateTo(`/reset-password?email=${encodeURIComponent(state.email)}`)
   } catch (e: any) {
      toast.error(e.message)
   } finally {
      loading.value = false
   }
}
</script>
