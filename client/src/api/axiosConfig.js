import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5050/api',
});

// Automatically add the token to every request if it exists
API.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('userInfo'));
  if (user && user.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

export default API;
