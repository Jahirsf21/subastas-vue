// src/services/userService.js

import axios from 'axios';

const API_URL = 'http://localhost:3000/api/user/';

class UserService {
  addPaymentMethod(userId, cardData) {
    return axios.post(API_URL + `${userId}/payment-methods`, cardData);
  }

  deletePaymentMethod(userId, cardId) {
    return axios.delete(API_URL + `${userId}/payment-methods/${cardId}`);
  }
}

export default new UserService();