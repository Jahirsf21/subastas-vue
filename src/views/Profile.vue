<template>
  <div class="account-page-background" @click.self="$emit('close')">
    <div class="account-container">
      <header class="account-header">
        <button @click="$emit('close')" class="back-button" aria-label="Cerrar">
          <img src="/icons/regresar.svg" alt="Cerrar" class="icon-img-header">
        </button>
        <h1 class="account-title">{{ t('profile.title') }}</h1>
      </header>

      <main class="account-content">
        <!-- VISTA CUANDO NO ESTÁ LOGUEADO -->
        <template v-if="!isLoggedIn">
          <div class="section">
            <button @click="goToLogin" class="list-item interactive" aria-label="Iniciar sesión">
              <div class="item-content">
                <img src="/icons/logoCuenta.svg" alt="" class="item-icon">
                <span>{{ t('profile.session') }}</span>
              </div>
              <div class="right-icon-container">
                <img src="/icons/plus.svg" alt="" class="icon-img-action">
              </div>
            </button>
          </div>
          <div class="section">
            <button @click="goToCreateAccount" class="list-item interactive">
              <div class="item-content">
                <img src="/icons/logoAgregar.svg" alt="" class="item-icon">
                <span>{{ t('profile.create_account') }}</span>
              </div>
              <div class="right-icon-container">
                  <img src="/icons/row.svg" alt="" class="arrow-icon">
              </div>
            </button>
          </div>
          <div class="section">
            <h2 class="section-title">{{ t('profile.general') }}</h2>
            <!-- CORRECCIÓN AQUÍ: Convertido a etiqueta <a> para enlace externo -->
            <a 
              href="https://api.whatsapp.com/send/?phone=%2B50662116383&text&type=phone_number&app_absent=0" 
              target="_blank" 
              rel="noopener noreferrer" 
              class="list-item interactive"
            >
              <div class="item-content">
                <img src="/icons/help.svg" alt="" class="item-icon">
                <span>{{ t('profile.help') }}</span>
              </div>
              <div class="right-icon-container">
                  <img src="/icons/row.svg" alt="" class="arrow-icon">
              </div>
            </a>
          </div>
        </template>

        <!-- VISTA CUANDO ESTÁ LOGUEADO -->
        <template v-else>
          <div class="section">
            <h2 class="section-title">{{ t('profile.your_accounts') }}</h2>
            <div v-if="user.perfilPersonal" class="list-item profile-item" :class="{ active: authStore.activeProfile === 'Personal' }" @click="switchProfile('Personal')">
              <div class="item-content">
                <img src="/icons/perfilPersonal.svg" alt="" class="item-icon">
                <span>{{ user.perfilPersonal.nombreCompleto }}</span>
              </div>
              <div class="right-icon-container">
                  <div v-if="authStore.activeProfile === 'Personal'" class="active-indicator" title="Perfil activo"></div>
              </div>
            </div>
            <div v-if="user.perfilGanaderia" class="list-item profile-item" :class="{ active: authStore.activeProfile === 'Ganaderia' }" @click="switchProfile('Ganaderia')">
              <div class="item-content">
                <img src="/icons/perfilGanadero.svg" alt="" class="item-icon">
                <span>{{ user.perfilGanaderia.nombre }}</span>
              </div>
              <div class="right-icon-container">
                  <div v-if="authStore.activeProfile === 'Ganaderia'" class="active-indicator" title="Perfil activo"></div>
              </div>
            </div>
            <div v-if="canAddProfile" class="list-item interactive" @click="goToAddProfile">
               <div class="item-content">
                 <img src="/icons/logoAgregar.svg" alt="" class="item-icon">
                 <span>{{ t('profile.add_account') }}</span>
               </div>
               <div class="right-icon-container">
                  <button class="action-icon">
                      <img src="/icons/plus.svg" alt="Agregar cuenta" class="icon-img-action">
                  </button>
               </div>
            </div>
          </div>
          <div class="section">
            <h2 class="section-title">{{ t('profile.general') }}</h2>
            <button class="list-item interactive" @click="openPaidMethodModal">
              <div class="item-content">
                <img src="/icons/paymethod.svg" alt="" class="item-icon">
                <span>{{ t('profile.payment_methods') }}</span>
              </div>
              <div class="right-icon-container">
                  <img src="/icons/row.svg" alt="" class="arrow-icon">
              </div>
            </button>
            <button v-if="hasMultipleProfiles" class="list-item interactive" @click="switchProfileDialog">
              <div class="item-content">
                  <svg class="item-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  <span>{{ t('profile.switch_account') }}</span>
              </div>
              <div class="right-icon-container">
                  <img src="/icons/row.svg" alt="" class="arrow-icon">
              </div>
            </button>

            <button @click="openMyAuctionsModal" class="list-item interactive">
              <div class="item-content">
                <img src="/icons/estadosSubastas.svg" alt="" class="item-icon">
                <span>{{ t('profile.auction_status') }}</span>
              </div>
              <div class="right-icon-container">
                  <img src="/icons/row.svg" alt="" class="arrow-icon">
              </div>
            </button>
            <!-- CORRECCIÓN AQUÍ TAMBIÉN: Convertido a etiqueta <a> -->
            <a 
              href="https://api.whatsapp.com/send/?phone=%2B50662116383&text&type=phone_number&app_absent=0" 
              target="_blank" 
              rel="noopener noreferrer" 
              class="list-item interactive"
            >
              <div class="item-content">
                <img src="/icons/help.svg" alt="" class="item-icon">
                <span>{{ t('profile.help') }}</span>
              </div>
              <div class="right-icon-container">
                  <img src="/icons/row.svg" alt="" class="arrow-icon">
              </div>
            </a>
            <button @click="handleLogout" class="list-item interactive">
              <div class="item-content">
                <img src="/icons/logout.svg" alt="" class="item-icon">
                <span>{{ t('profile.logout') }}</span>
              </div>
              <div class="right-icon-container"></div>
            </button>
            <button @click="handleDeleteAccount" class="list-item interactive danger">
              <div class="item-content">
                 <img src="/icons/logoDelete.svg" alt="" class="item-icon">
                <span>{{ t('profile.delete_account') }}</span>
              </div>
              <div class="right-icon-container"></div>
            </button>
          </div>
        </template>
      </main>
    </div>
  </div>

  <transition name="fade">
    <PaidMethod v-if="showPaidMethodModal" @close="showPaidMethodModal = false" />
  </transition>

  <transition name="fade">
    <MyAuctionsStatus v-if="showMyAuctionsModal" @close="showMyAuctionsModal = false" />
  </transition>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useAuthStore } from '../store/auth';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import Swal from 'sweetalert2';
