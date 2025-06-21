<template>
  <div class="modal-overlay" @click.self="handleBackOrClose">
    <div class="bids-container">
      <header class="bids-header">
        <h1>{{ selectedAuctionId ? t('auctionDetails.title') : t('myBids.title') }}</h1>
        <button @click="handleBackOrClose" class="back-button" :aria-label="t('createAuction.goBack')">
          <img src="/icons/regresar.svg" alt="Cerrar">
        </button>
      </header>
      <main class="bids-content">
        <SubastaDetails v-if="selectedAuctionId":subasta-id="selectedAuctionId"@close="handleDetailsClose"/>
        <template v-else>
          <div v-if="subastasStore.isMyBidsLoading" class="loader">{{ t('catalog.loading') }}</div>
          <ul v-else-if="subastasStore.myBids.length > 0" class="auction-list">
            <li v-for="puja in subastasStore.myBids" :key="puja.subastaId" class="auction-item auction-item-clickable" @click="handleAuctionClick(puja.subastaId)">
              <img :src="backendUrl + (puja.imagen)" alt="" class="item-image">
              <div class="item-info">
                <span class="item-title">{{ puja.titulo }}</span>
                <span class="item-price">{{ t('myBids.yourBid') }}: {{ formatCurrency(puja.miPuja) }}</span>
              </div>
              
              <span :class="['status-badge', getStatusClass(puja.estadoPuja)]">
                {{ t(`bidStatus.${puja.estadoPuja?.toLowerCase() || 'pendiente'}`) }}
              </span>
            </li>
          </ul>
          <div v-else class="no-auctions">
            <p>{{ t('myBids.noBidsPlaced') }}</p>
          </div>
        </template>
      </main>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import SubastaDetails from '../components/SubastaDetails.vue'; 
import { useSubastasStore } from '../store/subastas';
import { useAuthStore } from '../store/auth';
import { useI18n } from 'vue-i18n';

const selectedAuctionId = ref(null);

const emit = defineEmits(['close']);
const { t } = useI18n();
const subastasStore = useSubastasStore();
const authStore = useAuthStore();

const backendUrl = 'http://localhost:3000';

onMounted(() => {
  if (authStore.currentUser?.id) {
    subastasStore.fetchMyBids(authStore.currentUser.id);
  }
});

const handleAuctionClick = (subastaId) => {
  selectedAuctionId.value = subastaId;
};

const handleDetailsClose = () => {
  selectedAuctionId.value = null;

  if (authStore.currentUser?.id) {
    subastasStore.fetchMyBids(authStore.currentUser.id);
  }
};

const handleBackOrClose = () => {
  if (selectedAuctionId.value) {
    handleDetailsClose();
  } else {
    emit('close');
  }
};

const getStatusClass = (status) => {
  if (!status) return 'status-unknown';
  switch (status.toLowerCase()) {
    case 'aceptado': return 'status-accepted';
    case 'pendiente': return 'status-pending';
    case 'rechazado': return 'status-rejected';
    case 'cancelado': return 'status-cancelled';
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
  inset: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
}
.bids-container {
  /* CAMBIO: Hacemos el modal más grande para que quepan bien los detalles */
  width: 95%;
  max-width: 900px; /* Aumentado de 600px */
  background: #F9F6F2;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  max-height: 90vh; /* Aumentado de 80vh */
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  transition: max-width 0.3s ease; /* Transición suave */
}
.bids-header {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #D7CCC8;
  position: relative;
  flex-shrink: 0;
}
.bids-header h1 { 
  font-size: 1.5rem; 
  color: #3E2723; 
  margin: 0; 
  text-align: center;
}
.back-button { 
  position: absolute; 
  right: 1.5rem;
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
.bids-content { 
  padding: 1.5rem; 
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

.auction-item-clickable {
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;
  border-radius: 8px;
}
.auction-item-clickable:hover {
  background-color: #ECE7E3;
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
.status-accepted { background-color: #4CAF50; }
.status-pending { background-color: #FFC107; color: #333; }
.status-rejected { background-color: #f44336; }
.status-cancelled { background-color: #757575; }
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