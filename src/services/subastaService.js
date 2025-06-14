// src/services/subastaService.js

import axios from 'axios';

const API_URL = 'http://localhost:3000/api/';

class SubastaService {
  /**
   * Obtiene todas las subastas activas del backend.
   * @returns {Promise<AxiosResponse<any>>}
   */
  getAll() {
    return axios.get(API_URL + 'subastas');
  }

  /**
   * Obtiene una sola subasta por su ID (activa, pendiente o rechazada).
   * @param {number} id - El ID de la subasta a obtener.
   * @returns {Promise<AxiosResponse<any>>}
   */
  getById(id) {
    return axios.get(API_URL + `subastas/${id}`);
  }

  /**
   * Envía una puja para una subasta específica.
   * @param {number} subastaId - El ID de la subasta.
   * @param {object} bidData - Los datos de la puja, ej: { montoPuja: 1000, pujador: { id, nombre } }.
   * @returns {Promise<AxiosResponse<any>>}
   */
  placeBid(subastaId, bidData) {
    return axios.post(API_URL + `subastas/${subastaId}/pujar`, bidData);
  }

  /**
   * Crea una nueva subasta, incluyendo la subida de archivos.
   * @param {FormData} auctionFormData - Los datos de la subasta empaquetados como FormData.
   * @returns {Promise<AxiosResponse<any>>}
   */
  create(auctionFormData) {
    return axios.post(API_URL + 'subastas', auctionFormData);
  }

  // --- MÉTODOS DE ADMINISTRADOR ---

  /**
   * Obtiene todas las subastas pendientes de aprobación.
   * @returns {Promise<AxiosResponse<any>>}
   */
  getPending() {
    return axios.get(API_URL + 'admin/subastas-pendientes');
  }

  /**
   * Aprueba o rechaza una subasta pendiente.
   * @param {number} subastaId - El ID de la subasta a gestionar.
   * @param {string} action - La acción a realizar ('aprobar' o 'rechazar').
   * @returns {Promise<AxiosResponse<any>>}
   */
  manageAuction(subastaId, action) {
    return axios.post(API_URL + `admin/subastas/${subastaId}/manage`, { action });
  }

  // --- MÉTODOS DE USUARIO Y VENDEDOR ---
  
  /**
   * Obtiene todas las subastas (activas, pendientes y rechazadas) de un vendedor específico.
   * @param {string} sellerName - El nombre del vendedor.
   * @returns {Promise<AxiosResponse<any>>}
   */
  getAuctionsBySeller(sellerName) {
    return axios.get(`${API_URL}user/subastas`, { params: { nombreVendedor: sellerName } });
  }

  /**
   * NUEVO: Obtiene la lista de subastas en las que un usuario ha pujado, con su estado.
   * @param {number} userId - El ID del usuario.
   * @returns {Promise<AxiosResponse<any>>}
   */
  getMyBids(userId) {
    return axios.get(API_URL + `user/${userId}/pujas`);
  }

  /**
   * NUEVO: Finaliza una subasta y establece un ganador.
   * @param {number} subastaId - El ID de la subasta.
   * @param {object} winnerData - Datos del ganador, ej: { usuarioId, nombrePujador, monto }
   * @returns {Promise<AxiosResponse<any>>}
   */
  finalizeAuction(subastaId, winnerData) {
    return axios.post(API_URL + `subastas/${subastaId}/finalizar`, { ganadorInfo: winnerData });
  }
}

// Exportamos una instancia de la clase para poder usarla en otros archivos
export default new SubastaService();