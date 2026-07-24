// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: ["@nuxt/ui", "@pinia/nuxt", "@nuxt/fonts"],
  ssr: false,
  css: ["~/assets/css/main.css"],
  fonts: {
    families: [
      // Khai báo đủ weight đang dùng (medium→extrabold), khớp với Frontend
      { name: "Inter", provider: "google", weights: [400, 500, 600, 700, 800] },
      // Heading trong trang xem thử dùng serif giống Frontend
      { name: "Merriweather", provider: "google", weights: [400, 700, 800] },
    ],
  },
  runtimeConfig: {
    public: {
      apiBase: "http://localhost:3001/api",
    },
  },
  devServer: {
    port: 3002
  }
});
