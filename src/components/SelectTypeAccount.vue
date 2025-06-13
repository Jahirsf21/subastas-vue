<template>
  <div class="selection-page">
    <div class="header-section">
      <button @click="goToHome" class="home-button" :aria-label="t('accountTypeSelection.homeButtonAriaLabel')">
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
      </button>
    </div>
    <h2 class="title">{{ t('accountTypeSelection.title') }}</h2>
    <div class="choices-container">
      <div class="choice-card" @click="goToRegister('Personal')">
        <img src="/icons/personal.svg" :alt="t('accountTypeSelection.personalAccountAlt')" class="choice-icon">
        <p class="choice-label">{{ t('accountTypeSelection.personalAccount') }}</p>
      </div>
      <div class="choice-card" @click="goToRegister('Ganaderia')">
        <img src="/icons/ganaderia.svg" :alt="t('accountTypeSelection.ranchAccountAlt')" class="choice-icon">
        <p class="choice-label">{{ t('accountTypeSelection.ranchAccount') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

const {t} = useI18n()

const router = useRouter();

const goToRegister = (type) => {
  if (type === 'Personal') {
    router.push('/registerPersonal');
  } else if (type === 'Ganaderia') {
    router.push('/registerGanaderia');
  }
};

const goBackToLogin = () => {
  router.push('/login');
};

// FUNCIÓN PARA EL NUEVO BOTÓN
const goToHome = () => {
  router.push('/'); // Redirige a la ruta raíz
};
</script>

<style scoped>
.selection-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #FAF8F5;
  font-family: 'Segoe UI', sans-serif;
  padding: 20px;
  box-sizing: border-box;
}

.header-section {
  position: absolute;
  top: 20px;
  left: 20px;
  right: 20px; 
  display: flex;
  align-items: center;
  justify-content: space-between; 
}

.header-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.logo {
  height: 80px;
  border-radius: 8px;
}

.back-button, .home-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  color: #8D6E63;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s, color 0.2s, transform 0.2s;
}

.back-button:hover, .home-button:hover {
  transform: scale(1.1);
  background-color: #EAE3E0;
  color: #5D4037;
}

.title {
  font-size: 1.8rem;
  font-weight: 600;
  color: #5D4037;
  margin-bottom: 40px;
  text-align: center;
}

.choices-container {
  display: flex;
  gap: 40px;
  flex-wrap: wrap;
  justify-content: center;
}

.choice-card {
  width: 250px;
  height: 250px;
  background-color: #fff;
  border: 2px solid #D7CCC8;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
}

.choice-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.1);
  border-color: #8D6E63;
}

.choice-icon {
  width: 100px;
  height: 100px;
  object-fit: contain;
  margin-bottom: 20px;
}

.choice-label {
  font-size: 1.5rem;
  font-weight: 500;
  color: #5D4037;
  margin: 0;
}

@media (max-width: 600px) {
  .choices-container {
    flex-direction: column;
    gap: 25px;
  }
  .choice-card {
    width: 220px;
    height: 220px;
  }
  .choice-icon {
    width: 80px;
    height: 80px;
  }
  .title {
    font-size: 1.5rem;
  }
}
</style>