<template>
  <div v-if="subastaData" class="subasta-details">
    <div class="main-content">
      <!-- Columna Izquierda: Galería de Imágenes -->
      <div class="image-gallery">
        <img :src="backendUrl + mainImage" :alt="subastaData.titulo" class="main-image">
        <div v-if="subastaData.imagenes && subastaData.imagenes.length > 1" class="thumbnail-strip">
          <img
            v-for="(img, index) in subastaData.imagenes"
            :key="index"
            :src="backendUrl + img"
            :alt="t('auctionDetails.imageAlt', { index: index + 1 })"
            :class="{ active: img === mainImage }"
            @click="setMainImage(img)"
            class="thumbnail"
          />
        </div>
      </div>

      <!-- Columna Derecha: Información y Acciones -->
      <div class="info-panel">
        <h2 class="title">{{ subastaData.titulo }}</h2>
        <p class="description">{{ subastaData.descripcion }}</p>
        
        <div class="countdown-timer">
          <h4>{{ t('auctionDetails.remainingTime') }}</h4>
          <div class="time-display">{{ tiempoRestante }}</div>
        </div>
        
        <div class="price-info">
          <div class="price-item">
            <span class="label">{{ t('auctionDetails.basePrice') }}</span>
            <span class="value">{{ formatCurrency(subastaData.precioInicial) }}</span>
          </div>
          <div class="price-item current-bid">
            <span class="label">{{ t('auctionDetails.currentBid') }}</span>
            <span class="value">{{ formatCurrency(pujaMinima) }}</span>
          </div>
        </div>
        <div v-if="isWinner" class="winner-actions-view">
          <h3>{{ t('auctionDetails.winnerCongratsTitle') }}</h3>
          <p class="winner-label">{{ t('auctionDetails.winningBidText') }}</p>
          <p class="winner-bid">{{ formatCurrency(subastaData.ganador.monto) }}</p>
          <button @click="handleProceedToPayment" class="btn-proceed-payment">
            {{ t('auctionDetails.proceedToPaymentButton') }}
          </button>
        </div>
        <div v-else-if="subastaData.estado === 'finalizada' && subastaData.ganador" class="winner-view">
          <h3>{{ t('auctionDetails.winnerTitle') }}</h3>
          <p class="winner-label">{{ t('auctionDetails.winnerText') }}</p>
          <p class="winner-name">{{ subastaData.ganador.nombrePujador }}</p>
          <p class="winner-bid">{{ formatCurrency(subastaData.ganador.monto) }}</p>
        </div>
        <div v-else-if="isOwner" class="owner-view">
          <h3>{{ t('auctionDetails.pendingBidsTitle') }}</h3>
          <ul v-if="topBids.length > 0" class="bids-list">
            <li v-for="(bid, index) in topBids" :key="index" class="bid-item">
              <div class="bid-info">
                <span class="bidder-name">{{ bid.nombrePujador }}</span>
                <span class="bid-amount">{{ formatCurrency(bid.monto) }}</span>
              </div>
              <button @click="handleAcceptBid(bid)" class="btn-accept-bid">
                {{ t('auctionDetails.acceptBid') }}
              </button>
            </li>
          </ul>
          <p v-else class="no-bids-text">{{ t('auctionDetails.noPendingBids') }}</p>
        </div>

        <!-- 4. VISTA PARA PUJADORES (si la subasta NO está finalizada y NO soy el dueño) -->
        <form v-else @submit.prevent="handlePuja" class="bid-form">
          <div class="input-group">
            <span class="currency-symbol">CRC</span>
            <input 
              type="number"
              v-model.number="nuevaPuja"
              :placeholder="`> ${formatCurrency(pujaMinima, false)}`"
              :disabled="!isBidAllowed"
              class="bid-input"
              :aria-label="t('auctionDetails.bidInputAria')"
            />
          </div>
          <button type="submit" class="bid-button" :disabled="!isBidAllowed">
            {{ getButtonText() }}
          </button>
          <p v-if="errorPuja" class="error-text">{{ errorPuja }}</p>
        </form>
      </div>
    </div>
    
    <!-- Cuadrícula de Especificaciones -->
    <div class="specs-grid">
      <div class="spec-item"><span class="label">{{ t('auctionDetails.specs.category') }}</span><span class="value">{{ subastaData.categoria }}</span></div>
      <div class="spec-item"><span class="label">{{ t('auctionDetails.specs.gender') }}</span><span class="value">{{ subastaData.genero }}</span></div>
      <div class="spec-item"><span class="label">{{ t('auctionDetails.specs.breed') }}</span><span class="value">{{ subastaData.raza }}</span></div>
      <div class="spec-item"><span class="label">{{ t('auctionDetails.specs.age') }}</span><span class="value">{{ subastaData.edad }}</span></div>
      <div class="spec-item"><span class="label">{{ t('auctionDetails.specs.weight') }}</span><span class="value">{{ subastaData.peso }}</span></div>
      <div class="spec-item"><span class="label">{{ t('auctionDetails.specs.genetics') }}</span><span class="value">{{ subastaData.genetica }}</span></div>
      <div class="spec-item">
        <span class="label">{{ t('auctionDetails.specs.seller') }}</span>
        <span class="value">{{ subastaData.vendedor?.nombre || t('auctionDetails.specs.notAvailable') }}</span>
      </div>
      <div class="spec-item">
        <span class="label">{{ subastaData.estado === 'finalizada' ? t('auctionDetails.specs.winner') : t('auctionDetails.specs.currentBidder') }}</span>
        <span class="value">{{ (subastaData.ganador?.nombrePujador) || subastaData.pujador?.nombre || t('auctionDetails.specs.notAvailable') }}</span>
      </div>
    </div>
    
    <!-- Sección del Administrador -->
    <div v-if="authStore.isAdmin && subastaData.esPendiente" class="admin-actions">
      <h3>{{ t('auctionDetails.adminActionsTitle') }}</h3>
      <button @click="handleApprove" class="btn-approve">{{ t('auctionDetails.approveButton') }}</button>
      <button @click="handleReject" class="btn-reject">{{ t('auctionDetails.rejectButton') }}</button>
    </div>
  </div>
  
  <div v-else class="error-message">
    <h2>{{ t('auctionDetails.loading') }}</h2>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useAuthStore } from '../store/auth';
