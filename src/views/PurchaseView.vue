<template>
  <div class="purchase-page">
    <div v-if="subasta" class="purchase-container">
      <h1 class="main-title">{{ t('purchaseView.title') }}</h1>
      
      <div class="purchase-content">
        <!-- Columna Izquierda: Resumen de la Subasta -->
        <div class="auction-summary">
          <h2>{{ t('purchaseView.auctionDetails') }}</h2>
          <img :src="backendUrl + subasta.imagen" :alt="subasta.titulo" class="auction-image">
          <h3>{{ subasta.titulo }}</h3>
          <ul class="details-list">
            <li>
              <span>{{ t('purchaseView.seller') }}:</span>
              <strong>{{ subasta.vendedor?.nombre }}</strong>
            </li>
            <li class="final-price">
              <span>{{ t('purchaseView.finalPrice') }}:</span>
              <strong>{{ formatCurrency(finalPrice) }}</strong>
            </li>
          </ul>
        </div>

        <!-- Columna Derecha: Detalles de Pago y Acción -->
        <div class="payment-details">
          <h2>{{ t('purchaseView.selectPaymentMethod') }}</h2>
          
          <div v-if="savedCards.length > 0" class="card-selection">
            <label v-for="card in savedCards" :key="card.id" class="card-option" :class="{ selected: card.id === selectedCardId }">
              <input type="radio" :id="'card-' + card.id" :value="card.id" v-model="selectedCardId" name="payment-method">
              <img :src="getCardIcon(card.number)" class="card-icon" alt="card icon"/>
              <div class="card-info">
                <span>**** **** **** {{ card.number.slice(-4) }}</span>
                <span class="card-expiry">{{ card.expiry }}</span>
              </div>
            </label>
          </div>
          
          <p v-else class="no-cards-message">
            {{ t('purchaseView.noMethods') }}
          </p>
          
          <button @click="confirmPurchase" class="btn-confirm" :disabled="!canConfirm">
            {{ t('purchaseView.confirmPurchaseBtn') }}
          </button>
        </div>
      </div>
    </div>
    
    <div v-else class="loading-container">
      <p>{{ t('catalog.loading') }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../store/auth';
import { useSubastasStore } from '../store/subastas';
import { useI18n } from 'vue-i18n';
import Swal from 'sweetalert2';

// --- Inicialización ---
const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const subastasStore = useSubastasStore();
const { t } = useI18n();
const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

// --- Estado del Componente ---
const subastaId = ref(route.params.id);
const selectedCardId = ref(null);

// --- Propiedades Computadas ---
const subasta = computed(() => subastasStore.getSubastaById(subastaId.value));
const savedCards = computed(() => authStore.currentUser?.paymentMethods || []);
const finalPrice = computed(() => subasta.value?.ganador?.monto || 0);
const canConfirm = computed(() => selectedCardId.value !== null);

// --- Métodos ---
const formatCurrency = (value) => {
  if (typeof value !== 'number') return 'N/A';
  return new Intl.NumberFormat('es-CR', { 
    style: 'currency', 
    currency: 'CRC', 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  }).format(value);
};

const getCardIcon = (cardNumber) => {
  if (cardNumber.startsWith('4')) return '/icons/visa.svg';
  if (cardNumber.startsWith('5')) return '/icons/mastercard.svg';
  return '/icons/credit-card.svg';
};

const handleNoCards = () => {
  Swal.fire({
    icon: 'warning',
    title: t('purchaseView.noMethods'),
    text: t('purchaseView.addMethodPrompt'),
    confirmButtonText: t('purchaseView.goToProfile'),
    showCancelButton: true,
    cancelButtonText: 'Cerrar'
  }).then((result) => {
    if (result.isConfirmed) {
      // Idealmente, aquí abrirías el modal de perfil o redirigirías.
      // Por ahora, redirigimos al home como fallback.
      router.push('/'); 
    }
  });
};

const confirmPurchase = async () => {
  if (!canConfirm.value) return;

  const result = await Swal.fire({
    title: t('purchaseView.confirmPurchaseTitle'),
    text: t('purchaseView.confirmPurchaseText', { amount: formatCurrency(finalPrice.value) }),
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Sí, confirmar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#4CAF50',
  });

  if (result.isConfirmed) {
    Swal.fire({
      title: t('purchaseView.processing'),
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    // Simular una llamada a la API de pago
    setTimeout(async () => {
      // Aquí iría la lógica para marcar la subasta como "pagada" en el backend
      // await subastasStore.markAsPaid(subastaId.value);

      await Swal.fire({
        icon: 'success',
        title: t('purchaseView.purchaseSuccessTitle'),
        text: t('purchaseView.purchaseSuccessText'),
        timer: 3000,
        showConfirmButton: false
      });

      router.push('/');
    }, 2000);
  }
};

// --- Hook de Ciclo de Vida ---
onMounted(() => {
  // Si la subasta no está en el store (ej. se recargó la página), la busca.
  if (!subasta.value) {
    subastasStore.fetchSubastas();
  }
  
  // Comprobar si hay tarjetas guardadas al cargar el componente.
  if (savedCards.value.length === 0) {
    handleNoCards();
  } else {
    // Seleccionar la primera tarjeta por defecto
    selectedCardId.value = savedCards.value[0].id;
  }
});
</script>

<style scoped>
.purchase-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 2rem;
}

.purchase-container {
  width: 100%;
  max-width: 900px;
  background-color: #fff;
  border-radius: 16px;
  box-shadow: 0 8px 30px rgba(0,0,0,0.1);
  padding: 2rem;
}

.main-title {
  text-align: center;
  font-size: 2rem;
  font-weight: 700;
  color: #3E2723;
  margin-bottom: 2rem;
}

.purchase-content {
  display: flex;
  gap: 2rem;
}

.auction-summary, .payment-details {
  flex: 1;
}

.auction-summary h2, .payment-details h2 {
  font-size: 1.2rem;
  font-weight: 600;
  color: #5D4037;
  border-bottom: 1px solid #eee;
  padding-bottom: 0.5rem;
  margin-bottom: 1rem;
}

.auction-image {
  width: 100%;
  aspect-ratio: 16 / 10;
  object-fit: cover;
  border-radius: 12px;
  margin-bottom: 1rem;
}

.auction-summary h3 {
  font-size: 1.5rem;
  color: #3E2723;
  margin: 0 0 1rem 0;
}

.details-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.details-list li {
  display: flex;
  justify-content: space-between;
  font-size: 1rem;
  color: #616161;
  margin-bottom: 0.5rem;
}

.details-list li strong {
  color: #3E2723;
  font-weight: 600;
}

.final-price {
  font-size: 1.2rem !important;
  font-weight: bold;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
}

.card-selection {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.card-option {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 2px solid #ddd;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.card-option:hover {
  border-color: #A1887F;
}

.card-option.selected {
  border-color: #1976d2;
  background-color: #e3f2fd;
  box-shadow: 0 2px 8px rgba(25, 118, 210, 0.2);
}

.card-option input[type="radio"] {
  display: none;
}

.card-icon {
  width: 40px;
}

.card-info {
  display: flex;
  flex-direction: column;
  font-family: 'Courier New', monospace;
}

.card-expiry {
  font-size: 0.8rem;
  color: #777;
}

.no-cards-message {
  text-align: center;
  padding: 1.5rem;
  background-color: #fff9c4;
  border: 1px solid #fdd835;
  border-radius: 8px;
  color: #555;
}

.btn-confirm {
  width: 100%;
  padding: 1rem;
  margin-top: 2rem;
  border: none;
  border-radius: 8px;
  background-color: #4CAF50;
  color: white;
  font-size: 1.2rem;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-confirm:hover:not(:disabled) {
  background-color: #388E3C;
}

.btn-confirm:disabled {
  background-color: #9E9E9E;
  cursor: not-allowed;
}

.loading-container {
  text-align: center;
}

@media (max-width: 768px) {
  .purchase-content {
    flex-direction: column;
  }
}
</style>