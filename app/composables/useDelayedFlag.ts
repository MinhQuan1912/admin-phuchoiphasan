import type { Ref } from 'vue'


export function useDelayedFlag(source: Ref<boolean>, delay = 150) {
   const flag = ref(false)
   let timer: ReturnType<typeof setTimeout> | undefined

   watch(
      source,
      value => {
         clearTimeout(timer)
         if (!value) {
            flag.value = false
            return
         }
         timer = setTimeout(() => (flag.value = true), delay)
      },
      { immediate: true },
   )

   onBeforeUnmount(() => clearTimeout(timer))

   return flag
}
