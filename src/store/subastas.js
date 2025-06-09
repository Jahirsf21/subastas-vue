// src/store/subastas.js

import { defineStore } from "pinia";
import { ref } from "vue";
import SubastaService from "../services/subastaService"; // 1. Importamos el servicio

// Usamos el formato de "options" que es un poco más claro para stores complejos
export const useSubastasStore = defineStore("subastas", {
  // 2. STATE: Aquí definimos los datos que queremos gestionar
  state: () => ({
    /** @type {Array<any>} El array que contendrá las subastas */
    subastas: [],
    /** @type {boolean} Verdadero si estamos cargando datos */
    isLoading: false,
    /** @type {string|null} Guarda un mensaje de error si algo falla */
    error: null,
  }),

  // 3. GETTERS: Funciones para obtener datos computados del state
  getters: {
    // Un getter para encontrar una subasta por su ID
    getSubastaById: (state) => (subastaId) => {
      return state.subastas.find((subasta) => subasta.id === subastaId);
    },
  },

  // 4. ACTIONS: Métodos para modificar el state (generalmente de forma asíncrona)
  actions: {
    /**
     * Carga todas las subastas desde el backend y actualiza el state.
     */
    async fetchSubastas() {
      this.isLoading = true; // Indicamos que la carga ha comenzado
      this.error = null;
      try {
        const response = await SubastaService.getAll(); // Llamamos al servicio
        this.subastas = response.data; // Guardamos los datos en el state
      } catch (err) {
        console.error("Error al cargar las subastas:", err);
        this.error = "No se pudieron cargar las subastas. Intente de nuevo más tarde.";
      } finally {
        this.isLoading = false; // Indicamos que la carga ha terminado (con éxito o error)
      }
    },
  },
});