import { useSubastasStore } from '../store/subastas';
import { useRouter } from 'vue-router';
import Swal from 'sweetalert2';
import { useI18n } from 'vue-i18n';
import SubastaService from '../services/subastaService';

// --- props, emits, etc. ---
const emit = defineEmits(['close']);
const { t } = useI18n(); 
const props = defineProps({
  subastaId: { type: [Number, String], required: true }
});

// --- Stores y refs ---
const authStore = useAuthStore();
const subastasStore = useSubastasStore();
const router = useRouter();
const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
const subastaData = computed(() => subastasStore.getSubastaById(props.subastaId));
const mainImage = ref('');
const tiempoRestante = ref('');
const subastaFinalizadaLocal = ref(false);
let timerInterval = null;
const nuevaPuja = ref(null);
const errorPuja = ref('');

// --- Propiedades Computadas ---
const pujaMinima = computed(() => subastaData.value ? (subastaData.value.puja || subastaData.value.precioInicial) : 0);

const isOwner = computed(() => {
  if (!authStore.isLoggedIn || !subastaData.value?.vendedor?.id || !authStore.currentUser?.id) {
    return false;
  }
  return authStore.currentUser.id === subastaData.value.vendedor.id;
});

const isWinner = computed(() => {
  if (!authStore.isLoggedIn || !subastaData.value || subastaData.value.estado !== 'finalizada' || !subastaData.value.ganador) {
    return false;
  }
  return authStore.currentUser.id === subastaData.value.ganador.usuarioId;
});

const isBidAllowed = computed(() => {
  return authStore.isLoggedIn && 
         subastaData.value?.estado === 'activa' && 
         !subastaFinalizadaLocal.value &&        
         !authStore.isAdmin && 
         !isOwner.value; 
});

const topBids = computed(() => {
  if (!subastaData.value?.historialPujas) return [];
  const history = [...subastaData.value.historialPujas].sort((a, b) => b.monto - a.monto);
  const uniqueBidders = history.reduce((acc, current) => {
    if (!acc.some(item => item.usuarioId === current.usuarioId)) {
      acc.push(current);
    }
    return acc;
  }, []);
  return uniqueBidders.slice(0, 3);
});


const handleProceedToPayment = () => {
  router.push({ name: 'Purchase', params: { id: props.subastaId } });
  emit('close');
};

