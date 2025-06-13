<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="status-container">
      <header class="status-header">
        <h1>{{ t('profile.auction_status') }}</h1>
        <button @click="$emit('close')" class="back-button" :aria-label="t('createAuction.goBack')">
          <img src="/icons/regresar.svg" alt="Cerrar">
        </button>
      </header>
      <main class="status-content">
        <div v-if="subastasStore.isMyAuctionsLoading" class="loader">{{ t('catalog.loading') }}</div>
        <ul v-else-if="subastasStore.myAuctions.length > 0" class="auction-list">
          <li v-for="subasta in subastasStore.myAuctions" :key="subasta.id" class="auction-item">
            <img :src="backendUrl + (subasta.imagen || '/img/placeholder.jpg')" alt="" class="item-image">
            <div class="item-info">
              <span class="item-title">{{ subasta.titulo }}</span>
              <span class="item-price">{{ formatCurrency(subasta.precioInicial) }}</span>
            </div>
            <span :class="['status-badge', getStatusClass(subasta.estado)]">
              {{ t(`auctionStatus.${subasta.estado?.toLowerCase() || 'desconocido'}`) }}
            </span>
          </li>
        </ul>
        <div v-else class="no-auctions">
          <p>{{ t('auctionStatus.no_auctions_published') }}</p>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useSubastasStore } from '../store/subastas';
import { useAuthStore } from '../store/auth';
import { useI18n } from 'vue-i18n';

const emit = defineEmits(['close']);
const { t } = useI18n();
const subastasStore = useSubastasStore();
const authStore = useAuthStore();
const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

onMounted(() => {
  const sellerName = authStore.activeProfileData?.nombre || authStore.activeProfileData?.nombreCompleto;
  if (sellerName) {
    subastasStore.fetchMyAuctions(sellerName);
  }
});

const getStatusClass = (status) => {
  if (!status) return '';
  switch (status.toLowerCase()) {
    case 'activa': return 'status-active';
    case 'pendiente': return 'status-pending';
    case 'finalizada': return 'status-finished';
    case 'rechazada': return 'status-rejected'; 
    case 'cancelada': return 'status-cancelled'; 
    default: return 'status-unknown';
  }
};

const formatCurrency = (value) => {
  if (typeof value !== 'number') return 'N/A';
  return new Intl.NumberFormat('es-CR', { 
    style: 'currency', 
    currency: 'CRC', 
    minimumFractionDigits: 0, 
    maximumFractionDigits: 0 
  }).format(value);
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}
.status-container {
  width: 90%;
  max-width: 600px;
  background: #F9F6F2;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  max-height: 80vh;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
}
.status-header {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #D7CCC8;
  position: relative;
  flex-shrink: 0;
}
.status-header h1 { 
  font-size: 1.5rem; 
  color: #3E2723; 
  margin: 0; 
}
.back-button { 
  position: absolute; 
  right: 1rem;
  background-color: transparent; 
  border: none;                
  padding: 0;                 
  cursor: pointer;             
  display: flex;                
  align-items: center;
  justify-content: center;
}
.back-button:focus, .back-button:focus-visible {
  outline: none;
}
.back-button img {
  width: 28px; 
  height: 28px;
}
.status-content { 
  padding: 1rem; 
  overflow-y: auto; 
}
.auction-list { 
  list-style: none; 
  padding: 0; 
  margin: 0; 
}
.auction-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.8rem;
  border-bottom: 1px solid #EAE3E0;
}
.auction-item:last-child {
  border-bottom: none;
}
.item-image { 
  width: 50px; 
  height: 50px; 
  border-radius: 8px; 
  object-fit: cover; 
  background-color: #e0e0e0;
}
.item-info { 
  flex-grow: 1; 
  display: flex; 
  flex-direction: column; 
}
.item-title { 
  font-weight: 600; 
  color: #3E2723;
}
.item-price { 
  font-size: 0.9rem; 
  color: #8D6E63; 
}
.status-badge {
  padding: 0.3rem 0.8rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: bold;
  color: white;
  text-transform: capitalize;
  white-space: nowrap;
}
.status-active { background-color: #4CAF50; }
.status-pending { background-color: #FFC107; color: #333; }
.status-finished { background-color: #757575; }
.status-rejected { background-color: #c0392b; }
.status-cancelled { background-color: #f44336; }
.status-unknown { background-color: #9E9E9E; }
.no-auctions { 
  text-align: center; 
  padding: 2rem; 
  color: #8D6E63; 
}
.loader {
  text-align: center;
  padding: 2rem;
  color: #8D6E63;
}
</style>