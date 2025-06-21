<template>
  <div class="account-page-background" @click.self="$emit('close')">
    <div class="account-container">
      <header class="account-header">
        <button @click="$emit('close')" class="back-button" :aria-label="t('paymentMethods.close_aria_label')">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
        </button>
        <h1 class="account-title">{{ t('paymentMethods.title') }}</h1>
      </header>
      <main class="account-content">
        <div class="section">
          <h2 class="section-title">{{ t('paymentMethods.savedCardsTitle') }}</h2>
          <div v-if="savedCards.length > 0">
            <div v-for="card in savedCards" :key="card.id" class="list-item">
              <div class="item-content">
                <img :src="getCardIcon(card.number)" class="card-icon" alt="card icon"/>
                <span>**** **** **** {{ card.number.slice(-4) }}</span>
                <span class="card-expiry">{{ card.expiry }}</span>
              </div>
              <button @click="removeCard(card.id)" class="delete-card-btn" :aria-label="t('paymentMethods.removeCardAriaLabel')">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>
            </div>
          </div>
          <p v-else class="no-cards-message">{{ t('paymentMethods.noCardsMessage') }}</p>
        </div>
        <div class="section">
          <h2 class="section-title">{{ t('paymentMethods.addCardTitle') }}</h2>
          <form @submit.prevent="addCard" class="card-form">
            <div class="form-group">
              <label for="card-number">{{ t('paymentMethods.cardNumberLabel') }}</label>
              <input id="card-number" type="text" v-model="newCard.number" :placeholder="t('paymentMethods.cardNumberPlaceholder')" required>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label for="card-expiry">{{ t('paymentMethods.expiryLabel') }}</label>
                <input id="card-expiry" type="text" v-model="newCard.expiry" :placeholder="t('paymentMethods.expiryPlaceholder')" required>
              </div>
              <div class="form-group">
                <label for="card-cvc">{{ t('paymentMethods.cvcLabel') }}</label>
                <input id="card-cvc" type="text" v-model="newCard.cvc" :placeholder="t('paymentMethods.cvcPlaceholder')" required>
              </div>
            </div>
            <button type="submit" class="btn-primary">{{ t('paymentMethods.addButton') }}</button>
          </form>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed } from 'vue';
import Swal from 'sweetalert2';
import { useI18n } from 'vue-i18n';
// CAMBIO: Rutas de importación corregidas
import { useAuthStore } from '../store/auth';
import UserService from '../services/userService';

const { t } = useI18n();
const authStore = useAuthStore();
defineEmits(['close']);

const savedCards = computed(() => authStore.currentUser?.paymentMethods || []);

const newCard = reactive({ number: '', expiry: '', cvc: '' });

const getCardIcon = (cardNumber) => {
  if (cardNumber.startsWith('4')) return '/icons/visa.svg';
  if (cardNumber.startsWith('5')) return '/icons/mastercard.svg';
  return '/icons/credit-card.svg';
};

const addCard = async () => {
  if (newCard.number.length < 16 || newCard.expiry.length < 5 || newCard.cvc.length < 3) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Por favor, completa todos los campos correctamente.',
      willOpen: () => { const container = Swal.getContainer(); if (container) container.style.zIndex = '3000'; }
    });
    return;
  }
  
  try {
    const response = await UserService.addPaymentMethod(authStore.currentUser.id, { ...newCard });
    authStore.updateUserData(response.data.user);

    newCard.number = '';
    newCard.expiry = '';
    newCard.cvc = '';

    Swal.fire({
      icon: 'success',
      title: '¡Éxito!',
      text: 'Tarjeta agregada correctamente.',
      timer: 2000,
      showConfirmButton: false,
      willOpen: () => { const container = Swal.getContainer(); if (container) container.style.zIndex = '3000'; }
    });
  } catch (error) {
    console.error("Error al agregar tarjeta:", error);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'No se pudo agregar la tarjeta.',
      willOpen: () => { const container = Swal.getContainer(); if (container) container.style.zIndex = '3000'; }
    });
  }
};

const removeCard = async (cardId) => {
  try {
    const response = await UserService.deletePaymentMethod(authStore.currentUser.id, cardId);
    authStore.updateUserData(response.data.user);
    
    Swal.fire({
      icon: 'success',
      title: '¡Eliminada!',
      text: 'La tarjeta ha sido eliminada.',
      timer: 2000,
      showConfirmButton: false,
      willOpen: () => { const container = Swal.getContainer(); if (container) container.style.zIndex = '3000'; }
    });
  } catch (error) {
    console.error("Error al eliminar tarjeta:", error);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'No se pudo eliminar la tarjeta.',
      willOpen: () => { const container = Swal.getContainer(); if (container) container.style.zIndex = '3000'; }
    });
  }
};
</script>

<style scoped>
/* Los estilos no necesitan cambios */
.account-page-background {
  position: fixed;
  inset: 0;
  background-color: rgba(0,0,0,0.6);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2001;
  font-family: 'Segoe UI', sans-serif;
}
.account-container { max-width: 500px; background-color: #F9F6F2; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); display: flex; flex-direction: column; width: 100%; }
.account-header { display: flex; align-items: center; padding: 16px 20px; gap: 16px; }
.back-button { background: none; border: none; cursor: pointer; padding: 0; color: #5D4037; }
.account-title { font-size: 1.5rem; font-weight: 700; color: #3E2723; margin: 0; }
.account-content { padding: 0 20px 20px; display: flex; flex-direction: column; gap: 20px; }
.section { border-top: 1px solid #D7CCC8; padding-top: 20px; }
.section-title { font-size: 1rem; font-weight: 600; color: #8D6E63; margin: 0 0 15px 0; text-transform: uppercase; }
.list-item { display: flex; align-items: center; justify-content: space-between; padding-bottom: 10px; margin-bottom: 5px; border-bottom: 1px solid #EAE3E0;}
.list-item:last-child { border-bottom: none; }
.item-content { display: flex; align-items: center; gap: 12px; font-family: 'Courier New', Courier, monospace; font-size: 1.1rem; }
.card-icon { width: 40px; }
.card-expiry { color: #888; font-size: 0.9rem; }
.delete-card-btn { background: none; border: none; color: #c0392b; cursor: pointer; padding: 5px; border-radius: 50%; }
.delete-card-btn:hover { background-color: #f5f5f5; }
.no-cards-message { color: #888; text-align: center; padding: 10px 0; }
.card-form { display: flex; flex-direction: column; gap: 15px; }
.form-group { display: flex; flex-direction: column; }
.form-row { display: flex; gap: 15px; }
.form-row .form-group { flex: 1; }
.card-form label { margin-bottom: 5px; font-weight: 600; font-size: 0.9rem; color: #5D4037; }
.card-form input {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #D7CCC8;
  border-radius: 8px;
  background-color: #fff;
  font-size: 1rem;
  box-sizing: border-box;
}
.btn-primary {
  padding: 12px; border-radius: 8px; border: none;
  background-color: #8D6E63; color: white; font-weight: 600;
  cursor: pointer; transition: background-color 0.2s;
}
.btn-primary:hover { background-color: #6D4C41; }
</style>