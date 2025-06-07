
import { defineStore } from 'pinia'

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    language: 'es', 
  }),
  actions: {
    setLanguage(lang) {
      this.language = lang
    },
  },

  persist: true, 
})