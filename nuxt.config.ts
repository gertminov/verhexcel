// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@sit-onyx/nuxt', 'nuxt-auth-utils'],
  css: ["~/assets/css/main.css", "@fontsource-variable/source-sans-3",  "@fontsource-variable/source-code-pro"],
  vite: {
    plugins: [
        tailwindcss()
    ]
  }
})