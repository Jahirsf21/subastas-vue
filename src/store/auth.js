// src/store/auth.js
import { defineStore } from 'pinia';
import AuthService from '../services/authService';

const user = JSON.parse(localStorage.getItem('user'));

export const useAuthStore = defineStore('auth', {
  state: () => ({
    status: {
      loggedIn: user ? true : false,
    },
    user: user,
  }),
  actions: {
    async login(user) {
      try {
        const response = await AuthService.login(user);
        this.status.loggedIn = true;
        this.user = response;
        return Promise.resolve(response);
      } catch (error) {
        this.status.loggedIn = false;
        this.user = null;
        return Promise.reject(error);
      }
    },
    logout() {
      AuthService.logout();
      this.status.loggedIn = false;
      this.user = null;
    },
    async register(user) {
      return AuthService.register(user);
    }
  },
  getters: {
    isLoggedIn: (state) => state.status.loggedIn,
    currentUser: (state) => state.user,
  },
});