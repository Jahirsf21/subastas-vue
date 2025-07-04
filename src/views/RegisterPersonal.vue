<template>
  <div class="register-page">
    <div class="image-panel">
      <img src="/masvacas.jpg" alt="Ganado en el campo" :class="{ active: currentIndex === 0 }">
      <img src="/masmasvacas.jpg" alt="Toros en exhibición" :class="{ active: currentIndex === 1 }">
      <div class="image-text-container">
        <h2>{{ t(currentSlide.text) }}</h2>
        <div class="carousel-dots">
          <span v-for="(item, index) in carouselItems" :key="index" class="dot" :class="{ active: index === currentIndex }" @click="goToSlide(index)"></span>
        </div>
      </div>
    </div>
    <div class="form-panel">
      <button @click="goToHome" class="home-button" :aria-label="t('register.homeButtonAriaLabel')">
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
      </button>
      <img src="/logo.png" alt="Logo N&D" class="logo" />
      <div class="form-content">
        <h1>{{ t('register.title') }}</h1>
        <form @submit.prevent="handleRegister">
          
          <!-- CAMPO DE CARGA DE FOTO DE PERFIL ELIMINADO -->

          <div class="form-row">
            <div class="form-group">
              <label for="fullName">{{ t('register.fullName') }}</label>
              <input type="text" id="fullName" v-model="formData.nombreCompleto" :placeholder="t('register.fullNamePlaceholder')" required />
            </div>
            <div class="form-group">
              <label for="birthDate">{{ t('register.birthDate') }}</label>
              <input type="date" id="birthDate" v-model="formData.fechaNacimiento" required />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="idType">{{ t('register.idType') }}</label>
              <select id="idType" v-model="formData.tipoCedula" required>
                <option value="Cedula">{{ t('register.idOptions.national') }}</option>
                <option value="Pasaporte">{{ t('register.idOptions.passport') }}</option>
                <option value="Residencia">{{ t('register.idOptions.residency') }}</option>
              </select>
            </div>
            <div class="form-group">
              <label for="idNumber">{{ t('register.idNumber') }}</label>
              <input type="text" id="idNumber" v-model="formData.cedula" :placeholder="t('register.idNumberPlaceholder')" required />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group" style="flex: 0.5;">
              <label for="countryCode">{{ t('register.countryCode') }}</label>
              <select id="countryCode" v-model="formData.codigoPais" required>
                 <option value="+506">CR (+506)</option>
                 <option value="+1">US (+1)</option>
                 <option value="+52">MX (+52)</option>
              </select>
            </div>
            <div class="form-group">
              <label for="phoneNumber">{{ t('register.phoneNumber') }}</label>
              <input type="tel" id="phoneNumber" v-model="formData.numeroTelefono" :placeholder="t('register.phoneNumberPlaceholder')" required />
            </div>
          </div>
          <div class="form-row">
             <div class="form-group">
                <label for="province">{{ t('register.province') }}</label>
                <select id="province" v-model="formData.direccion.provincia" required>
                    <option disabled value="">{{ t('register.provincePlaceholder') }}</option>
                    <option>San José</option>
                    <option>Alajuela</option>
                    <option>Cartago</option>
                    <option>Heredia</option>
                    <option>Guanacaste</option>
                    <option>Puntarenas</option>
                    <option>Limón</option>
                </select>
             </div>
             <div class="form-group">
                <label for="canton">{{ t('register.canton') }}</label>
                <input type="text" id="canton" v-model="formData.direccion.canton" :placeholder="t('register.cantonPlaceholder')" required />
             </div>
             <div class="form-group">
                <label for="district">{{ t('register.district') }}</label>
                <input type="text" id="district" v-model="formData.direccion.distrito" :placeholder="t('register.districtPlaceholder')" required />
             </div>
          </div>
          <div class="form-group-full">
            <label for="exactAddress">{{ t('register.exactAddress') }}</label>
            <input type="text" id="exactAddress" v-model="formData.direccion.senas" :placeholder="t('register.exactAddressPlaceholder')" required />
          </div>
        
          <template v-if="!authStore.isLoggedIn">
            <div class="form-group-full">
              <label for="email">{{ t('register.email') }}</label>
              <input type="email" id="email" v-model="formData.email" :placeholder="t('register.emailPlaceholder')" required />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label for="password">{{ t('register.password') }}</label>
                <input type="password" id="password" v-model="formData.password" :placeholder="t('register.passwordPlaceholder')" required />
              </div>
              <div class="form-group">
                <label for="passwordConfirm">{{ t('register.passwordConfirm') }}</label>
                <input type="password" id="passwordConfirm" v-model="formData.passwordConfirmation" :placeholder="t('register.passwordConfirmPlaceholder')" required />
              </div>
            </div>
          </template>

          <button type="submit" class="btn-submit">{{ t('register.registerButton') }}</button>
        </form>
        <div class="sub-link">
          <i18n-t keypath="register.loginPrompt" tag="span">
            <template #loginLink>
              <router-link to="/login">
                <strong>{{ t('register.loginNow') }}</strong>
              </router-link>
            </template>
          </i18n-t>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../store/auth';
