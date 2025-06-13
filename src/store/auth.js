import { defineStore } from 'pinia';
import AuthService from '../services/authService';

// Lee los datos del usuario desde el almacenamiento local
const storedData = JSON.parse(localStorage.getItem('user'));

// Determina el perfil activo solo si hay un usuario normal almacenado
const activeProfile = (storedData && storedData.user?.rol === 'user') 
  ? localStorage.getItem('activeProfile') || 'Personal' 
  : null;

export const useAuthStore = defineStore('auth', {
  state: () => ({
    // 'data' contiene tanto el token como el objeto 'user'
    data: storedData || null,
    // 'activeProfile' solo es relevante para usuarios normales
    activeProfile: activeProfile,
  }),

  actions: {
    async login(userCredentials) {
      try {
        const responseData = await AuthService.login(userCredentials);
        this.data = responseData;
        
        // --- LÓGICA MODIFICADA ---
        // Si el backend devuelve un usuario con rol 'user', determinamos su perfil activo
        if (responseData.user?.rol === 'user') {
          const defaultProfile = responseData.user?.perfilPersonal ? 'Personal' : 'Ganaderia';
          this.setActiveProfile(defaultProfile);
        } else {
          // Si es un admin (o no tiene rol), no hay perfil activo.
          this.activeProfile = null;
          localStorage.removeItem('activeProfile');
        }

        return Promise.resolve(responseData);
      } catch (error) {
        // En caso de error en el login, limpiamos todo el estado
        this.logout(); 
        return Promise.reject(error);
      }
    },

    logout() {
      AuthService.logout();
      localStorage.removeItem('activeProfile'); 
      this.data = null;
      this.activeProfile = null;
    },

    async register(userData) {
      const response = await AuthService.register(userData);
      // Si un usuario ya logueado añade un nuevo perfil, actualizamos sus datos
      if (this.isLoggedIn && response.data.user) {
        this.updateUserData(response.data.user);
      }
      return response;
    },

    updateUserData(newUserData) {
      if (!this.data) return;
      // Recreamos el objeto 'data' con el nuevo 'user' y lo guardamos
      const updatedData = { ...this.data, user: newUserData };
      this.data = updatedData;
      localStorage.setItem('user', JSON.stringify(updatedData));
    },

    setActiveProfile(profileType) {
      // Esta acción solo debe funcionar para usuarios normales
      if (this.currentUser?.rol !== 'user') return;
      
      if (profileType === 'Personal' && this.currentUser?.perfilPersonal) {
        this.activeProfile = 'Personal';
      } else if (profileType === 'Ganaderia' && this.currentUser?.perfilGanaderia) {
        this.activeProfile = 'Ganaderia';
      }
      // Guardamos la preferencia en el almacenamiento local
      localStorage.setItem('activeProfile', this.activeProfile);
      console.log(`Perfil activo cambiado a: ${this.activeProfile}`);
    },

    async deleteAccount(credentials) {
      if (!credentials || !credentials.email || !credentials.password) {
        return Promise.reject(new Error("Credenciales no proporcionadas para eliminar la cuenta."));
      }
      
      try {
        await AuthService.deleteAccount(credentials);
        this.logout(); // Cerramos la sesión después de eliminar la cuenta
        return Promise.resolve({ message: "Cuenta eliminada exitosamente." });
      } catch (error) {
        return Promise.reject(error);
      }
    }
  },
  
  getters: {
    isLoggedIn: (state) => !!state.data,
    currentUser: (state) => state.data?.user || null,

    // --- GETTERS NUEVOS Y MODIFICADOS ---
    
    /**
     * Devuelve true si el usuario logueado tiene el rol de 'admin'.
     */
    isAdmin: (state) => state.data?.user?.rol === 'admin',

    /**
     * Devuelve los datos del perfil activo (Personal o Ganaderia).
     * No devuelve nada si el usuario es un administrador.
     */
    activeProfileData: (state) => {
      // Si no hay usuario o es un admin, no hay datos de perfil.
      if (!state.currentUser || state.currentUser.rol !== 'user') {
        return null;
      }
      if (state.activeProfile === 'Personal') {
        return state.currentUser.perfilPersonal;
      }
      if (state.activeProfile === 'Ganaderia') {
        return state.currentUser.perfilGanaderia;
      }
      return null;
    },
  },
});