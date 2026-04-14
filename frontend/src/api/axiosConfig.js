import axios from 'axios';

let baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5050/api';

// Robustness: ensure baseURL ends with /api without doubling it
baseUrl = baseUrl.trim();
if (!baseUrl.endsWith('/api') && !baseUrl.endsWith('/api/')) {
    baseUrl = baseUrl.endsWith('/') ? `${baseUrl}api` : `${baseUrl}/api`;
}

const API = axios.create({
  baseURL: baseUrl,
  withCredentials: true,
});

// Automatically add the token to every request if it exists
API.interceptors.request.use((config) => {
  // LOGGING FOR DEBUGGING
  console.log(`🚀 API Request: ${config.method.toUpperCase()} ${config.baseURL}${config.url}`);

  const user = JSON.parse(localStorage.getItem('userInfo'));
  if (user && user.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

// Automatically handle session expiration (401 errors)
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response, config } = error;
    
    if (response?.status === 401) {
      const message = response.data?.message?.toLowerCase() || '';
      const isAuthEndpoint = config.url.includes('/login') || config.url.includes('/signup');
      const isVerifyError = message.includes('verify');

      // Only redirect to login if it's NOT an auth endpoint and NOT a verification error
      if (!isAuthEndpoint && !isVerifyError) {
        console.log('🚪 Session expired or unauthorized. Redirecting to login...');
        localStorage.removeItem('userInfo');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default API;

