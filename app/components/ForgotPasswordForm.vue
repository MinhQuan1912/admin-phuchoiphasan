<template>
   <div>
      <h1 class="text-[26px] font-extrabold tracking-tight mb-1.5">Quên mật khẩu</h1>
      <p class="text-sm text-gray-500 mb-6.5">Nhập email quản trị để nhận mã OTP, hiệu lực trong 15 phút.</p>

      <UForm :validate="validate" :validate-on="validateOn" :state="state" class="space-y-4" @submit="onSubmit"
         @error="onError">
         <UFormField label="Email" name="email" required>
            <UInput v-model="state.email" type="email" placeholder="admin@example.com" icon="i-lucide-mail"
               class="w-full" size="xl" :disabled="loading" />
         </UFormField>

         <UButton type="submit" block :loading="loading" label="Gửi mã OTP" />
         <UButton block color="neutral" variant="ghost" label="Quay lại đăng nhập" :disabled="loading"
            @click="emit('back')" />
      </UForm>
   </div>
</template>

<script setup lang="ts">
import type { FormErrorEvent } from '@nuxt/ui'
import { useToastMessage } from '~/composables/useToastMessage'

const props = defineProps<{ email?: string }>()
const emit = defineEmits<{ sent: [email: string]; back: [] }>()

const auth = useAuthStore()
const toast = useToastMessage()

const state = reactive({ email: props.email ?? '' })
const loading = ref(false)

const submitted = ref(false)
const validateOn = computed<any[]>(() => (submitted.value ? ['input'] : []))

function validate(s: typeof state) {
   const errors: { name: string; message: string }[] = []
   if (!s.email) errors.push({ name: 'email', message: 'Vui lòng nhập email' })
   else if (!/^\S+@\S+\.\S+$/.test(s.email)) errors.push({ name: 'email', message: 'Email không hợp lệ' })
   return errors
}

function onError(_e: FormErrorEvent) {
   submitted.value = true
}

async function onSubmit() {
   submitted.value = true
   loading.value = true
   try {
      const msg = await auth.forgotPassword(state.email)
      toast.success(msg)
      emit('sent', state.email)
   } catch (e: any) {
      toast.error(e.message)
   } finally {
      loading.value = false
   }
}
</script>
