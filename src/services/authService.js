import axios from 'axios';

const API_URL = 'http://localhost:3000/api/auth/';

class AuthService {
  login(userCredentials) {
    return axios
      .post(API_URL + 'login', {
        email: userCredentials.email,
        password: userCredentials.password
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

  register(registrationData) {
    return axios.post(API_URL + 'register', registrationData);
  }

  deleteAccount(credentials) {
    return axios.delete(API_URL + 'account', { data: credentials });
  }
}

export default new AuthService();