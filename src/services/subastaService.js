// src/services/subastaService.js

import axios from 'axios';

const API_URL = 'http://localhost:3000/api/';

class SubastaService {
  /**
   * Obtiene todas las subastas del backend.
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

  placeBid(subastaId, bidData) {
    // bidData = { montoPuja: number, pujador: string }
    return axios.post(API_URL + `subastas/${subastaId}/pujar`, bidData);
  }

}

// Exportamos una instancia de la clase para poder usarla en otros archivos
export default new SubastaService();