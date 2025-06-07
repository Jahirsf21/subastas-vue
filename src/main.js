// src/main.js

import { createApp, watch } from 'vue' // <-- Importa 'watch'
import App from './App.vue'
import router from './router/router'
import { createPinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

// Tus importaciones de idiomas
import enContent from './i18n/en.json'
import esContent from './i18n/es.json'
import frContent from './i18n/fr.json'
import ptContent from './i18n/pt.json'
import zhContent from './i18n/zh.json'

import { useSettingsStore } from './store/settings'

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
const app = createApp(App)
app.use(pinia) 

const settingsStore = useSettingsStore(pinia)


const i18n = createI18n({
  legacy: false,
  locale: settingsStore.language,
  fallbackLocale: 'en',
  messages: {
    en: enContent,
    es: esContent,
    pt: ptContent,
    fr: frContent,
    zh: zhContent
  },
  globalInjection: true
})


watch(
  () => settingsStore.language,
  (newLang) => {
    i18n.global.locale.value = newLang
  }
)

app.use(router).use(i18n).mount('#app')