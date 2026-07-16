<template>
   <div>
      <h1 class="text-[26px] font-extrabold tracking-tight mb-1.5">Đặt lại mật khẩu</h1>
      <p class="text-sm text-gray-500 mb-6.5">
         Mã OTP đã gửi tới <span class="font-semibold text-gray-700">{{ email }}</span>.
      </p>

      <UForm :validate="validate" :validate-on="validateOn" :state="state" class="space-y-4" @submit="onSubmit"
         @error="onError">
         <UFormField label="Mã OTP" name="otp" required>
            <UPinInput v-model="otpDigits" :length="6" otp type="number" :disabled="loading" />
         </UFormField>

         <UFormField label="Mật khẩu mới" name="newPassword" required>
            <UInput v-model="state.newPassword" type="password" icon="i-heroicons-lock-closed" class="w-full" size="xl"
               :disabled="loading" />
         </UFormField>

         <UFormField label="Xác nhận mật khẩu" name="confirmPassword" required>
            <UInput v-model="state.confirmPassword" type="password" icon="i-heroicons-lock-closed" class="w-full"
               size="xl" :disabled="loading" />
         </UFormField>

         <UButton type="submit" block :loading="loading" label="Đặt lại mật khẩu" />
         <UButton block color="neutral" variant="ghost" label="Quay lại đăng nhập" :disabled="loading"
            @click="emit('back')" />
      </UForm>
   </div>
</template>

<script setup lang="ts">
import type { FormErrorEvent } from '@nuxt/ui'
import { useToastMessage } from '~/composables/useToastMessage'

const props = defineProps<{ email: string }>()
const emit = defineEmits<{ done: []; back: [] }>()

const auth = useAuthStore()
const toast = useToastMessage()

const otpDigits = ref<number[]>([])
const state = reactive({
   otp: computed(() => otpDigits.value.join('')),
   newPassword: '',
   confirmPassword: '',
})
const loading = ref(false)

const submitted = ref(false)
const validateOn = computed<any[]>(() => (submitted.value ? ['input'] : []))

function validate(s: typeof state) {
   const errors: { name: string; message: string }[] = []
   if (s.otp.length !== 6) errors.push({ name: 'otp', message: 'OTP phải đủ 6 chữ số' })
   if (s.newPassword.length < 6) errors.push({ name: 'newPassword', message: 'Mật khẩu tối thiểu 6 ký tự' })
   if (s.confirmPassword !== s.newPassword) errors.push({ name: 'confirmPassword', message: 'Mật khẩu xác nhận không khớp' })
   return errors
}

function onError(_e: FormErrorEvent) {
   submitted.value = true
}

async function onSubmit() {
   submitted.value = true
   loading.value = true
   try {
      const msg = await auth.resetPassword(props.email, state.otp, state.newPassword)
      toast.success(msg)
      emit('done')
   } catch (e: any) {
      toast.error(e.message)
   } finally {
      loading.value = false
   }
}
</script>
