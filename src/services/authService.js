// src/services/authService.js
import axios from 'axios';

const API_URL = 'http://localhost:3000/api/auth/'; 

class AuthService {
  login(user) {
    return axios
      .post(API_URL + 'login', {
        email: user.email,
        password: user.password
      })
      .then(response => {
        if (response.data.token) {
          localStorage.setItem('user', JSON.stringify(response.data));
        }
        return response.data;
      });
  }

  logout() {
    localStorage.removeItem('user');
  }

  register(userData) {
    return axios.post(API_URL + 'register', {
        nombreCompleto: userData.nombreCompleto,
        tipoCedula: userData.tipoCedula,
        cedula: userData.cedula,
        telefono: userData.telefono,
        fechaNacimiento: userData.fechaNacimiento,
        email: userData.email,
        direccion: userData.direccion, 
        password: userData.password
    });
  }
}

export default new AuthService();