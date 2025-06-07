<template>
    <div class="login-page">
      <!-- Panel Izquierdo: Imagen -->
      <div class="image-panel">
        <div class="image-text-container">
          <h2>El mejor ganado del mercado</h2>
          <div class="carousel-dots">
            <span class="dot active"></span>
            <span class="dot"></span>
          </div>
        </div>
      </div>
  
      <!-- Panel Derecho: Formulario -->
      <div class="form-panel">
        <!-- El logo está fuera del form-content para posicionamiento independiente -->
        <img src="/logo.png" alt="Logo N&D" class="logo" />
        
        <div class="form-content">
          <h1>BIENVENIDO</h1>
  
          <form @submit.prevent="handleLogin">
            <div class="input-group">
              <label for="email">Correo</label>
              <input type="email" id="email" v-model="email" placeholder="Ingresa tu correo" required />
            </div>
  
            <div class="input-group">
              <div class="password-header">
                <label for="password">Contraseña</label>
                <router-link to="" class="forgot-password">¿Has olvidado tu contraseña?</router-link>
              </div>
              <div class="password-wrapper">
                <input :type="passwordFieldType" id="password" v-model="password" placeholder="Ingresa tu contraseña" required />
                <button type="button" @click="togglePasswordVisibility" class="toggle-password">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                </button>
              </div>
            </div>
  
            <button type="submit" class="btn-login">Iniciar sesión</button>
          </form>
  
          <div class="separator">O inicia sesión con</div>
  
          <div class="social-login">
            <button class="btn-social">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M21.35 11.1h-9.2v2.8h5.3c-.2 1.9-1.5 3.3-3.3 3.3-2 0-3.6-1.6-3.6-3.6s1.6-3.6 3.6-3.6c.9 0 1.7.3 2.3.9l2.1-2.1c-1.3-1.2-3-2-5-2-4.1 0-7.5 3.4-7.5 7.5s3.4 7.5 7.5 7.5c4.3 0 7.2-3 7.2-7.2 0-.6-.1-1.1-.2-1.6z"/></svg>
              Google
            </button>
            <button class="btn-social">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              Facebook
            </button>
          </div>
  
          <div class="signup-link">
            ¿Todavía no tienes una cuenta? <router-link to="/register"><strong>Crea una ahora</strong></router-link>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue';
  
  const email = ref('');
  const password = ref('');
  const showPassword = ref(false);
  
  const passwordFieldType = computed(() => (showPassword.value ? 'text' : 'password'));
  
  const togglePasswordVisibility = () => {
    showPassword.value = !showPassword.value;
  };
  
  const handleLogin = () => {
    if (!email.value || !password.value) {
      alert('Por favor, ingresa tu correo y contraseña.');
      return;
    }
    console.log('Iniciando sesión con:', {
      email: email.value,
      password: password.value,
    });
    alert(`Bienvenido, ${email.value}! (Simulación de inicio de sesión)`);
  };
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
  }
  
  .login-page {
    display: flex;
    min-height: 100vh;
    width: 100%;
    font-family: var(--font-body);
  }
  
  /* --- Panel Izquierdo --- */
  .image-panel {
    flex: 1.2;
    background: url('/ganado-bg.jpg') no-repeat center center;
    background-size: cover;
    position: relative;
    display: flex;
    align-items: flex-end; 
    padding: 40px;
  }
  
  .image-text-container {
    z-index: 1;
  }
  
  .image-panel h2 {
    font-family: var(--font-heading);
    font-weight: 700;
    font-size: 2.5rem;
    color: var(--color-primary); 
    text-shadow: none;
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
    border: 2px solid var(--color-primary);
    cursor: pointer;
    transition: background-color 0.3s ease;
  }
  
  .dot.active {
    background-color: var(--color-primary);
  }
  
  /* --- Panel Derecho (Formulario) --- */
  .form-panel {
    flex: 1;
    display: flex;
    flex-direction: column; 
    background-color: var(--color-background);
    padding: 30px;
  }
  
  .logo {
    width: 70px;
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
  
  .input-group {
    margin-bottom: 1.5rem;
    text-align: left;
  }
  
  .password-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }
  
  label {
    font-weight: 700;
    color: var(--color-text);
  }
  
  .forgot-password {
    font-size: 0.9rem;
    color: var(--color-secondary);
    text-decoration: none;
  }
  .forgot-password:hover {
    text-decoration: underline;
  }
  
  input {
    width: 100%;
    padding: 14px 20px;
    border: none;
    border-radius: 8px;
    background-color: var(--color-background-input);
    font-size: 1rem;
    color: var(--color-text);
    box-sizing: border-box;
  }
  input::placeholder {
    color: var(--color-secondary);
  }
  
  .password-wrapper {
    position: relative;
  }
  .password-wrapper input {
    padding-right: 50px;
  }
  
  .toggle-password {
    position: absolute;
    top: 50%;
    right: 15px;
    transform: translateY(-50%);
    background: none;
    border: none;
    cursor: pointer;
    color: var(--color-secondary);
  }
  
  .btn-login {
    width: 100%;
    padding: 15px;
    border-radius: 8px;
    border: none;
    background-color: #A85B2C;
    color: var(--color-white);
    font-size: 1.1rem;
    font-weight: 700;
    cursor: pointer;
    transition: background-color 0.3s, box-shadow 0.3s;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  }
  .btn-login:hover {
    background-color: #5C3218;
    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.15);
  }
  
  .separator {
    text-align: center;
    margin: 2rem 0;
    color: var(--color-secondary);
    font-size: 0.9rem;
  }
  
  .social-login {
    display: flex;
    gap: 1rem;
  }
  
  .btn-social {
    flex: 1;
    background-color: var(--color-white);
    color: var(--color-text);
    border: 1px solid #D7CCC8;
    padding: 12px;
    border-radius: 8px;
    font-size: 1rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    transition: background-color 0.2s;
  }
  .btn-social:hover {
    background-color: #F5F5F5;
  }
  
  .signup-link {
    text-align: center;
    margin-top: 2rem;
    color: var(--color-text);
  }
  
  .signup-link a {
    color: var(--color-primary);
    text-decoration: none;
    font-weight: 700;
  }
  .signup-link a:hover {
    text-decoration: underline;
  }
  

  @media (max-width: 992px) {
    .login-page {
      flex-direction: column;
    }
    .image-panel {
      flex: none;
      height: 300px;
    }
    .form-panel {
      padding: 20px;
    }
    .form-content {
      flex-grow: 0;
      margin: 2rem auto;
    }
  }
</style>