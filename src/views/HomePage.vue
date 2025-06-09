<template>
  <div>
    <HeaderComponent />

    <main class="page-content">
      
      <CategoryFilterBar />
      
      <div class="catalog-container">
        <p>Aquí se mostrarán las subastas filtradas por: <strong>{{ activeCategory }}</strong></p>
      </div>

    </main>
  </div>
</template>

<script setup>
import HeaderComponent from '../components/HeaderComponent.vue';
import CategoryFilterBar from '../components/CategoryFilterBar.vue';


</script>

<style scoped>
.page-content {
  padding-top: 120px; 
}

.catalog-container {
  padding: 24px;
  text-align: center;
}
</style>