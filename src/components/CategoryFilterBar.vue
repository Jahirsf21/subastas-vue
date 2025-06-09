<template>
  <div class="nav-container">
    <nav class="category-filters">
      <div class="filter-items">
        <button 
          v-for="category in categories" 
          :key="category.name"
          class="filter-item"
          :class="{ active: category.name === activeCategory }"
          @click="selectCategory(category.name)"
        >
          <img :src="category.icon" :alt="t(`categories.${category.name}`)" class="icon" />
          <span>{{ t(`categories.${category.name}`) }}</span>
        </button>
      </div>
      
      <button class="filters-button">
        <img src="/icons/filtros.png" alt="Filtros" class="icon-btn" />
        <span>{{ t('categories.filters') }}</span>
      </button>
    </nav>
  </div>
</template>

<script setup>
import { ref, shallowRef } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const activeCategory = ref('weight');

const selectCategory = (name) => {
  activeCategory.value = name;
  console.log(`Categoría seleccionada: ${name}`);
};

const categories = shallowRef([
  { name: 'weight', icon: '/icons/peso.png' },
  { name: 'certification', icon: '/icons/certificacion.png' },
  { name: 'age', icon: '/icons/edad.png' },
  { name: 'breed', icon: '/icons/raza.png' },
  { name: 'gender', icon: '/icons/genero.png' },
  { name: 'vaccination', icon: '/icons/vacunacion.png' },
  { name: 'auctionDate', icon: '/icons/fecha.png' },
  { name: 'price', icon: '/icons/precio.png' },
  { name: 'personal', icon: '/icons/personal.png' },
  { name: 'ranch', icon: '/icons/ganaderia.png' },
]);
</script>

<style scoped>
.nav-container {
  width: 100%;
  overflow: hidden;
  position: relative;
}

.category-filters {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 0;
  width: max-content;
  margin: 0 auto;
  background-color: transparent;
}

.filter-items {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 36px;
}

.filter-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  cursor: pointer;
  font-family: 'Segoe UI', sans-serif;
  font-size: 0.95rem;
  color: #8D6E63;
  padding-bottom: 12px;
  position: relative;
  transition: color 0.2s;
  flex-shrink: 0;
}

.filter-item:hover {
  color: #5D4037;
}

.icon {
  width: 32px;
  height: 32px;
  object-fit: contain;
}

.filter-item.active {
  color: #5D4037;
  font-weight: 600;
}

.filter-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 10%;
  right: 10%;
  width: 80%;
  height: 3px;
  background-color: #5D4037;
  border-radius: 2px;
}

.filters-button {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 24px;
  border: 1.5px solid #D7CCC8;
  border-radius: 50px;
  background-color: white;
  color: #5D4037;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s, border-color 0.2s;
  margin-left: 40px;
  flex-shrink: 0;
  transform: translateY(-10px); 
}

.filters-button:hover {
  background-color: #f9f9f9;
  border-color: #A1887F;
}

.icon-btn {
  width: 25px;
  height: 25px;
}

/* Estilos para scroll horizontal en pantallas pequeñas */
@media (max-width: 1200px) {
  .nav-container {
    overflow-x: auto;
    overflow-y: hidden;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  
  .nav-container::-webkit-scrollbar {
    display: none;
  }
  
  .category-filters {
    padding: 24px 20px;
    justify-content: flex-start;
    margin: 0;
    width: auto;
    min-width: 100%;
  }
  
  .filter-items {
    padding: 0 20px;
  }
}

@media (max-width: 768px) {
  .filter-items {
    gap: 24px;
  }
  
  .filters-button {
    margin-left: 24px;
    padding: 8px 16px;
  }
}

@media (max-width: 480px) {
  .filter-item {
    font-size: 0.85rem;
  }
  
  .icon {
    width: 28px;
    height: 28px;
  }
  
  .filters-button {
    margin-left: 16px;
    padding: 6px 12px;
    font-size: 0.9rem;
  }
}
</style>