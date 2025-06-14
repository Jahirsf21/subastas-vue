import { defineStore } from 'pinia';
import AuthService from '../services/authService';

const storedData = JSON.parse(localStorage.getItem('user'));
const activeProfile = (storedData && storedData.user?.rol === 'user') 
  ? localStorage.getItem('activeProfile') || 'Personal' 
  : null;

export const useAuthStore = defineStore('auth', {
  state: () => ({
    data: storedData || null,
    activeProfile: activeProfile,
  }),

  actions: {
    async login(userCredentials) {
      try {
        const responseData = await AuthService.login(userCredentials);
        this.data = responseData;
        
        if (responseData.user?.rol === 'user') {
          const defaultProfile = responseData.user?.perfilPersonal ? 'Personal' : 'Ganaderia';
          this.setActiveProfile(defaultProfile);
        } else {
          this.activeProfile = null;
          localStorage.removeItem('activeProfile');
        }

        return Promise.resolve(responseData);
      } catch (error) {
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
      if (this.currentUser?.rol !== 'user') return;
      
      if (profileType === 'Personal' && this.currentUser?.perfilPersonal) {
        this.activeProfile = 'Personal';
      } else if (profileType === 'Ganaderia' && this.currentUser?.perfilGanaderia) {
        this.activeProfile = 'Ganaderia';
      }
      localStorage.setItem('activeProfile', this.activeProfile);
    },

    async deleteAccount(credentials) {
      if (!credentials || !credentials.email || !credentials.password) {
        return Promise.reject(new Error("Credenciales no proporcionadas."));
      }
      
      try {
        await AuthService.deleteAccount(credentials);
        this.logout();
        return Promise.resolve({ message: "Cuenta eliminada." });
      } catch (error) {
        return Promise.reject(error);
      }
    }
  },
  
  getters: {
    isLoggedIn: (state) => !!state.data,
    currentUser: (state) => state.data?.user || null,
    isAdmin: (state) => state.data?.user?.rol === 'admin',
    activeProfileData: (state) => {
      if (!state.currentUser || state.currentUser.rol !== 'user') return null;
      
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