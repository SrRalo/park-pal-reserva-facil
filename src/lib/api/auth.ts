import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Interceptor para agregar el token a las peticiones
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  async login(email: string, password: string) {
    const response = await api.post('/login', { email, password });
    return response.data;
  },

  async register(userData: {
    name: string;
    email: string;
    password: string;
    role: string;
  }) {
    const response = await api.post('/register', userData);
    return response.data;
  },

  async logout() {
    const response = await api.post('/logout');
    return response.data;
  }
};
