// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: ["@nuxt/ui", "@pinia/nuxt", "@nuxt/fonts"],
  ssr: false,
  css: ["~/assets/css/main.css"],
  fonts: {
    families: [
      { name: "Inter", provider: "google", weights: [400, 500, 600, 700, 800] },
      { name: "Merriweather", provider: "google", weights: [400, 700, 800] },
    ],
  },
  runtimeConfig: {
    public: {
      apiBase: "https://be-phuchoiphasan-production.up.railway.app/api",
    },
  },
  devServer: {
    port: 3002,
  },
});
