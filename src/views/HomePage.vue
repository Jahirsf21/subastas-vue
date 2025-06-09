<template>
  <div>
    <HeaderComponent />
    <main class="page-content">
      <CategoryFilterBar />
      <div class="catalog-container">
      </div>
      <Catalog></Catalog>
    </main>
  </div>
</template>

<script setup>
import HeaderComponent from '../components/HeaderComponent.vue';
import CategoryFilterBar from '../components/CategoryFilterBar.vue';
import Catalog from '../components/Catalog.vue';


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