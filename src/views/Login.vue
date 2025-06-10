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
      <!-- BOTÓN DE REGRESO A HOME -->
      <button @click="goToHome" class="home-button" aria-label="Volver a la página de inicio">
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
      </button>

      <img src="/logo.png" alt="Logo N&D" class="logo" />
      <div class="form-content">
        <h1>{{ t('login.welcome') }}</h1>
        <form @submit.prevent="handleLogin">
          <div class="input-group">
            <label for="email">{{ t('login.emailLabel') }}</label>
            <input type="email" id="email" v-model="email" :placeholder="t('login.emailPlaceholder')" required />
          </div>
          <div class="input-group">
            <div class="password-header"></div>
            <div class="password-wrapper">
              <input :type="passwordFieldType" id="password" v-model="password" :placeholder="t('login.passwordPlaceholder')" required />
              <button type="button" @click="togglePasswordVisibility" class="toggle-password">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
              </button>
            </div>
          </div>
          <button type="submit" class="btn-login" :disabled="loading">
            {{ loading ? t('login.loggingIn') : t('login.loginButton') }}
          </button>
        </form>
        <div class="signup-link">
          <i18n-t keypath="login.noAccountPrompt" tag="span">
            <template #createAccountLink>
              <router-link to="/SelectTypeAccount">
                <strong>{{ t('login.createAccountNow') }}</strong>
              </router-link>
            </template>
          </i18n-t>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '../store/auth';
import { useRouter } from 'vue-router';
import Swal from 'sweetalert2'; // ¡IMPORTANTE! Importar SweetAlert2

const { t } = useI18n();
const authStore = useAuthStore();
const router = useRouter();

const email = ref('');
const password = ref('');
const showPassword = ref(false);
const loading = ref(false);

const passwordFieldType = computed(() => (showPassword.value ? 'text' : 'password'));
const togglePasswordVisibility = () => { showPassword.value = !showPassword.value; };

const goToHome = () => {
  router.push('/');
};

const handleLogin = async () => {
  if (!email.value || !password.value) {
    return; 
  }
  
  loading.value = true; 

  try {
    await authStore.login({ email: email.value, password: password.value });
    router.push('/'); 
  } catch (error) {
    console.error("Error en el login:", error);
    // ¡CAMBIO! Alerta de error con SweetAlert2
    Swal.fire({
      icon: 'error',
      title: 'Error de Autenticación',
      text: t('login.loginError'),
      confirmButtonColor: '#6D4C41'
    });
  } finally {
    loading.value = false; 
  }
};

const carouselItems = computed(() => [
  { text: t('login.carousel.slide1') },
  { text: t('login.carousel.slide2') },
]);

const currentIndex = ref(0);
let intervalId = null;
const currentSlide = computed(() => carouselItems.value[currentIndex.value]);
const nextSlide = () => { currentIndex.value = (currentIndex.value + 1) % carouselItems.value.length; };
const goToSlide = (index) => {
  currentIndex.value = index;
  clearInterval(intervalId);
  intervalId = setInterval(nextSlide, 3000);
};

onMounted(() => { intervalId = setInterval(nextSlide, 3000); });
onUnmounted(() => { clearInterval(intervalId); });
</script>

<style scoped>
/* Tus estilos no necesitan cambios */
.login-page {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh; 
  z-index: 100;
  --font-heading: 'Merriweather', serif;
  --font-body: 'Lato', sans-serif;
  --color-primary: #6D4C41; 
  --color-secondary: #A1887F; 
  --color-background: #F9F6F2; 
  --color-background-input: #EAE3E0; 
  --color-text: #3E2723; 
  --color-white: #FFFFFF;
  display: flex;
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
  position: relative;
}

.home-button {
  position: absolute;
  top: 30px;
  left: 30px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  color: var(--color-secondary);
  transition: background-color 0.2s, color 0.2s;
}
.home-button:hover {
  background-color: #EAE3E0;
  color: var(--color-primary);
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
input { width: 100%; padding: 14px 20px; border: none; border-radius: 8px; background-color: var(--color-background-input); font-size: 1rem; color: var(--color-text); box-sizing: border-box; }
input::placeholder { color: var(--color-secondary); }
.password-wrapper { position: relative; }
.password-wrapper input { padding-right: 50px; }
.toggle-password { position: absolute; top: 50%; right: 15px; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: var(--color-secondary); }
.btn-login { width: 100%; padding: 15px; border-radius: 8px; border: none; background-color: #A85B2C; color: var(--color-white); font-size: 1.1rem; font-weight: 700; cursor: pointer; transition: background-color 0.3s, box-shadow 0.3s; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1); }
.btn-login:hover { background-color: #5C3218; }
.btn-login:disabled { background-color: #A1887F; cursor: not-allowed;}

.signup-link { text-align: center; margin-top: 2rem; color: var(--color-text); }
.signup-link a { color: var(--color-primary); text-decoration: none; font-weight: 700; }
.signup-link a:hover { text-decoration: underline; }

@media (max-width: 992px) {
  .login-page { 
    flex-direction: column;
    overflow-y: auto;
   }
  .image-panel { flex: none; height: 300px; }
  .form-panel { padding: 20px; }
  .form-content { flex-grow: 0; margin: 2rem auto; }
  .home-button { top: 20px; left: 20px; }
}
</style>