import { useI18n } from 'vue-i18n';
import Swal from 'sweetalert2';

const { t } = useI18n();
const authStore = useAuthStore();
const router = useRouter();

// Se eliminó `profileImage` de aquí
const formData = reactive({
  nombreCompleto: '',
  fechaNacimiento: '',
  tipoCedula: 'Cedula',
  cedula: '',
  codigoPais: '+506',
  numeroTelefono: '',
  direccion: { provincia: '', canton: '', distrito: '', senas: '' },
  email: '',
  password: '',
  passwordConfirmation: '',
});

const goToHome = () => {
  router.push('/');
};


const handleRegister = async () => {
  const user = authStore.currentUser;

  if (!user && formData.password !== formData.passwordConfirmation) {
    Swal.fire({ icon: 'error', title: 'Error', text: t('register.passwordMismatch'), confirmButtonColor: '#6D4C41' });
    return;
  }
  try {
    const registrationPayload = {
      tipoCuenta: 'Personal',
      nombreCompleto: formData.nombreCompleto,
      fechaNacimiento: formData.fechaNacimiento,
      tipoCedula: formData.tipoCedula,
      cedula: formData.cedula,
      telefono: `${formData.codigoPais}${formData.numeroTelefono}`,
      direccion: `${formData.direccion.provincia}, ${formData.direccion.canton}, ${formData.direccion.distrito}. ${formData.direccion.senas}`,
    };
    if (user) {
      registrationPayload.email = user.email;
    } else {
      registrationPayload.email = formData.email;
      registrationPayload.password = formData.password;
    }
    await authStore.register(registrationPayload);
    if (user) {
      authStore.setActiveProfile('Personal');
    }
    await Swal.fire({
      icon: 'success',
      title: t('register.swal_success_title'),
      text: t('register.swal_success_text'),
      timer: 2000,
      showConfirmButton: false,
    });
    
    router.push(user ? '/' : '/login');
  } catch (error) {
    console.error('Registration failed:', error);
    const errorMessage = error.response?.data?.message || t('register.errorMessage');
    Swal.fire({ icon: 'error', title: 'Error de Registro', text: errorMessage, confirmButtonColor: '#6D4C41' });
  }
};

const carouselItems = computed(() => [ { text: t('register.carousel.slide1') }, { text: t('register.carousel.slide2') }, ]);
const currentIndex = ref(0);
let intervalId = null;
const currentSlide = computed(() => carouselItems.value[currentIndex.value]);
const nextSlide = () => { currentIndex.value = (currentIndex.value + 1) % carouselItems.value.length; };
const goToSlide = (index) => {
  currentIndex.value = index;
  clearInterval(intervalId);
  intervalId = setInterval(nextSlide, 5000);
};
onMounted(() => {
  if (authStore.currentUser) {
    formData.email = authStore.currentUser.email;
  }
  intervalId = setInterval(nextSlide, 5000);
});
onUnmounted(() => { clearInterval(intervalId); });
</script>


<style scoped>
.register-page {
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
  padding: 2vh 2vw; 
  overflow-y: auto; 
}

.logo {
  width: 70px;
  height: auto;
  align-self: flex-end; 
  margin-bottom: 1vh;
}

.form-content {
  flex-grow: 1; 
  display: flex;
  flex-direction: column;
  justify-content: center; 
  width: 100%;
  max-width: 550px; 
  margin: 0 auto; 
}

h1 {
  font-family: var(--font-heading);
  font-weight: 900;
  font-size: 2rem; 
  color: var(--color-primary);
  text-align: center;
  margin-bottom: 1.5rem;
}

form {
  width: 100%;
}

.form-row {
  display: flex;
  gap: 16px;
}

.form-group, .form-group-full {
  flex: 1;
  margin-bottom: 0.8rem;
  text-align: left;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: 700;
  color: var(--color-text);
  font-size: 0.85rem; 
}

input, select {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #D7CCC8;
  border-radius: 8px;
  background-color: var(--color-background-input);
  font-size: 0.9rem;
  color: var(--color-text);
  box-sizing: border-box;
}

select {
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%238D6E63' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 1em;
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

/* Estilos de carga de archivos eliminados */

.btn-submit {
  width: 100%;
  padding: 14px;
  border-radius: 8px;
  border: none;
  background-color: #A85B2C;
  color: var(--color-white);
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 0.3s;
  margin-top: 1rem;
}
.btn-submit:hover {
  background-color: #5C3218;
}

.sub-link {
  text-align: center;
  margin-top: 1.5rem;
  color: var(--color-text);
  font-size: 0.9rem;
}
.sub-link a {
  color: var(--color-primary);
  text-decoration: none;
  font-weight: 700;
}

@media (max-width: 992px) {
  .register-page { flex-direction: column; }
  .image-panel { flex: none; height: 200px; }
  .form-panel { padding: 20px; }
  .form-content { flex-grow: 0; margin-top: 1rem; }
}
</style>