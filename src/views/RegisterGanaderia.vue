<template>
  <div class="register-page">
    <div class="image-panel">
      <img src="/masvacas.jpg" alt="Ganado en el campo" :class="{ active: currentIndex === 0 }">
      <img src="/masmasvacas.jpg" alt="Toros en exhibición" :class="{ active: currentIndex === 1 }">
      <div class="image-text-container">
        <h2>{{ currentSlide.text }}</h2>
        <div class="carousel-dots">
          <span v-for="(item, index) in carouselItems" :key="index" class="dot" :class="{ active: index === currentIndex }" @click="goToSlide(index)"></span>
        </div>
      </div>
    </div>
    <div class="form-panel">
      <img src="/logo.png" alt="Logo N&D" class="logo" />
      <div class="form-content">
        <h1>Registro de Ganadería</h1>
        
        <form @submit.prevent="handleRegister">
          <div class="form-group-full">
            <label>Logo de la Ganadería</label>
            <div class="file-uploader">
              <div class="file-info">
                <svg class="file-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                <span>Cargar un logo. Tamaño máximo 2MB</span>
              </div>
              <label for="file-input" class="btn btn-upload">Cargar Logo</label>
              <input id="file-input" type="file" @change="handleFileChange" accept="image/*" hidden />
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="ganaderiaName">Nombre de la Ganadería</label>
              <input type="text" id="ganaderiaName" v-model="formData.nombreCompleto" placeholder="Ingrese nombre de la ganadería" required />
            </div>
            <div class="form-group">
              <label for="fundacionDate">Fecha de Fundación</label>
              <input type="date" id="fundacionDate" v-model="formData.fechaNacimiento" required />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="idType">Tipo de Identificación</label>
              <select id="idType" v-model="formData.tipoCedula" required>
                <option value="Juridica">Cédula Jurídica</option>
              </select>
            </div>
            <div class="form-group">
              <label for="idNumber">Número de Cédula Jurídica</label>
              <input type="text" id="idNumber" v-model="formData.cedula" placeholder="Ej: 3-101-123456" required />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group" style="flex: 0.5;">
              <label for="countryCode">Código de país</label>
              <select id="countryCode" v-model="formData.codigoPais" required>
                 <option value="+506">CR (+506)</option>
                 <option value="+1">US (+1)</option>
                 <option value="+52">MX (+52)</option>
              </select>
            </div>
            <div class="form-group">
              <label for="phoneNumber">Número de teléfono</label>
              <input type="tel" id="phoneNumber" v-model="formData.numeroTelefono" placeholder="Ingrese número de teléfono" required />
            </div>
          </div>
          <div class="form-row">
             <div class="form-group">
                <label for="province">Provincia</label>
                <select id="province" v-model="formData.direccion.provincia" required>
                    <option disabled value="">Provincia</option>
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
                <label for="canton">Cantón</label>
                <input type="text" id="canton" v-model="formData.direccion.canton" placeholder="Cantón" required />
             </div>
             <div class="form-group">
                <label for="district">Distrito</label>
                <input type="text" id="district" v-model="formData.direccion.distrito" placeholder="Distrito" required />
             </div>
          </div>
          <div class="form-group-full">
            <label for="exactAddress">Dirección Exacta</label>
            <input type="text" id="exactAddress" v-model="formData.direccion.senas" placeholder="Ingrese la dirección exacta" required />
          </div>
          
          <template v-if="!authStore.isLoggedIn">
            <div class="form-group-full">
              <label for="email">Correo electrónico de la cuenta</label>
              <input type="email" id="email" v-model="formData.email" placeholder="Ingrese el correo de la cuenta" required />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label for="password">Contraseña</label>
                <input type="password" id="password" v-model="formData.password" placeholder="Ingrese su contraseña" required />
              </div>
              <div class="form-group">
                <label for="passwordConfirm">Confirmar Contraseña</label>
                <input type="password" id="passwordConfirm" v-model="formData.passwordConfirmation" placeholder="Vuelva a ingresar la contraseña" required />
              </div>
            </div>
          </template>
          
          <button type="submit" class="btn-submit">Registrar Ganadería</button>
        </form>
        <div class="sub-link">
          <span>¿Ya tienes una cuenta? </span>
          <router-link to="/login">
            <strong>Inicia sesión</strong>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../store/auth';
import Swal from 'sweetalert2';

const authStore = useAuthStore();
const router = useRouter();

const formData = reactive({
  nombreCompleto: '',
  fechaNacimiento: '', // Usado para Fecha de Fundación
  tipoCedula: 'Juridica', // Por defecto Jurídica
  cedula: '',
  codigoPais: '+506',
  numeroTelefono: '',
  direccion: { provincia: '', canton: '', distrito: '', senas: '' },
  email: '',
  password: '',
  passwordConfirmation: '',
  profileImage: null, // Para el logo
});

const handleFileChange = (event) => {
  formData.profileImage = event.target.files[0] || null;
};

const handleRegister = async () => {
  const user = authStore.currentUser;

  if (!user && formData.password !== formData.passwordConfirmation) {
    Swal.fire({ icon: 'error', title: 'Error', text: 'Las contraseñas no coinciden.', confirmButtonColor: '#6D4C41' });
    return;
  }
  
  try {
    const registrationPayload = {
      tipoCuenta: 'Ganaderia',
      nombre: formData.nombreCompleto,
      fechaFundacion: formData.fechaNacimiento,
      cedulaJuridica: formData.cedula,
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

    await Swal.fire({
      icon: 'success',
      title: '¡Registro Exitoso!',
      text: 'El perfil de tu ganadería ha sido creado.',
      timer: 3000,
      timerProgressBar: true,
      showConfirmButton: false,
    });
    
    router.push('/');

  } catch (error) {
    console.error('Registration failed:', error);
    const errorMessage = error.response?.data?.message || 'Hubo un error al registrar el perfil.';
    Swal.fire({ icon: 'error', title: 'Error de Registro', text: errorMessage, confirmButtonColor: '#6D4C41' });
  }
};

const carouselItems = computed(() => [
  { text: 'Conectando criadores, fortaleciendo el campo.' },
  { text: 'La plataforma líder para subastas de ganado.' },
]);
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

.file-uploader {
  border: 2px solid #D7CCC8;
  border-radius: 8px;
  padding: 0.7rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.file-info {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--color-secondary);
  font-size: 0.8rem;
}
.btn-upload {
  padding: 6px 12px;
  font-size: 0.8rem;
  background-color: var(--color-primary);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

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