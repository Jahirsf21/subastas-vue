// src/services/subastaService.js

import axios from 'axios';

const API_URL = 'http://localhost:3000/api/';

class SubastaService {
  /**
   * Obtiene todas las subastas activas del backend.
   * @returns {Promise<AxiosResponse<any>>}
   */
  getAll() {
    // Hace una petición GET a http://localhost:3000/api/subastas
    return axios.get(API_URL + 'subastas');
  }

  /**
   * (Opcional, pero recomendado) Obtiene una sola subasta por su ID.
   * @param {number} id - El ID de la subasta a obtener.
   * @returns {Promise<AxiosResponse<any>>}
   */
  getById(id) {
    return axios.get(API_URL + `subastas/${id}`);
  }

  /**
   * Envía una puja para una subasta específica.
   * @param {number} subastaId - El ID de la subasta.
   * @param {object} bidData - Los datos de la puja, ej: { montoPuja: 1000, pujador: 'Nombre' }.
   * @returns {Promise<AxiosResponse<any>>}
   */
  placeBid(subastaId, bidData) {
    // bidData = { montoPuja: number, pujador: string }
    return axios.post(API_URL + `subastas/${subastaId}/pujar`, bidData);
  }

  /**
   * Crea una nueva subasta. La enviará al endpoint que la guardará como pendiente.
   * @param {object} auctionData - Los datos de la subasta del formulario.
   * @returns {Promise<AxiosResponse<any>>}
   */
  create(auctionData) {
    // Nota: Si estuvieras subiendo archivos de imagen, aquí usarías 'FormData'.
    // Por ahora, como se maneja en el ejemplo, enviamos un objeto JSON.
    return axios.post(API_URL + 'subastas', auctionData);
  }

  getPending() {
    return axios.get(API_URL + 'admin/subastas-pendientes');
  }

  manageAuction(subastaId, action) {
    return axios.post(API_URL + `admin/subastas/${subastaId}/manage`, { action });
  }


  getAuctionsBySeller(sellerName) {
    return axios.get(`${API_URL}user/subastas`, { params: { nombreVendedor: sellerName } });
  }

}

// Exportamos una instancia de la clase para poder usarla en otros archivos
export default new SubastaService();