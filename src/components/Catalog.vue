<template>
  <div class="catalog-page">
    <!-- El botón ahora cambia el estado para mostrar el modal -->
    <button @click="openCreateAuctionModal" class="create-auction-btn">
      {{ t('catalog.createAuction') }}
    </button>
    
    <!-- Contenido existente de la página -->
    <div v-if="subastasStore.isLoading" class="status-message">
      <div class="spinner"></div>
      <p>{{ t('catalog.loading') }}</p>
    </div>
    <div v-else-if="subastasStore.error" class="status-message error">
      <h3>{{ t('catalog.errorTitle') }}</h3>
      <p>{{ subastasStore.error }}</p>
      <button @click="retryFetch" class="retry-button">{{ t('catalog.retry') }}</button>
    </div>
    <div v-else-if="auctionsToShow.length > 0" class="catalog-grid">
      <AuctionCard 
        v-for="subasta in auctionsToShow" 
        :key="subasta.id" 
        :subasta="subasta"
        @click="openSubastaDetails(subasta)"
      />
    </div>
    <div v-else class="status-message">
      <h3 v-if="subastasStore.searchQuery">{{ t('catalog.noResultsFor', { query: subastasStore.searchQuery }) }}</h3>
      <h3 v-else>{{ t('catalog.noAuctions') }}</h3>
      <p>{{ t('catalog.tryAnotherSearch') }}</p>
    </div>
  </div>
  <div v-if="selectedSubastaId" class="modal-overlay" @click.self="closeSubastaDetails">
    <div class="modal-content">
      <button @click="closeSubastaDetails" class="close-button" :aria-label="t('catalog.close')">×</button>
      <!-- Escuchamos el evento 'close' y llamamos a la función para cerrar -->
      <SubastaDetails :subastaId="selectedSubastaId" @close="closeSubastaDetails" />
    </div>
  </div>

  <!-- ¡NUEVO! Modal para Crear Subasta -->
  <CreateAuction v-if="isCreateModalVisible" @close="closeCreateAuctionModal" />

</template>

<script setup>
import { ref, onMounted } from 'vue';
import { computed } from 'vue';
import { useAuthStore } from '../store/auth'; // Importa el store de auth
import { useSubastasStore } from '../store/subastas';
import AuctionCard from '../components/AuctionCard.vue';
import SubastaDetails from '../components/SubastaDetails.vue'; 
import { useI18n } from 'vue-i18n';
import CreateAuction from './forms/crearSubasta.vue'


const authStore = useAuthStore();
const subastasStore = useSubastasStore();
const selectedSubastaId = ref(null);
const { t } = useI18n();

// 2. CREAR ESTADO para el nuevo modal
const isCreateModalVisible = ref(false);

const auctionsToShow = computed(() => {
  // Si es admin, usa el getter que combina activas y pendientes
  if (authStore.isAdmin) {
    return subastasStore.allSubastasForAdmin;
  }
  // Si no, usa el getter normal que solo muestra activas
  return subastasStore.processedSubastas;
});

onMounted(() => {
  subastasStore.fetchSubastas(authStore.isAdmin);

});

const retryFetch = () => {
  subastasStore.fetchSubastas(authStore.isAdmin);
};

const openSubastaDetails = (subasta) => {
  selectedSubastaId.value = subasta.id;
};

const closeSubastaDetails = () => {
  selectedSubastaId.value = null;
};

// 3. AÑADIR FUNCIONES para abrir y cerrar el modal de creación
const openCreateAuctionModal = () => {
  isCreateModalVisible.value = true;
};

const closeCreateAuctionModal = () => {
  isCreateModalVisible.value = false;
};

</script>

<style scoped>
/* Los estilos se mantienen exactamente iguales, no necesitan cambios. */
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

.create-auction-btn {
  position: fixed;
  bottom: 24px;
  right: 24px;
  background-color: #A85B2C; 
  color: white;
  border: none;
  border-radius: 16px;
  padding: 12px 24px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  z-index: 1000;
}

.create-auction-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.25);
  background-color: #5C3218;
}
</style>