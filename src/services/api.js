import axios from 'axios';
import Cookies from 'js-cookie';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_KEY_ADMIN,
});

api.interceptors.request.use(
    (config) => {
      const token = Cookies.get('token');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
export { api };