<template>
  <header class="app-header">
    <router-link to="/" class="logo-link">
      <h1><img src="/logo.png" alt="Logo" class="logo" />{{ t('header.title') }}</h1>
    </router-link>

    <form class="search-container" @submit.prevent="performSearch">
      <input 
        type="text" 
        class="search-input" 
        :placeholder="t('header.searchPlaceholder')"
        :value="subastasStore.searchQuery"
        @input="updateSearchQuery"
      >
      <button type="submit" class="search-button" aria-label="Buscar">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
      </button>
    </form>

    <div class="header-icons">
      <div class="language-menu-container">
        <button class="icon-button" @click="toggleLanguageMenu" aria-label="Cambiar idioma">
          <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#5D4037" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 0 20a15.3 15.3 0 0 1 0-20" />
          </svg>
        </button>
        <transition name="fade">
          <div v-if="showLanguageMenu" class="dropdown-menu">
              <button @click="changeLanguage('es')" class="dropdown-item">Español</button>
              <button @click="changeLanguage('en')" class="dropdown-item">English</button>
              <button @click="changeLanguage('fr')" class="dropdown-item">Français</button>
              <button @click="changeLanguage('pt')" class="dropdown-item">Português</button>
              <button @click="changeLanguage('zh')" class="dropdown-item">中文</button>
          </div>
        </transition>
      </div>
      
      <button class="user-button" @click="openProfileModal" aria-label="Menú de usuario">
        <div class="profile-avatar">
          <img v-if="activeProfileInfo && activeProfileInfo.logo" :src="activeProfileInfo.logo" alt="Logo de perfil" class="avatar-image">
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="7" r="4"></circle><path d="M5.5 21v-2a4 4 0 0 1 4-4h5a4 4 0 0 1 4 4v2"></path></svg>
        </div>
        <span class="profile-name">{{ activeProfileName }}</span>
      </button>
    </div>
  </header>

  <transition name="fade">
    <ProfileModal v-if="showProfileModal" @close="showProfileModal = false" />
  </transition>
</template>
  
<script setup>
import { ref, computed } from 'vue';
import { useAuthStore } from '../store/auth';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n'; 
import { useSettingsStore } from '../store/settings';
import { useSubastasStore } from '../store/subastas';
import ProfileModal from '../views/Profile.vue';

const { t } = useI18n();
const authStore = useAuthStore();
const router = useRouter();
const settingsStore = useSettingsStore();
const subastasStore = useSubastasStore();

// Lógica del Perfil Activo
const activeProfileInfo = computed(() => authStore.activeProfileData);
const activeProfileName = computed(() => {
  if (!authStore.isLoggedIn) return "Cuenta";
  return activeProfileInfo.value?.nombre || activeProfileInfo.value?.nombreCompleto || "Mi Perfil";
});

const showProfileModal = ref(false);
const openProfileModal = () => {
  showProfileModal.value = true;
};


const updateSearchQuery = (event) => {
  subastasStore.setSearchQuery(event.target.value);
  if (router.currentRoute.value.path !== '/catalog') {
    router.push('/catalog');
  }
};
const performSearch = () => {
  if (router.currentRoute.value.path !== '/catalog') {
    router.push('/catalog');
  }
};


const showLanguageMenu = ref(false);
const toggleLanguageMenu = () => {
  showLanguageMenu.value = !showLanguageMenu.value;
};
const changeLanguage = (lang) => {
  settingsStore.setLanguage(lang);
  showLanguageMenu.value = false;
};
</script>
  
<style scoped>
.app-header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 24px;
  background-color: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
  font-family: 'Segoe UI', sans-serif;
}

.logo-link {
  text-decoration: none;
}

h1 {
  display: flex;
  align-items: center; 
  gap: 15px;         
  margin: 0;        
  color: #5D4037;   
  font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  font-size: 2rem;  
}

.logo {
  height: 60px;
}

form.search-container {
  display: flex;
  align-items: center;
  background-color: #ffffff;
  border: 1.5px solid #8D6E63;
  border-radius: 50px; 
  padding: 5px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); 
  width: 100%;
  max-width: 500px; 
  transition: box-shadow 0.3s ease;
}

form.search-container:focus-within {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2); 
}

.search-input {
  border: none;
  outline: none;
  flex-grow: 1;
  padding: 10px 20px;
  font-size: 16px;
  background-color: transparent;
  color: #5D4037; 
}

.search-input::placeholder {
  color: #A1887F;
  opacity: 1;
}

.search-button {
  background-color: #8D6E63; 
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  color: #ffffff; 
  flex-shrink: 0; 
  transition: background-color 0.3s ease;
}

.search-button:hover {
  background-color: #6D4C41; 
}

.search-button svg {
  stroke: currentColor;
  stroke-width: 2.5;
}

.header-icons {
  display: flex;
  align-items: center;
  gap: 20px;
}

.icon-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  display: flex;
  align-items: center;
}

.user-button {
  background-color: #fff;
  border: 1px solid #D7CCC8;
  border-radius: 50px;
  padding: 4px 12px 4px 6px;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.user-button:hover {
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  border-color: #A1887F;
}

.profile-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #EAE3E0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  color: #8D6E63;
}

.profile-avatar svg {
  width: 20px;
  height: 20px;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-name {
  font-weight: 600;
  color: #5D4037;
}

.language-menu-container {
  position: relative; 
  display: inline-block;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 180px;
  z-index: 1001; 
  margin-top: 8px;
  overflow: hidden; 
}

.dropdown-item {
  display: block;
  width: 100%;
  padding: 12px 20px;
  text-align: left;
  background: none;
  border: none;
  color: #333;
  font-size: 16px;
  text-decoration: none;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.dropdown-item:hover {
  background-color: #f5f5f5;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

@media (max-width: 915px) {
  .app-header {
    flex-wrap: wrap;
    padding: 15px 10px;
    row-gap: 5px; 
  }
  h1 { order: 1; font-size: 1.5rem; }
  .logo { height: 45px; }
  .logo-link { margin-right: auto; }
  .header-icons { order: 2; }
  form.search-container { order: 3; width: 100%; max-width: none; margin-top: 10px; }
}

@media (max-width: 480px) {
  h1 { font-size: 1.3rem; }
  .logo { height: 40px; }
  .user-button { padding: 4px 8px; }
  .header-icons { gap: 8px; }
}
</style>