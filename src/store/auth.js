import { defineStore } from 'pinia';
import AuthService from '../services/authService';

const storedData = JSON.parse(localStorage.getItem('user'));
const activeProfile = localStorage.getItem('activeProfile') || 'Personal';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    data: storedData || null,
    activeProfile: storedData ? activeProfile : null,
  }),

  actions: {
    async login(userCredentials) {
      try {
        const responseData = await AuthService.login(userCredentials);
        this.data = responseData;
        const defaultProfile = responseData.user?.perfilPersonal ? 'Personal' : 'Ganaderia';
        this.setActiveProfile(defaultProfile);
        return Promise.resolve(responseData);
      } catch (error) {
        this.data = null;
        this.activeProfile = null;
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
      if (this.isLoggedIn && response.data.user) {
        this.updateUserData(response.data.user);
      }
      return response;
    },

    updateUserData(newUserData) {
      if (!this.data) return;
      const updatedData = { ...this.data, user: newUserData };
      this.data = updatedData;
      localStorage.setItem('user', JSON.stringify(updatedData));
    },
    setActiveProfile(profileType) {
      if (profileType === 'Personal' && this.currentUser?.perfilPersonal) {
        this.activeProfile = 'Personal';
      } else if (profileType === 'Ganaderia' && this.currentUser?.perfilGanaderia) {
        this.activeProfile = 'Ganaderia';
      }
      localStorage.setItem('activeProfile', this.activeProfile);
      console.log(`Perfil activo cambiado a: ${this.activeProfile}`);
    },

    async deleteAccount(credentials) {
      if (!credentials || !credentials.email || !credentials.password) {
        return Promise.reject(new Error("Credenciales no proporcionadas para eliminar la cuenta."));
      }
      
      try {
        await AuthService.deleteAccount(credentials);

        this.logout(); 

        return Promise.resolve({ message: "Cuenta eliminada exitosamente." });
      } catch (error) {
        return Promise.reject(error);
      }
    }
  },
  
  getters: {
    isLoggedIn: (state) => !!state.data,
    currentUser: (state) => state.data?.user || null,
    activeProfileData: (state) => {
      if (!state.currentUser) return null;
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