<template>
  <!-- El contenedor principal solo se renderiza si recibimos los datos -->
  <div v-if="subastaData" class="subasta-details">
    
    <!-- Sección de Imágenes y Tiempo -->
    <div class="main-content">
      <div class="image-gallery">
        <!-- Mostramos la imagen principal -->
        <img :src="mainImage" alt="Vista principal" class="main-image">
        <!-- Mostramos las miniaturas si hay más de una imagen -->
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
            <span class="value">{{ formatCurrency(subastaData.puja || subastaData.precioInicial) }}</span>
          </div>
        </div>
        
        <button class="bid-button">Realizar Puja</button>
      </div>
    </div>
    
    <!-- Sección de Especificaciones -->
    <div class="specs-grid">
      <div class="spec-item">
        <span class="label">Raza</span>
        <span class="value">{{ subastaData.raza }}</span>
      </div>
      <div class="spec-item">
        <span class="label">Edad</span>
        <span class="value">{{ subastaData.edad }}</span>
      </div>
      <div class="spec-item">
        <span class="label">Peso</span>
        <span class="value">{{ subastaData.peso }}</span>
      </div>
      <div class="spec-item">
        <span class="label">Genética</span>
        <span class="value">{{ subastaData.genetica }}</span>
      </div>
      <div class="spec-item">
        <span class="label">Pujador Actual</span>
        <span class="value">{{ subastaData.pujador || 'N/A' }}</span>
      </div>
    </div>

  </div>
  
  <!-- Mensaje de error si no se pasan los datos -->
  <div v-else class="error-message">
    <h2>No se pudo cargar la información de la subasta.</h2>
  </div>
</template>

<script setup>
import { ref, defineProps, computed, onMounted, onUnmounted } from 'vue';

// 1. Definimos las props que el componente espera recibir
const props = defineProps({
  subastaData: {
    type: Object,
    required: true
  }
});

// --- Lógica para la Galería de Imágenes ---
// La imagen principal será la primera del array, o un placeholder si no hay
const mainImage = ref(props.subastaData?.imagenes?.[0] || '/img/placeholder.jpg');
const setMainImage = (img) => {
  mainImage.value = img;
};

// --- Lógica para el Contador de Tiempo Restante ---
const tiempoRestante = ref('');
let timerInterval = null;

const calcularTiempoRestante = () => {
  if (!props.subastaData?.fechaFinal) return;

  const ahora = new Date();
  const fechaFinal = new Date(props.subastaData.fechaFinal);
  const diferencia = fechaFinal - ahora;

  if (diferencia <= 0) {
    tiempoRestante.value = "Subasta Finalizada";
    clearInterval(timerInterval);
    return;
  }

  const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
  const horas = Math.floor((diferencia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));
  const segundos = Math.floor((diferencia % (1000 * 60)) / 1000);

  tiempoRestante.value = `${dias}d ${horas}h ${minutos}m ${segundos}s`;
};

// --- Lógica para Formatear Moneda ---
const formatCurrency = (value) => {
  return new Intl.NumberFormat('es-CR', {
    style: 'currency',
    currency: 'CRC',
    minimumFractionDigits: 2,
  }).format(value);
};

// Iniciamos y limpiamos el intervalo del contador
onMounted(() => {
  calcularTiempoRestante();
  timerInterval = setInterval(calcularTiempoRestante, 1000);
});
onUnmounted(() => {
  clearInterval(timerInterval);
});
</script>

<style scoped>
.subasta-details {
  font-family: 'Segoe UI', sans-serif;
  color: #3E2723;
}

.main-content {
  display: flex;
  gap: 30px;
  margin-bottom: 30px;
}

.image-gallery {
  flex: 1;
}

.main-image {
  width: 100%;
  border-radius: 12px;
  background-color: #f0f0f0;
  aspect-ratio: 4 / 3;
  object-fit: cover;
}

.thumbnail-strip {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.thumbnail {
  width: 80px;
  height: 60px;
  object-fit: cover;
  border-radius: 6px;
  cursor: pointer;
  border: 2px solid transparent;
  transition: border-color 0.2s;
}

.thumbnail.active {
  border-color: #8D6E63;
}

.info-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.title {
  font-size: 2rem;
  font-weight: 700;
  color: #5D4037;
  margin: 0 0 10px 0;
}

.description {
  font-size: 1rem;
  line-height: 1.6;
  color: #616161;
  margin-bottom: 20px;
}

.countdown-timer {
  background-color: #f5f5f5;
  border-radius: 8px;
  padding: 15px;
  text-align: center;
  margin-bottom: 20px;
}
.countdown-timer h4 {
  margin: 0 0 10px 0;
  font-size: 0.9rem;
  color: #8D6E63;
  text-transform: uppercase;
  letter-spacing: 1px;
}
.time-display {
  font-size: 1.8rem;
  font-weight: 700;
  color: #5D4037;
}

.price-info {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}
.price-item {
  flex: 1;
  padding: 15px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  text-align: center;
}
.price-item .label {
  display: block;
  font-size: 0.9rem;
  color: #8D6E63;
  margin-bottom: 5px;
}
.price-item .value {
  font-size: 1.2rem;
  font-weight: 600;
}
.current-bid {
  border-color: #8D6E63;
  background-color: #fdfaf7;
}
.current-bid .value {
  color: #5D4037;
}

.bid-button {
  width: 100%;
  padding: 15px;
  border: none;
  border-radius: 8px;
  background-color: #A85B2C;
  color: white;
  font-size: 1.2rem;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-top: auto; /* Empuja el botón al final */
}
.bid-button:hover {
  background-color: #5C3218;
}

.specs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
  background-color: #f5f5f5;
  padding: 20px;
  border-radius: 8px;
}
.spec-item {
  display: flex;
  flex-direction: column;
}
.spec-item .label {
  font-size: 0.8rem;
  color: #A1887F;
  text-transform: uppercase;
}
.spec-item .value {
  font-size: 1rem;
  font-weight: 600;
}
.error-message {
  text-align: center;
  padding: 40px;
}
</style>