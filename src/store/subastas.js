import { defineStore } from "pinia";
import SubastaService from "../services/subastaService";

export const useSubastasStore = defineStore("subastas", {
  // 1. STATE: Datos centrales, incluyendo el buscador y sub-filtro de género
  state: () => ({
    subastas: [],
    myAuctions: [],
    isMyAuctionsLoading: false,
    pendingSubastas: [],
    isLoading: false,
    error: null,
    activeFilter: 'peso',
    genderSubFilter: 'todos',
    /**
     * ¡NUEVO! Estado para el término de búsqueda global.
     */
    searchQuery: '',
  }),

  // 2. GETTERS: Funciones para obtener datos derivados del state
  getters: {


    allSubastasForAdmin: (state) => {
      // Marcamos las pendientes para poder distinguirlas en el UI
      const pendingMarked = state.pendingSubastas.map(s => ({...s, esPendiente: true }));
      return [...pendingMarked, ...state.subastas];
    },


    getSubastaById: (state) => (subastaId) => {
          const id = Number(subastaId);
          // Primero busca en las subastas activas
          let subasta = state.subastas.find((s) => s.id === id);
          if (subasta) {
            return subasta;
          }
          // Si no la encuentra, busca en las pendientes (importante para el admin)
          subasta = state.pendingSubastas.find((s) => s.id === id);
          if (subasta) {
            // Le añadimos la marca 'esPendiente' para que el componente de detalles lo sepa
            return { ...subasta, esPendiente: true };
          }
          return null; // Si no se encuentra en ninguna parte
        },

    /**
     * Devuelve la lista de subastas procesada, aplicando todos los filtros en cascada.
     */
    processedSubastas: (state) => {
      if (!state.subastas || state.subastas.length === 0) return [];

      let processedList = [...state.subastas];

      if (state.searchQuery.trim() !== '') {
        const query = state.searchQuery.toLowerCase();
        processedList = processedList.filter(subasta => {
          const searchableContent = [
            subasta.titulo,
            subasta.descripcion,
            subasta.raza,
            subasta.edad,
            subasta.peso,
            subasta.genetica,
            subasta.categoria,
            subasta.genero,
            subasta.vendedor?.nombre
          ].map(field => field ?? '').join(' ').toLowerCase();
          
          return searchableContent.includes(query);
        });
      }

      // --- PASO 2: Filtrar por GÉNERO (si está activo) ---
      if (state.genderSubFilter !== 'todos') {
        processedList = processedList.filter(
          (subasta) => subasta.genero && subasta.genero.toLowerCase() === state.genderSubFilter
        );
      }
      
      // --- PASO 3: Aplicar filtro/ordenamiento principal desde el NavBar ---
      switch (state.activeFilter) {
        // Casos de ORDENAMIENTO
        case 'peso':
          return processedList.sort((a, b) => parseFloat(b.peso) - parseFloat(a.peso));
        case 'precio':
          return processedList.sort((a, b) => (b.puja || b.precioInicial) - (a.puja || a.precioInicial));
        case 'edad':
           return processedList.sort((a, b) => parseFloat(b.edad) - parseFloat(a.edad));
        case 'auctionDate':
          return processedList.sort((a, b) => new Date(a.fechaFinal) - new Date(b.fechaFinal));

        // Casos de FILTRADO ADICIONAL
        case 'ganaderia':
          return processedList.filter(s => s.vendedor?.tipo === 'Ganaderia');
        
        case 'personal':
          return processedList.filter(s => s.vendedor?.tipo === 'Personal');

        // Casos que no aplican más filtros aquí, pero mantienen los anteriores
        case 'genero':
        case 'raza':
        case 'certificacion':
        case 'vacunacion':
          return processedList;

        default:
          return processedList;
      }
    },
  },

  // 3. ACTIONS: Métodos para modificar el state
  actions: {
    async fetchSubastas(isAdmin = false) {
          this.isLoading = true;
          this.error = null;
          try {
            // Obtenemos las subastas activas
            const response = await SubastaService.getAll();
            this.subastas = response.data;

            // Si es admin, también obtenemos las pendientes
            if (isAdmin) {
              const pendingResponse = await SubastaService.getPending();
              this.pendingSubastas = pendingResponse.data;
            }

          } catch (err) {
            // ... (manejo de error existente)
          } finally {
            this.isLoading = false;
          }
        },


    async approveAuction(subastaId) {
      await SubastaService.manageAuction(subastaId, 'aprobar');
      // Refrescamos los datos para ver los cambios
      await this.fetchSubastas(true); 
    },
    
    async fetchMyAuctions(sellerName) {
      if (!sellerName) return;
      this.isMyAuctionsLoading = true;
      try {
        const response = await SubastaService.getAuctionsBySeller(sellerName);
        this.myAuctions = response.data;
      } catch (error) {
        console.error("Error al cargar mis subastas:", error);
      } finally {
        this.isMyAuctionsLoading = false;
      }
    },

    async rejectAuction(subastaId) {
      await SubastaService.manageAuction(subastaId, 'rechazar');
      await this.fetchSubastas(true);
    },
    
    setActiveFilter(filterName) {
      this.activeFilter = filterName;
      if (filterName !== 'genero') {
        this.genderSubFilter = 'todos';
      }
    },
    
    setGenderSubFilter(gender) {
      const validGenders = ['todos', 'macho', 'hembra'];
      if (validGenders.includes(gender)) {
        this.genderSubFilter = gender;
        this.activeFilter = 'genero';
      }
    },

    async placeBid(payload) {
      try {
        const response = await SubastaService.placeBid(payload.subastaId, {
          montoPuja: payload.montoPuja,
          pujador: payload.pujador,
        });
        const index = this.subastas.findIndex(s => s.id === payload.subastaId);
        if (index !== -1) {
          this.subastas[index] = response.data;
        }
        return Promise.resolve(response.data);
      } catch (error) {
        console.error("Error al realizar la puja:", error.response?.data || error.message);
        return Promise.reject(error.response?.data || { message: 'Error desconocido' });
      }
    },
    async addAuction(auctionData) {
      try {

        const response = await SubastaService.create(auctionData);
        return Promise.resolve(response.data);
      } catch (error) {
        console.error("Error al crear la subasta:", error.response?.data || error.message);
        return Promise.reject(error.response?.data || { message: 'Error desconocido' });
      }
    },

    /**
     * ¡NUEVO! Acción para actualizar el término de búsqueda.
     * Será llamada desde el componente del Header.
     */
    setSearchQuery(query) {
      this.searchQuery = query;
    }
  },
});