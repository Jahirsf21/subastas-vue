<template>
  <div class="account-page-background" @click.self="$emit('close')">
    <div class="account-container">
      <header class="account-header">
        <button @click="$emit('close')" class="back-button" aria-label="Cerrar">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
        </button>
        <h1 class="account-title">{{ t('profile.title') }}</h1>
      </header>

      <main class="account-content">
        <!-- SECCIÓN DE SESIÓN -->
        <div class="section">
          <div class="list-item">
            <div class="item-content">
              <svg class="item-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="10" r="3"></circle><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662"></path></svg>
              <span v-if="isLoggedIn">{{ user.email }}</span>
              <span v-else>{{ t('profile.session') }}</span>
            </div>
            <button v-if="!isLoggedIn" @click="goToLogin" class="action-icon" aria-label="Iniciar sesión">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
            </button>
          </div>
        </div>

        <!-- SECCIÓN TUS CUENTAS -->
        <div class="section" v-if="isLoggedIn">
          <h2 class="section-title">{{ t('profile.your_accounts') }}</h2>
          <div v-if="user.perfilPersonal" class="list-item profile-item" :class="{ active: authStore.activeProfile === 'Personal' }" @click="switchProfile('Personal')">
            <div class="item-content">
              <svg class="item-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              <span>{{ user.perfilPersonal.nombreCompleto }}</span>
            </div>
            <div v-if="authStore.activeProfile === 'Personal'" class="active-indicator" title="Perfil activo"></div>
          </div>
          <div v-if="user.perfilGanaderia" class="list-item profile-item" :class="{ active: authStore.activeProfile === 'Ganaderia' }" @click="switchProfile('Ganaderia')">
            <div class="item-content">
              <svg class="item-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
              <span>{{ user.perfilGanaderia.nombre }}</span>
            </div>
            <div v-if="authStore.activeProfile === 'Ganaderia'" class="active-indicator" title="Perfil activo"></div>
          </div>
          <div v-if="canAddProfile" class="list-item interactive" @click="goToAddProfile">
             <div class="item-content">
               <svg class="item-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="17" y1="11" x2="23" y2="11"></line></svg>
               <span>{{ t('profile.add_account') }}</span>
             </div>
             <button class="action-icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg></button>
          </div>
        </div>

        <!-- SECCIÓN GENERAL -->
        <div class="section">
          <h2 class="section-title">{{ t('profile.general') }}</h2>
          <button v-if="isLoggedIn" class="list-item interactive" @click="openPaidMethodModal">
            <div class="item-content">
              <svg class="item-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
              <span>{{ t('profile.payment_methods') }}</span>
            </div>
            <svg class="arrow-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
          <button v-if="hasMultipleProfiles" class="list-item interactive" @click="switchProfileDialog">
            <div class="item-content">
                <svg class="item-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                <span>{{ t('profile.switch_account') }}</span>
            </div>
            <svg class="arrow-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
          <router-link to="" class="list-item interactive">
            <div class="item-content">
              <svg class="item-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
              <span>{{ t('profile.auction_status') }}</span>
            </div>
            <svg class="arrow-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </router-link>
          <router-link to="" class="list-item interactive">
            <div class="item-content">
              <svg class="item-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
              <span>{{ t('profile.help') }}</span>
            </div>
            <svg class="arrow-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </router-link>
          <button v-if="isLoggedIn" @click="handleLogout" class="list-item interactive">
            <div class="item-content">
              <svg class="item-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
              <span>{{ t('profile.logout') }}</span>
            </div>
          </button>
          <button v-if="isLoggedIn" @click="handleDeleteAccount" class="list-item interactive danger">
            <div class="item-content">
               <svg class="item-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
              <span>{{ t('profile.delete_account') }}</span>
            </div>
          </button>
        </div>
      </main>
    </div>
  </div>

  <transition name="fade">
    <PaidMethod v-if="showPaidMethodModal" @close="showPaidMethodModal = false" />
  </transition>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useAuthStore } from '../store/auth';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import Swal from 'sweetalert2';
import PaidMethod from '../components/PaidMethod.vue';

const emit = defineEmits(['close']);

const { t } = useI18n();
const authStore = useAuthStore();
const router = useRouter();

const showPaidMethodModal = ref(false);

const user = computed(() => authStore.currentUser);
const isLoggedIn = computed(() => authStore.isLoggedIn);

const canAddProfile = computed(() => {
  if (!isLoggedIn.value) return false;
  return !user.value?.perfilPersonal || !user.value?.perfilGanaderia;
});

const hasMultipleProfiles = computed(() => {
  if (!isLoggedIn.value) return false;
  return user.value?.perfilPersonal && user.value?.perfilGanaderia;
});

const goToLogin = () => {
  router.push('/login');
  emit('close');
};

const handleLogout = () => {
  authStore.logout();
};

const goToAddProfile = () => {
  if (!user.value) return;
  const route = !user.value.perfilPersonal ? '/registerPersonal' : '/registerGanaderia';
  router.push(route);
  emit('close');
};

const switchProfile = (profileType) => {
  authStore.setActiveProfile(profileType);
};

const switchProfileDialog = () => {
  const nextProfile = authStore.activeProfile === 'Personal' ? 'Ganaderia' : 'Personal';
  switchProfile(nextProfile);
};

const handleDeleteAccount = async () => {
  try {
    await authStore.deleteAccount();
  } catch (error) {
    console.error(error);
  }
};

const openPaidMethodModal = () => {
  showPaidMethodModal.value = true;
};
</script>

<style scoped>
.account-page-background {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  font-family: 'Segoe UI', sans-serif;
}

.account-container {
  width: 100%;
  max-width: 500px;
  background-color: #F9F6F2;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
}

.account-header {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  gap: 16px;
}

.back-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  color: #5D4037;
}

.account-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #3E2723;
  margin: 0;
}

.account-content {
  padding: 0 20px 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.section {
  border-top: 1px solid #D7CCC8;
  padding-top: 15px;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: #8D6E63;
  margin: 0 0 10px 0;
  text-transform: uppercase;
  padding-left: 10px;
}

.list-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 10px;
  width: 100%;
  background: none;
  border: none;
  text-align: left;
  text-decoration: none;
  border-radius: 8px;
}

.list-item.interactive {
  cursor: pointer;
  transition: background-color 0.2s;
}

.list-item.interactive:hover {
  background-color: #EAE3E0;
}

.profile-item.active {
  background-color: #e0d8d3;
  font-weight: bold;
}

.active-indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: #27ae60;
  border: 1px solid white;
}

.item-content {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 1rem;
  color: #3E2723;
}

.item-icon {
  width: 24px;
  height: 24px;
  color: #5D4037;
  stroke-width: 2;
}

.action-icon, .arrow-icon {
  color: #A1887F;
}

.action-icon svg, .arrow-icon svg {
  width: 24px;
  height: 24px;
}

.danger .item-content {
  color: #c0392b;
}
.danger .item-icon {
  color: #c0392b;
}
</style>