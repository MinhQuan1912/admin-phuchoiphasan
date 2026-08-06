<template>
   <div class="min-h-screen grid lg:grid-cols-2 bg-white font-sans">
      <div class="relative hidden lg:block">
         <img src="/images/image.png" alt="" class="absolute inset-0 w-full h-full object-cover object-center" />
      </div>

      <div class="flex items-center justify-center p-6 sm:p-10">
         <div class="w-full max-w-sm">
            <div class="flex items-center gap-2.5 mb-7">
               <div
                  class="w-10 h-10 rounded-[10px] bg-primary text-white flex items-center justify-center font-extrabold text-sm">
                  QTV</div>
               <span class="font-extrabold text-base">Admin</span>
            </div>

            <!-- Bước 1: nhập tài khoản để nhận mã -->
            <UForm v-if="step === 'request'" :validate="validateRequest" :validate-on="validateOn" :state="state"
               class="space-y-4" @submit="onRequest" @error="onError">
               <h1 class="text-[26px] font-extrabold tracking-tight mb-6.5">Quên mật khẩu</h1>

               <UFormField label="Tài khoản" name="username" required>
                  <UInput v-model="state.username" type="text" icon="i-lucide-user" class="w-full" size="xl" />
               </UFormField>

               <UButton type="submit" block label="Gửi mã xác nhận" />
               <UButton to="/dang-nhap" block color="neutral" variant="ghost" label="Quay lại đăng nhập" />
            </UForm>

            <!-- Bước 2: nhập mã xác nhận -->
            <UForm v-else-if="step === 'otp'" :validate="validateOtp" :validate-on="validateOn" :state="state"
               class="space-y-4" @submit="onVerify" @error="onError">
               <h1 class="text-[26px] font-extrabold tracking-tight mb-4">Nhập mã xác nhận</h1>

               <div class="mb-6.5 flex items-start gap-2.5 rounded-[10px] bg-primary/8 px-3.5 py-3">
                  <UIcon name="i-heroicons-envelope" class="mt-0.5 size-4.5 shrink-0 text-primary" />
                  <p class="text-[13px] leading-relaxed text-gray-600">
                     Đã gửi mã xác nhận tới
                     <span class="font-semibold text-gray-900">{{ state.username }}</span>.
                     Mã gồm 6 chữ số và hết hạn sau 10 phút.
                  </p>
               </div>

               <UFormField label="Mã xác nhận" name="otp" required>
                  <UInput v-model="state.otp" type="text" inputmode="numeric" maxlength="6" placeholder="000000"
                     icon="i-heroicons-key" class="w-full" size="xl" :disabled="loading" />
               </UFormField>

               <UButton type="submit" block :loading="loading" label="Xác nhận" />
               <UButton block color="neutral" variant="ghost" :disabled="loading" label="Đổi tài khoản khác"
                  @click="backToRequest" />
            </UForm>

            <!-- Bước 3: đặt mật khẩu mới -->
            <UForm v-else :validate="validatePassword" :validate-on="validateOn" :state="state" class="space-y-4"
               @submit="onReset" @error="onError">
               <h1 class="text-[26px] font-extrabold tracking-tight mb-6.5">Đặt mật khẩu mới</h1>

               <UFormField label="Mật khẩu mới" name="newPassword" required>
                  <UInput v-model="state.newPassword" :type="showPass ? 'text' : 'password'"
                     icon="i-heroicons-lock-closed" class="w-full" size="xl" :disabled="loading">
                     <template #trailing>
                        <button type="button" @click="showPass = !showPass">
                           <UIcon :name="showPass ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'" />
                        </button>
                     </template>
                  </UInput>
               </UFormField>

               <UFormField label="Nhập lại mật khẩu mới" name="confirmPassword" required>
                  <UInput v-model="state.confirmPassword" :type="showPass ? 'text' : 'password'"
                     icon="i-heroicons-lock-closed" class="w-full" size="xl" :disabled="loading" />
               </UFormField>

               <UButton type="submit" block :loading="loading" label="Đặt lại mật khẩu" />
               <UButton block color="neutral" variant="ghost" :disabled="loading" label="Quay lại nhập mã"
                  @click="backToOtp" />
            </UForm>
         </div>
      </div>
   </div>
</template>

<script setup lang="ts">
import type { FormErrorEvent, FormSubmitEvent } from '@nuxt/ui'
import { useToastMessage } from '~/composables/useToastMessage'

definePageMeta({ layout: 'auth', middleware: 'guest' })
useHead({ title: 'Quên mật khẩu · Quản trị' })

const auth = useAuthStore()
const toast = useToastMessage()

const step = ref<'request' | 'otp' | 'password'>('request')
const state = reactive({ username: '', otp: '', newPassword: '', confirmPassword: '' })
const loading = ref(false)
const showPass = ref(false)

const submitted = ref(false)
const validateOn = computed<any[]>(() => (submitted.value ? ['input'] : []))

function validateRequest(s: typeof state) {
   const errors: { name: string; message: string }[] = []
   if (!s.username.trim()) errors.push({ name: 'username', message: 'Vui lòng nhập tài khoản' })
   return errors
}

function validateOtp(s: typeof state) {
   const errors: { name: string; message: string }[] = []
   if (!/^\d{6}$/.test(s.otp.trim())) errors.push({ name: 'otp', message: 'Mã xác nhận gồm 6 chữ số' })
   return errors
}

function validatePassword(s: typeof state) {
   const errors: { name: string; message: string }[] = []
   if (!s.newPassword) errors.push({ name: 'newPassword', message: 'Vui lòng nhập mật khẩu mới' })
   else if (s.newPassword.length < 6) errors.push({ name: 'newPassword', message: 'Mật khẩu mới tối thiểu 6 ký tự' })
   if (s.confirmPassword !== s.newPassword) errors.push({ name: 'confirmPassword', message: 'Nhập lại mật khẩu chưa khớp' })
   return errors
}

function onError(_e: FormErrorEvent) {
   submitted.value = true
}

function goStep(next: typeof step.value) {
   step.value = next
   submitted.value = false
}

function backToRequest() {
   state.otp = ''
   state.newPassword = ''
   state.confirmPassword = ''
   goStep('request')
}

function backToOtp() {
   state.newPassword = ''
   state.confirmPassword = ''
   goStep('otp')
}

function onRequest(_e: FormSubmitEvent<typeof state>) {
   submitted.value = true
   const username = state.username.trim()
   auth.forgotPassword(username).catch((e: any) => toast.error(e.message))
   goStep('otp')
}

async function onVerify(_e: FormSubmitEvent<typeof state>) {
   submitted.value = true
   loading.value = true
   try {
      await auth.verifyOtp(state.username.trim(), state.otp.trim())
      goStep('password')
   } catch (e: any) {
      toast.error(e.message)
   } finally {
      loading.value = false
   }
}

async function onReset(_e: FormSubmitEvent<typeof state>) {
   submitted.value = true
   loading.value = true
   try {
      const msg = await auth.resetPassword(state.username.trim(), state.otp.trim(), state.newPassword)
      toast.success(msg)
      await navigateTo('/dang-nhap')
   } catch (e: any) {
      toast.error(e.message)
   } finally {
      loading.value = false
   }
}
</script>
