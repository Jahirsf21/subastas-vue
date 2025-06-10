<template>
  <div class="catalog-page">
    <!-- Sección de Carga -->
    <div v-if="subastasStore.isLoading" class="status-message">
      <div class="spinner"></div>
      <p>Cargando subastas...</p>
    </div>

    <!-- Sección de Error -->
    <div v-else-if="subastasStore.error" class="status-message error">
      <h3>¡Oops! Algo salió mal</h3>
      <p>{{ subastasStore.error }}</p>
      <button @click="retryFetch" class="retry-button">Reintentar</button>
    </div>

    <!-- Catálogo con Resultados -->
    <div v-else-if="subastasStore.processedSubastas.length > 0" class="catalog-grid">
      <AuctionCard 
        v-for="subasta in subastasStore.processedSubastas" 
        :key="subasta.id" 
        :subasta="subasta"
        @click="openSubastaDetails(subasta)"
      />
    </div>

    <!-- Sección de "No hay Resultados" -->
    <div v-else class="status-message">
      <!-- ¡CAMBIO! Mensaje dinámico si hay una búsqueda activa -->
      <h3 v-if="subastasStore.searchQuery">No se encontraron resultados para "{{ subastasStore.searchQuery }}"</h3>
      <h3 v-else>No hay subastas disponibles</h3>
      <p>Intenta con otra búsqueda o ajusta tus filtros.</p>
    </div>
  </div>

  <!-- Modal para los detalles de la subasta -->
  <div v-if="selectedSubastaId" class="modal-overlay" @click.self="closeSubastaDetails">
    <div class="modal-content">
      <button @click="closeSubastaDetails" class="close-button">×</button>
      <SubastaDetails :subastaId="selectedSubastaId" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useSubastasStore } from '../store/subastas';
import AuctionCard from '../components/AuctionCard.vue';
import SubastaDetails from '../components/SubastaDetails.vue'; 

const subastasStore = useSubastasStore();
const selectedSubastaId = ref(null);

onMounted(() => {
  // Carga las subastas si el array en el store está vacío
  if (subastasStore.subastas.length === 0) {
    subastasStore.fetchSubastas();
  }
});

const retryFetch = () => {
  subastasStore.fetchSubastas();
};

const openSubastaDetails = (subasta) => {
  selectedSubastaId.value = subasta.id;
};

const closeSubastaDetails = () => {
  selectedSubastaId.value = null;
};
</script>

<style scoped>
.catalog-page {
  padding: 24px;
  background-color: #f9f9f9; 
  min-height: calc(100vh - var(--header-height, 100px));
}

.catalog-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
}

.status-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-size: 1.2rem;
  color: #888;
  padding: 80px 20px;
  min-height: 400px;
}
.status-message h3 {
  font-size: 1.5rem;
  color: #555;
  margin-bottom: 8px;
}
.status-message.error { color: #c0392b; }
.status-message.error h3 { color: #c0392b; }

.retry-button {
  margin-top: 20px;
  padding: 10px 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: white;
  cursor: pointer;
  transition: all 0.2s ease;
}
.retry-button:hover {
  background-color: #f5f5f5;
  border-color: #aaa;
}

.spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border-left-color: #5D4037;
  margin-bottom: 20px;
  animation: spin 1s ease infinite;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.modal-overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(5px);
}
.modal-content {
  background: white;
  padding: 30px;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  max-width: 800px;
  width: 90%;
  position: relative;
  max-height: 90vh;
  overflow-y: auto;
}
.close-button {
  position: absolute;
  top: 10px; right: 15px;
  background: none;
  border: none;
  font-size: 2.2rem;
  font-weight: 300;
  line-height: 1;
  cursor: pointer;
  color: #aaa;
  transition: color 0.2s;
}
.close-button:hover {
  color: #333;
}
</style>