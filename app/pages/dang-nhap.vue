<template>
   <div class="min-h-screen grid lg:grid-cols-2 bg-white font-sans">
      <div class="relative hidden lg:block">
         <img src="/images/image.png" alt=""
            class="absolute inset-0 w-full h-full object-cover object-center" />
      </div>

      <div class="flex items-center justify-center p-6 sm:p-10">

         <div class="w-full max-w-sm">
            <div class="flex items-center gap-2.5 mb-7">
               <div
                  class="w-10 h-10 rounded-[10px] bg-primary text-white flex items-center justify-center font-extrabold text-sm">
                  QTV</div>
               <span class="font-extrabold text-base">Admin</span>
            </div>

            <UForm :validate="validate" :validate-on="validateOn" :state="state" class="space-y-4"
               @submit="onSubmit" @error="onError">
               <h1 class="text-[26px] font-extrabold tracking-tight mb-1.5">Đăng nhập</h1>
               <p class="text-sm text-gray-500 mb-6.5">Nhập thông tin tài khoản quản trị của bạn.</p>
               <UFormField label="Tài khoản" name="username" required>
                  <UInput v-model="state.username" type="text" icon="i-lucide-user"
                     class="w-full" size="xl" :disabled="loading" />
               </UFormField>

               <UFormField label="Mật khẩu" name="password" required>
                  <UInput v-model="state.password" :type="showPass ? 'text' : 'password'"
                     icon="i-heroicons-lock-closed" class="w-full" size="xl" :disabled="loading">
                     <template #trailing>
                        <button type="button" @click="showPass = !showPass">
                           <UIcon :name="showPass ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'" />
                        </button>
                     </template>
                  </UInput>
               </UFormField>

               <UButton type="submit" block :loading="loading" label="Đăng nhập" />

               <div class="text-center">
                  <NuxtLink to="/quen-mat-khau" class="text-[13px] font-semibold text-primary hover:underline">
                     Quên mật khẩu?
                  </NuxtLink>
               </div>
            </UForm>
         </div>
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

const state = reactive({ username: '', password: '' })
const loading = ref(false)
const showPass = ref(false)

const submitted = ref(false)
const validateOn = computed<any[]>(() => (submitted.value ? ['input'] : []))

function validate(s: typeof state) {
   const errors: { name: string; message: string }[] = []
   if (!s.username) errors.push({ name: 'username', message: 'Vui lòng nhập tài khoản' })
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
      const msg = await auth.login(state.username, state.password)
      toast.success(msg)
      await navigateTo((route.query.redirect as string) || '/')
   } catch (e: any) {
      toast.error(e.message)
   } finally {
      loading.value = false
   }
}
</script>
