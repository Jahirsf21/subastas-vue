<template>
  <div v-if="subastaData" class="subasta-details">
    
    <div class="main-content">
      <div class="image-gallery">
        <img :src="mainImage" :alt="subastaData.titulo" class="main-image">
        <div v-if="subastaData.imagenes && subastaData.imagenes.length > 1" class="thumbnail-strip">
          <img
            v-for="(img, index) in subastaData.imagenes"
            :key="index"
            :src="img"
            :alt="`Vista ${index + 1}`"
            :class="{ active: img === mainImage }"
            @click="setMainImage(img)"
            class="thumbnail"
          />
        </div>
      </div>

      <div class="info-panel">
        <h2 class="title">{{ subastaData.titulo }}</h2>
        <p class="description">{{ subastaData.descripcion }}</p>
        
        <div class="countdown-timer">
          <h4>Tiempo restante</h4>
          <div class="time-display">{{ tiempoRestante }}</div>
        </div>
        
        <div class="price-info">
          <div class="price-item">
            <span class="label">Precio Base</span>
            <span class="value">{{ formatCurrency(subastaData.precioInicial) }}</span>
          </div>
          <div class="price-item current-bid">
            <span class="label">Puja Actual</span>
            <span class="value">{{ formatCurrency(pujaMinima) }}</span>
          </div>
        </div>
        
        <form @submit.prevent="handlePuja" class="bid-form">
          <div class="input-group">
            <span class="currency-symbol">CRC</span>
            <input 
              type="number"
              v-model.number="nuevaPuja"
              :placeholder="`> ${formatCurrency(pujaMinima, false)}`"
              :disabled="!authStore.isLoggedIn || subastaFinalizada"
              class="bid-input"
              aria-label="Monto de la puja"
            />
          </div>
          <button type="submit" class="bid-button" :disabled="!authStore.isLoggedIn || subastaFinalizada">
            {{ getButtonText() }}
          </button>
          <p v-if="errorPuja" class="error-text">{{ errorPuja }}</p>
        </form>
      </div>
    </div>
    
    <div class="specs-grid">
      <div class="spec-item"><span class="label">Categoría</span><span class="value">{{ subastaData.categoria }}</span></div>
      <div class="spec-item"><span class="label">Género</span><span class="value">{{ subastaData.genero }}</span></div>
      <div class="spec-item"><span class="label">Raza</span><span class="value">{{ subastaData.raza }}</span></div>
      <div class="spec-item"><span class="label">Edad</span><span class="value">{{ subastaData.edad }}</span></div>
      <div class="spec-item"><span class="label">Peso</span><span class="value">{{ subastaData.peso }}</span></div>
      <div class="spec-item"><span class="label">Genética</span><span class="value">{{ subastaData.genetica }}</span></div>
      <div class="spec-item">
        <span class="label">Vendedor</span>
        <span class="value">{{ subastaData.vendedor?.nombre || 'N/A' }}</span>
      </div>
      <div class="spec-item"><span class="label">Pujador Actual</span><span class="value">{{ subastaData.pujador || 'N/A' }}</span></div>
    </div>

  </div>
  
  <div v-else class="error-message">
    <h2>Cargando datos de la subasta...</h2>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useAuthStore } from '../store/auth';
import { useSubastasStore } from '../store/subastas';
import { useRouter } from 'vue-router';

const props = defineProps({
  subastaId: {
    type: [Number, String],
    required: true
  }
});

const authStore = useAuthStore();
const subastasStore = useSubastasStore();
const router = useRouter();

const subastaData = computed(() => {
  return subastasStore.getSubastaById(props.subastaId);
});

const mainImage = ref('');
const setMainImage = (imgUrl) => {
  mainImage.value = imgUrl;
};

const tiempoRestante = ref('');
const subastaFinalizada = ref(false);
let timerInterval = null;

const calcularTiempoRestante = () => {
  if (!subastaData.value?.fechaFinal) return;
  const ahora = new Date();
  const fechaFinal = new Date(subastaData.value.fechaFinal);
  const diferencia = fechaFinal - ahora;
  if (diferencia <= 0) {
    tiempoRestante.value = "Subasta Finalizada";
    subastaFinalizada.value = true;
    clearInterval(timerInterval);
    return;
  }
  const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
  const horas = Math.floor((diferencia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));
  const segundos = Math.floor((diferencia % (1000 * 60)) / 1000);
  tiempoRestante.value = `${dias}d ${horas}h ${minutos}m ${segundos}s`;
};

const nuevaPuja = ref(null);
const errorPuja = ref('');

const pujaMinima = computed(() => {
  if (!subastaData.value) return 0;
  return subastaData.value.puja || subastaData.value.precioInicial;
});

const handlePuja = async () => {
  if (subastaFinalizada.value) return;
  if (!authStore.isLoggedIn) {
    alert("Debes iniciar sesión para poder pujar.");
    router.push('/login');
    return;
  }
  if (!nuevaPuja.value || nuevaPuja.value <= pujaMinima.value) {
    errorPuja.value = `Tu puja debe ser mayor a ${formatCurrency(pujaMinima.value)}.`;
    return;
  }
  errorPuja.value = '';
  try {
    await subastasStore.placeBid({
      subastaId: subastaData.value.id,
      montoPuja: nuevaPuja.value,
      pujador: authStore.currentUser.user.nombre,
    });
    alert("¡Tu puja ha sido registrada con éxito!");
    nuevaPuja.value = null;
  } catch (error) {
    errorPuja.value = error.message || 'Hubo un error al procesar tu puja.';
  }
};

const getButtonText = () => {
  if (subastaFinalizada.value) return "Subasta Finalizada";
  if (!authStore.isLoggedIn) return "Iniciar Sesión para Pujar";
  return "Realizar Puja";
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

watch(subastaData, (newData) => {
  if (newData) {
    mainImage.value = newData.imagenes?.[0] || '/img/placeholder.jpg';
  }
}, { immediate: true });

onMounted(() => {
  if (subastaData.value) {
    calcularTiempoRestante();
    timerInterval = setInterval(calcularTiempoRestante, 1000);
  }
});

onUnmounted(() => {
  clearInterval(timerInterval);
});
</script>

<style scoped>
.subasta-details { font-family: 'Segoe UI', sans-serif; color: #3E2723; }
.main-content { display: flex; gap: 30px; margin-bottom: 30px; }
.image-gallery { flex: 1; }
.main-image { width: 100%; border-radius: 12px; background-color: #f0f0f0; aspect-ratio: 4 / 3; object-fit: cover; }
.thumbnail-strip { display: flex; gap: 10px; margin-top: 10px; }
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
.specs-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; background-color: #f5f5f5; padding: 20px; border-radius: 8px; }
.spec-item { display: flex; flex-direction: column; }
.spec-item .label { font-size: 0.8rem; color: #A1887F; text-transform: uppercase; }
.spec-item .value { font-size: 1rem; font-weight: 600; }
.error-message { text-align: center; padding: 40px; }
</style>