const setMainImage = (imgUrl) => { mainImage.value = imgUrl; };

const calcularTiempoRestante = () => {
  if (subastaData.value?.estado === 'finalizada') {
    tiempoRestante.value = t('auctionDetails.btn.finished');
    subastaFinalizadaLocal.value = true;
    if(timerInterval) clearInterval(timerInterval);
    return;
  }
  const ahora = new Date();
  const fechaFinal = new Date(subastaData.value.fechaFinal);
  const diferencia = fechaFinal - ahora;
  if (diferencia <= 0) {
    tiempoRestante.value = t('auctionDetails.btn.finished');
    subastaFinalizadaLocal.value = true;
    clearInterval(timerInterval);
  } else {
    subastaFinalizadaLocal.value = false;
    const d = Math.floor(diferencia / 86400000);
    const h = Math.floor((diferencia % 86400000) / 3600000);
    const m = Math.floor((diferencia % 3600000) / 60000);
    const s = Math.floor((diferencia % 60000) / 1000);
    tiempoRestante.value = `${d}d ${h}h ${m}m ${s}s`;
  }
};

const handlePuja = async () => {
  if (!isBidAllowed.value) {
    const swalConfig = { willOpen: () => { const container = Swal.getContainer(); if (container) container.style.zIndex = '4000'; } };
    if (!authStore.isLoggedIn) {
      Swal.fire({ ...swalConfig, icon: 'warning', title: t('auctionDetails.bidErrorTitle'), text: t('auctionDetails.bidLoginRequired') });
      router.push('/login');
    } else if (authStore.isAdmin) {
      Swal.fire({ ...swalConfig, icon: 'info', title: t('auctionDetails.bidErrorTitle'), text: t('auctionDetails.adminCannotBid') });
    } else if (!authStore.activeProfileData) {
      Swal.fire({ ...swalConfig, icon: 'info', title: t('auctionDetails.bidProfileRequiredTitle'), text: t('auctionDetails.bidProfileRequiredText') });
    }
    return;
  }
  if (!nuevaPuja.value || nuevaPuja.value <= pujaMinima.value) {
    errorPuja.value = t('auctionDetails.bidError', { amount: formatCurrency(pujaMinima.value) });
    return;
  }
  const pujaMaxima = pujaMinima.value * 10;
  if (nuevaPuja.value > pujaMaxima && pujaMinima.value > 0) { 
    errorPuja.value = t('auctionDetails.bidMaxError', { amount: formatCurrency(pujaMaxima) });
    return;
  }
  errorPuja.value = '';
  try {
    const pujador = {
      id: authStore.currentUser.id,
      nombre: authStore.activeProfileData.nombre || authStore.activeProfileData.nombreCompleto
    };
    await subastasStore.placeBid({
      subastaId: subastaData.value.id,
      montoPuja: nuevaPuja.value,
      pujador: pujador
    });
    Swal.fire({
      icon: 'success', title: t('auctionDetails.bidSuccessTitle'), text: t('auctionDetails.bidSuccessText'),
      timer: 2000, showConfirmButton: false,
      willOpen: () => { const container = Swal.getContainer(); if (container) container.style.zIndex = '4000'; }
    });
    nuevaPuja.value = null;
  } catch (err) {
    errorPuja.value = err.message || t('auctionDetails.bidProcessError');
  }
};

async function handleAcceptBid(bid) {
  const swalConfig = {
    title: t('profile.delete_account_confirm_title'),
    text: `¿Deseas aceptar la puja de ${formatCurrency(bid.monto)} de ${bid.nombrePujador}? Esta acción finalizará la subasta.`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: t('auctionDetails.acceptBid'),
    cancelButtonText: t('profile.cancel'),
    willOpen: () => { const container = Swal.getContainer(); if (container) container.style.zIndex = '4000'; }
  };
  const result = await Swal.fire(swalConfig);
  if (result.isConfirmed) {
    try {
      const winnerData = {
        usuarioId: bid.usuarioId,
        nombrePujador: bid.nombrePujador,
        monto: bid.monto
      };
      await SubastaService.finalizeAuction(props.subastaId, winnerData);
      await Swal.fire({
        icon: 'success', title: '¡Subasta Finalizada!', text: 'Has seleccionado un ganador.',
        willOpen: () => { const container = Swal.getContainer(); if (container) container.style.zIndex = '4000'; }
      });
      await subastasStore.fetchSubastas();
    } catch (error) {
      await Swal.fire({
        icon: 'error', title: t('profile.error'), text: 'No se pudo finalizar la subasta.',
        willOpen: () => { const container = Swal.getContainer(); if (container) container.style.zIndex = '4000'; }
      });
    }
  }
}

