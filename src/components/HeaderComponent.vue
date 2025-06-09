<template>
  <header class="app-header">
    <h1><img src="../../public/logo.png" alt="Logo" class="logo" />{{ t('header.title') }}</h1>

    <div class="search-container">
      <input 
        type="text" 
        class="search-input" 
        :placeholder="t('header.searchPlaceholder')"
        v-model="searchQuery"
        @keyup.enter="performSearch"
      >
      <button class="search-button" @click="performSearch">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
      </button>
    </div>

    <div class="header-icons">
      <div class="language-menu-container">
        <button class="icon-button" @click="toggleLanguageMenu">
          <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#5D4037" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 0 20a15.3 15.3 0 0 1 0-20" />
          </svg>
        </button>
        <div v-if="showLanguageMenu" class="user-menu">
            <button @click="changeLanguage('es')" class="user-menu-item">Español</button>
            <button @click="changeLanguage('en')" class="user-menu-item">English</button>
            <button @click="changeLanguage('fr')" class="user-menu-item">Français</button>
            <button @click="changeLanguage('pt')" class="user-menu-item">Português</button>
            <button @click="changeLanguage('zh')" class="user-menu-item">中文</button>
        </div>
      </div>
      <div class="user-menu-container">
        <button class="user-button" @click="toggleUserMenu">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#5D4037" viewBox="0 0 24 24">
            <path d="M3 6h12v2H3V6zm0 5h12v2H3v-2zm0 5h8v2H3v-2z" />
          </svg>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#5D4037" viewBox="0 0 24 24">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
          </svg>
        </button>
        <div v-if="showUserMenu" class="user-menu">
          <template v-if="!authStore.isLoggedIn">
            <!-- Usamos t() para el menú de usuario -->
            <router-link to="/login" class="user-menu-item">{{ t('userMenu.login') }}</router-link>
            <router-link to="/register" class="user-menu-item">{{ t('userMenu.register') }}</router-link>
          </template>
          
          <template v-else>
            <router-link to="/profile" class="user-menu-item">{{ t('userMenu.profile') }}</router-link>
            <button @click="handleLogout" class="user-menu-item">{{ t('userMenu.logout') }}</button>
          </template>
        </div>
      </div>
    </div>
  </header>
</template>
  

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../store/auth';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n'; 

import { useSettingsStore } from '../store/settings';

const { t } = useI18n();

const authStore = useAuthStore();
const router = useRouter();

const settingsStore = useSettingsStore();

const showUserMenu = ref(false);
const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value;
  if (showLanguageMenu.value) showLanguageMenu.value = false;
};

const handleLogout = () => {
  authStore.logout();
  router.push('/login');
};

const searchQuery = ref('');

const performSearch = () => {
  if (searchQuery.value.trim() === '') {
    alert(t('header.searchAlert'));
    return;
  }
  alert(t('header.searching', { query: searchQuery.value }));
};

const showLanguageMenu = ref(false);

const toggleLanguageMenu = () => {
  showLanguageMenu.value = !showLanguageMenu.value;
  if (showUserMenu.value) showUserMenu.value = false;
};


const changeLanguage = (lang) => {
    settingsStore.setLanguage(lang);
    showLanguageMenu.value = false;
}
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

  .search-container {
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
  
  .search-container:focus-within {
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
  }

  .user-button {
    background-color: transparent;
    border: 2px solid #8D6E63;
    border-radius: 50px;
    padding: 6px 12px;
    display: flex;
    align-items: center;
    gap: 6px;
    cursor: pointer;
  }

  .logo {
    height: 60px;
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

  .user-menu-container,
  .language-menu-container {
    position: relative; 
    display: inline-block;
  }

  .user-menu {
    position: absolute;
    top: 100%;
    right: 0;
    background-color: white;
    border: 1px solid #ddd;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    min-width: 180px;
    z-index: 1000; 
    margin-top: 8px;
    overflow: hidden; 
  }

  .user-menu-item {
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

  .user-menu-item:hover {
    background-color: #f5f5f5;
  }

  @media (max-width: 915px) {
    .app-header {
      flex-wrap: wrap;
      padding: 15px 10px;
      row-gap: 5px; 
    }
    h1 { order: 1; font-size: 1.5rem; }
    .logo { height: 45px; margin-right: 10px; }
    .header-icons { order: 2; gap: 10px; margin-bottom: 5px; }
    .search-container { order: 3; width: 100%; max-width: none; }
  }

  @media (max-width: 768px) {
    
  }

  @media (max-width: 480px) {
    h1 { font-size: 1.3rem; }
    .logo { height: 40px; }
    .user-button { padding: 4px 8px; }
    .header-icons { gap: 8px; }
    .search-container { margin-top: 10px; }
  }
</style>