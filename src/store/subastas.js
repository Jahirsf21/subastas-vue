import { defineStore } from "pinia";
import SubastaService from "../services/subastaService";

export const useSubastasStore = defineStore("subastas", {
  // 1. STATE: Fusionado, con los nuevos campos para 'myBids'
  state: () => ({
    subastas: [],
    myAuctions: [],
    pendingSubastas: [],
    myBids: [],             // NUEVO: Para las subastas en las que el usuario ha pujado
    isLoading: false,
    isMyAuctionsLoading: false,
    isMyBidsLoading: false, // NUEVO: Estado de carga para las pujas
    error: null,
    activeFilter: 'peso',
    genderSubFilter: 'todos',
    searchQuery: '',
  }),

  // 2. GETTERS: Todos tus getters originales se mantienen intactos
  getters: {
    allSubastasForAdmin: (state) => {
      const pendingMarked = state.pendingSubastas.map(s => ({...s, esPendiente: true }));
      return [...pendingMarked, ...state.subastas];
    },

    getSubastaById: (state) => (subastaId) => {
      const id = Number(subastaId);
      let subasta = state.subastas.find((s) => s.id === id);
      if (subasta) {
        return subasta;
      }
      subasta = state.pendingSubastas.find((s) => s.id === id);
      if (subasta) {
        return { ...subasta, esPendiente: true };
      }
      return null;
    },

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

      if (state.genderSubFilter !== 'todos') {
        processedList = processedList.filter(
          (subasta) => subasta.genero && subasta.genero.toLowerCase() === state.genderSubFilter
        );
      }
      
      switch (state.activeFilter) {
        case 'peso':
          return processedList.sort((a, b) => parseFloat(b.peso) - parseFloat(a.peso));
        case 'precio':
          return processedList.sort((a, b) => (b.puja || b.precioInicial) - (a.puja || a.precioInicial));
        case 'edad':
           return processedList.sort((a, b) => parseFloat(b.edad) - parseFloat(a.edad));
        case 'auctionDate':
          return processedList.sort((a, b) => new Date(a.fechaFinal) - new Date(b.fechaFinal));
        case 'ganaderia':
          return processedList.filter(s => s.vendedor?.tipo === 'Ganaderia');
        case 'personal':
          return processedList.filter(s => s.vendedor?.tipo === 'Personal');
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

  // 3. ACTIONS: Fusionadas, con la nueva acción 'fetchMyBids'
  actions: {
    async fetchSubastas(isAdmin = false) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await SubastaService.getAll();
        this.subastas = response.data;
        if (isAdmin) {
          const pendingResponse = await SubastaService.getPending();
          this.pendingSubastas = pendingResponse.data;
        }
      } catch (err) {
        this.error = err.response?.data?.message || 'Error al cargar subastas.';
        console.error("Error en fetchSubastas:", err);
      } finally {
        this.isLoading = false;
      }
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
    
    /**
     * NUEVO: Obtiene la lista de subastas en las que el usuario ha pujado, con su estado.
     */
    async fetchMyBids(userId) {
      if (!userId) return;
      this.isMyBidsLoading = true;
      try {
        const response = await SubastaService.getMyBids(userId);
        this.myBids = response.data;
      } catch (error) {
        console.error("Error al cargar mis pujas:", error);
        this.myBids = [];
      } finally {
        this.isMyBidsLoading = false;
      }
    },

    async addAuction(auctionData) {
      try {
        const response = await SubastaService.create(auctionData);
        return Promise.resolve(response.data);
      } catch (error) {
        return Promise.reject(error.response?.data || { message: 'Error al crear la subasta' });
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
        return Promise.reject(error.response?.data || { message: 'Error al realizar la puja' });
      }
    },
    
    async approveAuction(subastaId) {
      await SubastaService.manageAuction(subastaId, 'aprobar');
      await this.fetchSubastas(true);
    },

    async rejectAuction(subastaId) {
      await SubastaService.manageAuction(subastaId, 'rechazar');
      await this.fetchSubastas(true);
    },
    
    // --- Acciones de filtrado (originales) ---
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

    setSearchQuery(query) {
      this.searchQuery = query;
    }
  },
});