import PaidMethod from '../components/PaidMethod.vue';
import MyAuctionsStatus from '../components/MyAuctionsStatus.vue';

const emit = defineEmits(['close']);

const showMyAuctionsModal = ref(false); 

const openMyAuctionsModal = () => {
  showMyAuctionsModal.value = true;
};

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

const goToCreateAccount = () => {
  router.push('/SelectTypeAccount');
  emit('close');
};

const goToRoute = (route) => {
  router.push(route);
  emit('close');
};

const handleLogout = () => {
  authStore.logout();
  emit('close');
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
  const swalOptions = {
    willOpen: () => {
      const container = Swal.getContainer();
      if (container) {
        container.style.zIndex = '3000'; 
      }
    }
  };

  const { value: password } = await Swal.fire({
    ...swalOptions,
    title: t('profile.delete_account_confirm_title'),
    text: t('profile.delete_account_confirm_text'),
    icon: 'warning',
    input: 'password',
    inputLabel: t('profile.password'),
    inputPlaceholder: t('profile.enter_password'),
    showCancelButton: true,
    confirmButtonText: t('profile.delete'),
    cancelButtonText: t('profile.cancel'),
    confirmButtonColor: '#c0392b',
    preConfirm: (password) => {
      if (!password) {
        Swal.showValidationMessage(t('profile.password_required'))
      }
      return password
    }
  });

  if (password) {
    try {
      Swal.fire({
          ...swalOptions,
          title: t('profile.deleting_account'),
          didOpen: () => {
              Swal.showLoading()
          },
          allowOutsideClick: false,
          allowEscapeKey: false
      });

      await authStore.deleteAccount({
        email: user.value.email,
        password: password,
      });

      Swal.fire({
        ...swalOptions, 
        title: t('profile.delete_success_title'),
        text: t('profile.delete_success_text'),
        icon: 'success',
        timer: 2500,
        showConfirmButton: false
      });

      emit('close');

    } catch (error) {
      const errorMessage = error.response?.data?.message || t('profile.delete_error_generic');
      Swal.fire({
        ...swalOptions, 
        title: t('profile.delete_error_generic'),
        text: errorMessage,
        icon: 'error',
      });
      console.error("Error al eliminar la cuenta:", error);
    }
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
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-img-header {
  width: 28px;
  height: 28px;
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


.account-content > *:first-child .section, .account-content > *:first-child {
  border-top: none;
  padding-top: 0;
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

.list-item.interactive:hover, .profile-item:hover {
  background-color: #EAE3E0;
  cursor: pointer;
}

.profile-item.active {
  background-color: #e0d8d3;
  font-weight: bold;
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
}

.item-icon:not(img) {
  color: #5D4037;
  stroke-width: 2;
}

.action-icon {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.arrow-icon, .icon-img-action {
  width: 24px;
  height: 24px;
}

.right-icon-container {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.active-indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: #27ae60;
  border: 1px solid white;
}

/* Estilo para el botón de eliminar cuenta */
.list-item.danger {
  background-color: #fcebeb;
}
.list-item.danger:hover {
  background-color: #f9e0e2;
}
.list-item.danger .item-content {
  color: #c0392b;
}

a.list-item {
  all: unset;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 10px;
  width: 100%;
  text-decoration: none;
  border-radius: 8px;
  font-family: inherit;
  font-size: 1rem;
  color: #3E2723;
  line-height: 1.5;
  box-sizing: border-box;
}

a.list-item .item-content {
  color: #3E2723;
}

</style>