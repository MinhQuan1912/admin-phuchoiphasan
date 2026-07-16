<template>
   <div class="min-h-screen grid lg:grid-cols-2 bg-white font-sans">
      <div class="relative overflow-hidden hidden lg:block">
         <div class="absolute inset-0">
            <img src="https://picsum.photos/300/200" alt="" class="w-full h-full object-cover object-center" />
         </div>
         <div class="absolute inset-0 login-overlay"></div>
         <div class="relative h-full flex flex-col justify-center px-14 text-white">
            <div class="flex items-center gap-3 mb-7">
               <div
                  class="w-[46px] h-[46px] rounded-[11px] bg-white text-primary flex items-center justify-center font-extrabold text-base">
                  QTV</div>
               <div class="font-extrabold text-lg">Quản Tài Viên VN</div>
            </div>
            <h2 class="text-[34px] font-extrabold tracking-tight leading-tight max-w-md mb-3.5">Trang quản trị nội
               dung</h2>
            <p class="text-base leading-relaxed text-white/82 max-w-md">
               Quản lý bài viết, thông báo phá sản và theo dõi hoạt động của cổng thông tin.
            </p>
         </div>
      </div>

      <div class="flex items-center justify-center p-10">
         
         <UForm :validate="validate" :validate-on="validateOn" :state="state" class="space-y-4" @submit="onSubmit"
            @error="onError">
            <div class="flex items-center gap-2.5 mb-7">
               <div
                  class="w-10 h-10 rounded-[10px] bg-primary text-white flex items-center justify-center font-extrabold text-[14px]">
                  QTV</div>
               <span class="font-extrabold text-base">Admin</span>
            </div>
            <h1 class="text-[26px] font-extrabold tracking-tight mb-1.5">Đăng nhập</h1>
            <p class="text-sm text-gray-500 mb-6.5">Nhập thông tin tài khoản quản trị của bạn.</p>
            <UFormField label="Email" name="email" required>
               <UInput v-model="state.email" type="email" placeholder="admin@example.com" icon="i-lucide-mail"
                  class="w-full" />
            </UFormField>

            <UFormField label="Mật khẩu" name="password" required>
               <UInput v-model="state.password" :type="showPass ? 'text' : 'password'" icon="i-heroicons-lock-closed"
                  class="w-full" size="xl" :disabled="loading"
                  :trailing-icon="showPass ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'"
                  @click:trailing="showPass = !showPass">
                  <template #trailing>
                     <button type="button" @click="showPass = !showPass">
                        <UIcon :name="showPass ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'" />
                     </button>
                  </template>
               </UInput>
            </UFormField>

            <div class="flex justify-end">
               <ULink to="/forgot-password" class="text-sm text-primary">Quên mật khẩu?</ULink>
            </div>

            <UButton type="submit" block :loading="loading" label="Đăng nhập" />
         </UForm>
      </div>
   </div>
</template>

<script setup lang="ts">
import type { FormErrorEvent, FormSubmitEvent } from '@nuxt/ui'
import { useToastMessage } from '~/composables/useToastMessage'

definePageMeta({ layout: 'auth', middleware: 'guest' })

const auth = useAuthStore()
const route = useRoute()
const toast = useToastMessage()

const state = reactive({ email: '', password: '' })
const loading = ref(false)
const showPass = ref(false)

const submitted = ref(false)
const validateOn = computed<any[]>(() => (submitted.value ? ['input'] : []))

function validate(s: typeof state) {
   const errors: { name: string; message: string }[] = []
   if (!s.email) errors.push({ name: 'email', message: 'Vui lòng nhập email' })
   else if (!/^\S+@\S+\.\S+$/.test(s.email)) errors.push({ name: 'email', message: 'Email không hợp lệ' })
   if (!s.password) errors.push({ name: 'password', message: 'Vui lòng nhập mật khẩu' })
   else if (s.password.length < 6) errors.push({ name: 'password', message: 'Mật khẩu tối thiểu 6 ký tự' })
   return errors
}

function onError(_e: FormErrorEvent) {
   submitted.value = true
}

async function onSubmit(_e: FormSubmitEvent<typeof state>) {
   submitted.value = true
   loading.value = true
   try {
      const msg = await auth.login(state.email, state.password)
      toast.success(msg)
      await navigateTo((route.query.redirect as string) || '/')
   } catch (e: any) {
      toast.error(e.message)
   } finally {
      loading.value = false
   }
}
</script>

<style scoped>

.login-overlay {
   background: linear-gradient(140deg, rgba(8, 16, 30, 0.94), color-mix(in srgb, var(--color-primary, #0f56b3) 66%, transparent));
}
</style>