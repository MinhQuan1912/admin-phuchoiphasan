const MIN_DURATION = 360
const MAX_DURATION = 620
const MS_PER_PIXEL = 0.38

export function scrollToTop(): Promise<void> {
   if (import.meta.server) return Promise.resolve()

   const from = window.scrollY
   const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

   if (from <= 0 || reduceMotion) {
      window.scrollTo({ top: 0, behavior: 'instant' })
      return Promise.resolve()
   }

   const duration = Math.min(MAX_DURATION, Math.max(MIN_DURATION, from * MS_PER_PIXEL))

   return new Promise((resolve) => {
      const startedAt = performance.now()

      const step = (now: number) => {
         const progress = Math.min(1, (now - startedAt) / duration)
         const eased = progress < 0.5
            ? 4 * progress ** 3
            : 1 - (-2 * progress + 2) ** 3 / 2

         window.scrollTo({ top: from * (1 - eased), behavior: 'instant' })

         if (progress < 1) {
            requestAnimationFrame(step)
            return
         }
         resolve()
      }

      requestAnimationFrame(step)
   })
}
