<!-- src/components/AuctionCard.vue -->
<template>
  <div class="auction-card">
    <div class="image-container">
      <img :src="subasta.imagen" :alt="subasta.titulo" class="main-image">
      <button class="favorite-button">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
      </button>
      <div v-if="subasta.ganaderia && subasta.ganaderia.nombre" class="ranch-overlay">
        <img v-if="subasta.ganaderia.logo" :src="subasta.ganaderia.logo" alt="Logo Ganadería" class="ranch-logo">
        <span>{{ subasta.ganaderia.nombre }}</span>
      </div>
    </div>

    <div class="info-container">
      <div class="title-line">
        <h3>{{ subasta.titulo }}</h3>
        <div class="status-tag">
          <img src="/icons/edad.png" alt="Estado"> 
          <span>{{ subasta.estado }}</span>
        </div>
      </div>
      <p class="type">{{ subasta.tipo }}</p>
      <p class="weight">Peso: {{ subasta.peso }}</p>
      <p class="price">Precio base: <strong>{{ formatCurrency(subasta.precioInicial) }}</strong></p>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';

const props = defineProps({
  subasta: {
    type: Object,
    required: true
  }
});

const formatCurrency = (value) => {
  if (typeof value !== 'number') return value;
  return new Intl.NumberFormat('es-CR', {
    style: 'currency',
    currency: 'CRC',
    minimumFractionDigits: 2,
  }).format(value);
};
</script>

<style scoped>
.auction-card {
  background-color: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  cursor: pointer;
  display: flex;
  flex-direction: column;
}

.auction-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

.image-container {
  position: relative;
  width: 100%;
  padding-top: 75%; 
  background-color: #f0f0f0;
}

.main-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.favorite-button {
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(0, 0, 0, 0.3);
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
  color: white;
}
.favorite-button:hover svg {
  fill: white;
}

.ranch-overlay {
  position: absolute;
  bottom: 10px;
  left: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 500;
}

.ranch-logo {
  width: 20px;
  height: 20px;
  border-radius: 50%;
}

.info-container {
  padding: 16px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.title-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.title-line h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: #3E2723;
}

.status-tag {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.85rem;
  color: #5D4037;
  background-color: #f5f5f5;
  padding: 2px 6px;
  border-radius: 6px;
}

.status-tag img {
  width: 16px;
  height: 16px;
}

p {
  margin: 2px 0 0 0;
  font-size: 0.9rem;
  color: #8D6E63;
}

.price {
  margin-top: 12px;
  font-size: 1rem;
}

.price strong {
  color: #5D4037;
  font-weight: 700;
}
</style>