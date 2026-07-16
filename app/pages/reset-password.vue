<template>
   <UCard>
      <template #header>
         <h1 class="text-xl font-semibold">Đặt lại mật khẩu</h1>
         <p class="mt-1 text-sm text-muted">Nhập mã OTP đã gửi tới email của bạn</p>
      </template>

      <UForm :validate="validate" :state="state" class="space-y-4" @submit="onSubmit">
         <UFormField label="Email" name="email" required>
            <UInput v-model="state.email" type="email" class="w-full" />
         </UFormField>

         <UFormField label="Mã OTP" name="otp" required>
            <UPinInput v-model="otpDigits" :length="6" otp type="number" />
         </UFormField>

         <UFormField label="Mật khẩu mới" name="newPassword" required>
            <UInput v-model="state.newPassword" type="password" class="w-full" />
         </UFormField>

         <UFormField label="Xác nhận mật khẩu" name="confirmPassword" required>
            <UInput v-model="state.confirmPassword" type="password" class="w-full" />
         </UFormField>

         <UButton type="submit" block :loading="loading" label="Đặt lại mật khẩu" />
         <UButton to="/dang-nhap" block color="neutral" variant="ghost" label="Quay lại đăng nhập" />
      </UForm>
   </UCard>
</template>

<script setup lang="ts">
import { useToastMessage } from '~/composables/useToastMessage'

definePageMeta({ layout: 'auth', middleware: 'guest' })

const auth = useAuthStore()
const route = useRoute()
const toast = useToastMessage()

const otpDigits = ref<number[]>([])
const state = reactive({
   email: (route.query.email as string) || '',
   otp: computed(() => otpDigits.value.join('')),
   newPassword: '',
   confirmPassword: '',
})
const loading = ref(false)

function validate(s: typeof state) {
   const errors: { name: string; message: string }[] = []
   if (!/^\S+@\S+\.\S+$/.test(s.email)) errors.push({ name: 'email', message: 'Email không hợp lệ' })
   if (s.otp.length !== 6) errors.push({ name: 'otp', message: 'OTP phải đủ 6 chữ số' })
   if (s.newPassword.length < 6) errors.push({ name: 'newPassword', message: 'Mật khẩu tối thiểu 6 ký tự' })
   if (s.confirmPassword !== s.newPassword) errors.push({ name: 'confirmPassword', message: 'Mật khẩu xác nhận không khớp' })
   return errors
}

async function onSubmit() {
   loading.value = true
   try {
      const msg = await auth.resetPassword(state.email, state.otp, state.newPassword)
      toast.success(msg)
      await navigateTo('/dang-nhap')
   } catch (e: any) {
      toast.error(e.message)
   } finally {
      loading.value = false
   }
}
</script>
