<template>
  <div class="login-page">
    <div class="image-panel">
      <img src="/vaca.jpg" alt="Vaca en el campo" :class="{ active: currentIndex === 0 }">
      <img src="/vacas.jpg" alt="Toro en el campo" :class="{ active: currentIndex === 1 }">

      <div class="image-text-container">
        <h2>{{ currentSlide.text }}</h2>
        <div class="carousel-dots">
          <span 
            v-for="(item, index) in carouselItems"
            :key="index"
            class="dot" 
            :class="{ active: index === currentIndex }"
            @click="goToSlide(index)"
          ></span>
        </div>
      </div>
    </div>
    <div class="form-panel">
      <img src="/logo.png" alt="Logo N&D" class="logo" />
      <div class="form-content">
        <h1>BIENVENIDO</h1>
        <form @submit.prevent="handleLogin">
          <div class="input-group">
            <label for="email">Correo</label>
            <input type="email" id="email" v-model="email" placeholder="Ingresa tu correo" required />
          </div>
          <div class="input-group">
            <div class="password-header"></div>
            <div class="password-wrapper">
              <input :type="passwordFieldType" id="password" v-model="password" placeholder="Ingresa tu contraseña" required />
              <button type="button" @click="togglePasswordVisibility" class="toggle-password">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
              </button>
            </div>
          </div>
          <button type="submit" class="btn-login">Iniciar sesión</button>
        </form>
        <div class="signup-link">
          ¿Todavía no tienes una cuenta? <router-link to="/register"><strong>Crea una ahora</strong></router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';

const email = ref('');
const password = ref('');
const showPassword = ref(false);
const passwordFieldType = computed(() => (showPassword.value ? 'text' : 'password'));
const togglePasswordVisibility = () => { showPassword.value = !showPassword.value; };
const handleLogin = () => { console.log('Iniciando sesión...'); };

const carouselItems = ref([
  { text: 'El mejor ganado del mercado' },
  { text: 'Genética y Calidad Superior' },
]);

const currentIndex = ref(0);
let intervalId = null;

const currentSlide = computed(() => carouselItems.value[currentIndex.value]);

const nextSlide = () => {
  currentIndex.value = (currentIndex.value + 1) % carouselItems.value.length;
};

const goToSlide = (index) => {
  currentIndex.value = index;
  clearInterval(intervalId);
  intervalId = setInterval(nextSlide, 3000);
};

onMounted(() => {
  intervalId = setInterval(nextSlide, 3000); 
});


onUnmounted(() => {
  clearInterval(intervalId);
});
</script>

<style scoped>

.login-page {
  --font-heading: 'Merriweather', serif;
  --font-body: 'Lato', sans-serif;
  --color-primary: #6D4C41; 
  --color-secondary: #A1887F; 
  --color-background: #F9F6F2; 
  --color-background-input: #EAE3E0; 
  --color-text: #3E2723; 
  --color-white: #FFFFFF;
  display: flex;
  min-height: 100vh;
  width: 100%;
  font-family: var(--font-body);
}


.image-panel {
  flex: 1.2;
  background-color: #e0d8d3;
  background-size: cover;
  position: relative; 
  display: flex;
  align-items: flex-end; 
  padding: 40px;
  overflow: hidden; 
}


.image-panel img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover; 
  opacity: 0; 
  transition: opacity 1s ease-in-out; 
}

.image-panel img.active {
  opacity: 1; 
}

.image-text-container {
  z-index: 1;
}

.image-panel h2 {
  font-family: var(--font-heading);
  font-weight: 700;
  font-size: 2.5rem;
  color: var(--color-white); 
  text-shadow: 1px 1px 5px rgba(0, 0, 0, 0.5); 
  margin: 0 0 1rem 0;
}

.carousel-dots {
  display: flex;
  gap: 12px;
}

.dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 2px solid var(--color-white); 
  background-color: rgba(255, 255, 255, 0.3); 
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.dot.active {
  background-color: var(--color-white); 
}


.form-panel {
  flex: 1;
  display: flex;
  flex-direction: column; 
  background-color: var(--color-background);
  padding: 30px;
}

.logo {
  width: 80px;
  height: auto;
  align-self: flex-end; 
  padding: 8px;
  border-radius: 8px;
}

.form-content {
  flex-grow: 1; 
  display: flex;
  flex-direction: column;
  justify-content: center; 
  width: 100%;
  max-width: 400px;
  margin: 0 auto; 
}

h1 {
  font-family: var(--font-heading);
  font-weight: 900;
  font-size: 2.5rem;
  color: var(--color-primary);
  text-align: center;
  margin-bottom: 3rem;
}

.input-group { margin-bottom: 1.5rem; text-align: left; }
.password-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
label { font-weight: 700; color: var(--color-text); }
.forgot-password { font-size: 0.9rem; color: var(--color-secondary); text-decoration: none; }
.forgot-password:hover { text-decoration: underline; }
input { width: 100%; padding: 14px 20px; border: none; border-radius: 8px; background-color: var(--color-background-input); font-size: 1rem; color: var(--color-text); box-sizing: border-box; }
input::placeholder { color: var(--color-secondary); }
.password-wrapper { position: relative; }
.password-wrapper input { padding-right: 50px; }
.toggle-password { position: absolute; top: 50%; right: 15px; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: var(--color-secondary); }
.btn-login { width: 100%; padding: 15px; border-radius: 8px; border: none; background-color: #A85B2C; color: var(--color-white); font-size: 1.1rem; font-weight: 700; cursor: pointer; transition: background-color 0.3s, box-shadow 0.3s; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1); }
.btn-login:hover { background-color: #5C3218; box-shadow: 0 6px 15px rgba(0, 0, 0, 0.15); }
.signup-link { text-align: center; margin-top: 2rem; color: var(--color-text); }
.signup-link a { color: var(--color-primary); text-decoration: none; font-weight: 700; }
.signup-link a:hover { text-decoration: underline; }

@media (max-width: 992px) {
  .login-page { flex-direction: column; }
  .image-panel { flex: none; height: 300px; }
  .form-panel { padding: 20px; }
  .form-content { flex-grow: 0; margin: 2rem auto; }
}
</style>