<template>
    <header class="app-header">
      <h1><img src="../../public/logo.png" alt="Logo" class="logo" />Subastas</h1>


      <div class="search-container">
        <input 
          type="text" 
          class="search-input" 
          placeholder="Buscar"
          v-model="searchQuery"
          @keyup.enter="performSearch"
        >
        <button class="search-button" @click="performSearch">
          <!-- Icono SVG de Lupa -->
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </button>
      </div>
      <div class="header-icons">
      
      <button class="icon-button">
        <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#5D4037" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 0 20a15.3 15.3 0 0 1 0-20" />
        </svg>
      </button>

      
      <button class="user-button">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#5D4037" viewBox="0 0 24 24">
          <path d="M3 6h12v2H3V6zm0 5h12v2H3v-2zm0 5h8v2H3v-2z" />
        </svg>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#5D4037" viewBox="0 0 24 24">
          <circle cx="12" cy="8" r="4" />
          <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
        </svg>
      </button>
    </div>
    </header>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  

  const searchQuery = ref('');
  
 
  const performSearch = () => {
    if (searchQuery.value.trim() === '') {
      alert('Por favor, introduce un término de búsqueda.');
      return;
    }
    // Aquí iría la lógica de búsqueda (p.ej. una llamada a una API)
    console.log(`Buscando: ${searchQuery.value}`);
    alert(`Buscando: "${searchQuery.value}"`);
  };
  </script>
  
  <style scoped>

  .app-header {
    background-color: #e9e9e9; 
    padding: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  }
  

  .search-container {
    display: flex;
    align-items: center;
    background-color: #ffffff;
    border: 1.5px solid #8D6E63;
    border-radius: 50px; 
    padding: 5px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); 
    width: 100%;
    max-width: 500px; 
    transition: box-shadow 0.3s ease;
  }
  
  .search-container:focus-within {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2); 
  }
  
  .search-input {
    border: none;
    outline: none;
    flex-grow: 1;
    padding: 10px 20px;
    font-size: 16px;
    background-color: transparent;
    color: #5D4037; 
  }
  
  .search-input::placeholder {
    color: #A1887F;
    opacity: 1;
  }
  
  /* Botón de búsqueda */
  .search-button {
    background-color: #8D6E63; 
    border: none;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    color: #ffffff; 
    flex-shrink: 0; 
    transition: background-color 0.3s ease;
  }
  
  .search-button:hover {
    background-color: #6D4C41; 
  }
  

  .search-button svg {
    stroke: currentColor;
    stroke-width: 2.5;
  }
  .header-icons {
  display: flex;
  align-items: center;
  gap: 20px;
}


.icon-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
}

.user-button {
  background-color: transparent;
  border: 2px solid #8D6E63;
  border-radius: 50px;
  padding: 6px 12px;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}

.logo {
  height: 60px;
}

h1 {
  display: flex;
  align-items: center; 
  gap: 15px;         
  margin: 0;        
  color: #5D4037;   
  font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  font-size: 2rem;  
}
</style>