const getButtonText = () => {
  if (subastaData.value?.estado === 'finalizada') return t('auctionDetails.btn.finished');
  if (subastaFinalizadaLocal.value && !isOwner.value) return t('auctionDetails.btn.finished');
  if (!authStore.isLoggedIn) return t('auctionDetails.btn.loginToBid');
  if (authStore.isAdmin) return t('auctionDetails.btn.placeBid');
  if (!authStore.activeProfileData) return t('auctionDetails.btn.profileRequired');
  if (isOwner.value) return 'Gestionar Pujas';
  return t('auctionDetails.btn.placeBid');
};

const formatCurrency = (value, useSymbol = true) => {
  if (typeof value !== 'number') return '';
  return new Intl.NumberFormat('es-CR', {
    style: useSymbol ? 'currency' : 'decimal',
    currency: 'CRC',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const handleApprove = async () => {
  await subastasStore.approveAuction(props.subastaId);
  emit('close');
};

const handleReject = async () => {
  await subastasStore.rejectAuction(props.subastaId);
  emit('close');
};

// --- Hooks de Ciclo de Vida ---
watch(subastaData, (newData) => {
  if (newData) {
    mainImage.value = newData.imagen || newData.imagenes?.[0] || '/img/placeholder.jpg';
    calcularTiempoRestante();
  }
}, { immediate: true, deep: true });

onMounted(() => {
  if (subastaData.value) {
    calcularTiempoRestante();
    if (subastaData.value.estado === 'activa') {
      timerInterval = setInterval(calcularTiempoRestante, 1000);
    }
  }
});

onUnmounted(() => { if (timerInterval) clearInterval(timerInterval); });

</script>

<style scoped>
.subasta-details { font-family: 'Segoe UI', sans-serif; color: #3E2723; }
.main-content { display: flex; flex-direction: row; gap: 30px; margin-bottom: 30px; }
.image-gallery { flex: 1.2; }
.main-image { width: 100%; border-radius: 12px; background-color: #f0f0f0; aspect-ratio: 4 / 3; object-fit: cover; }
.thumbnail-strip { display: flex; gap: 10px; margin-top: 10px; flex-wrap: wrap; }
.thumbnail { width: 80px; height: 60px; object-fit: cover; border-radius: 6px; cursor: pointer; border: 2px solid transparent; transition: border-color 0.2s; }
.thumbnail.active { border-color: #8D6E63; }
.info-panel { flex: 1; display: flex; flex-direction: column; }
.title { font-size: 2rem; font-weight: 700; color: #5D4037; margin: 0 0 10px 0; }
.description { font-size: 1rem; line-height: 1.6; color: #616161; margin-bottom: 20px; }
.countdown-timer { background-color: #f5f5f5; border-radius: 8px; padding: 15px; text-align: center; margin-bottom: 20px; }
.countdown-timer h4 { margin: 0 0 10px 0; font-size: 0.9rem; color: #8D6E63; text-transform: uppercase; letter-spacing: 1px; }
.time-display { font-size: 1.8rem; font-weight: 700; color: #5D4037; }
.price-info { display: flex; gap: 20px; margin-bottom: 20px; }
.price-item { flex: 1; padding: 15px; border: 1px solid #e0e0e0; border-radius: 8px; text-align: center; }
.price-item .label { display: block; font-size: 0.9rem; color: #8D6E63; margin-bottom: 5px; }
.price-item .value { font-size: 1.2rem; font-weight: 600; }
.current-bid { border-color: #8D6E63; background-color: #fdfaf7; }
.current-bid .value { color: #5D4037; }
.bid-form { margin-top: auto; display: flex; flex-direction: column; gap: 10px; }
.input-group { display: flex; align-items: center; border: 1px solid #D7CCC8; border-radius: 8px; overflow: hidden; transition: border-color 0.2s; }
.input-group:focus-within { border-color: #8D6E63; }
.currency-symbol { padding: 0 15px; font-weight: 600; background-color: #f5f5f5; color: #757575; align-self: stretch; display: flex; align-items: center; }
.bid-input { width: 100%; border: none; padding: 12px 15px; font-size: 1.1rem; font-weight: 500; outline: none; }
.bid-input:disabled { background-color: #eeeeee; cursor: not-allowed; }
.bid-button { width: 100%; padding: 15px; border: none; border-radius: 8px; background-color: #A85B2C; color: white; font-size: 1.2rem; font-weight: 700; cursor: pointer; transition: background-color 0.2s, opacity 0.2s; }
.bid-button:hover:not(:disabled) { background-color: #5C3218; }
.bid-button:disabled { background-color: #A1887F; cursor: not-allowed; opacity: 0.7; }
.error-text { color: #c0392b; font-size: 0.9rem; text-align: center; margin-top: 5px; min-height: 1.2em; }
.specs-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 15px; background-color: #f5f5f5; padding: 20px; border-radius: 8px; }
.spec-item { display: flex; flex-direction: column; }
.spec-item .label { font-size: 0.8rem; color: #A1887F; text-transform: uppercase; }
.spec-item .value { font-size: 1rem; font-weight: 600; }
.error-message { text-align: center; padding: 40px; }
.admin-actions { margin-top: 30px; padding: 20px; border-top: 1px solid #e0e0e0; background-color: #fff9c4; border-radius: 8px; display: flex; flex-direction: column; align-items: center; gap: 10px; }
.admin-actions h3 { margin: 0 0 10px; color: #5D4037; }
.admin-actions button { width: 200px; padding: 10px; border: none; border-radius: 6px; color: white; font-weight: bold; cursor: pointer; }
.btn-approve { background-color: #4CAF50; }
.btn-reject { background-color: #f44336; }
.owner-view { margin-top: 20px; padding: 15px; background-color: #fdfaf7; border: 1px solid #e0e0e0; border-radius: 8px; }
.owner-view h3 { margin-top: 0; margin-bottom: 15px; color: #5D4037; text-align: center; }
.bids-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px; }
.bid-item { display: flex; justify-content: space-between; align-items: center; padding: 10px; background-color: #fff; border-radius: 6px; border: 1px solid #eee; }
.bid-info { display: flex; flex-direction: column; }
.bidder-name { font-weight: 600; color: #3E2723; }
.bid-amount { color: #A85B2C; font-size: 1.1rem; }
.btn-accept-bid { padding: 8px 15px; border: none; background-color: #4CAF50; color: white; border-radius: 6px; cursor: pointer; transition: background-color 0.2s; }
.btn-accept-bid:hover:not(:disabled) { background-color: #388E3C; }
.btn-accept-bid:disabled { background-color: #9E9E9E; cursor: not-allowed; }
.no-bids-text { text-align: center; color: #8D6E63; padding: 10px 0; }

.winner-actions-view {
  margin-top: 20px;
  padding: 20px;
  background-color: #e3f2fd;
  border: 1px solid #90caf9;
  border-radius: 8px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
.winner-actions-view h3 {
  margin: 0;
  color: #1565c0;
  font-size: 1.4rem;
}
.winner-actions-view .winner-label {
  font-size: 0.9rem;
  color: #555;
  margin: 0;
}
.winner-actions-view .winner-bid {
  font-size: 1.5rem;
  font-weight: 700;
  color: #0d47a1;
  margin: 0 0 10px 0;
}
.btn-proceed-payment {
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 8px;
  background-color: #1976d2;
  color: white;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 0.2s;
}
.btn-proceed-payment:hover {
  background-color: #1565c0;
}

.winner-view {
  margin-top: 20px;
  padding: 20px;
  background-color: #e8f5e9;
  border: 1px solid #a5d6a7;
  border-radius: 8px;
  text-align: center;
}
.winner-view h3 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #2e7d32;
  font-size: 1.4rem;
}
.winner-view .winner-label {
  font-size: 0.9rem;
  color: #666;
  margin: 0;
}
.winner-view .winner-name {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1b5e20;
  margin: 5px 0 10px 0;
}
.winner-view .winner-bid {
  font-size: 1.2rem;
  font-weight: 600;
  color: #388e3c;
  margin: 0;
}

@media (max-width: 768px) {
  .main-content { flex-direction: column; }
}
</style>