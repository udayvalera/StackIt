// api/apiClient.ts
import axios from 'axios';

/**
 * Creates a pre-configured instance of axios.
 * This instance includes the base URL for all API requests and
 * settings to handle credentials (like cookies) automatically.
 */
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_APP_API_URL, // Your API base URL
  withCredentials: true, // This is crucial for sending cookies with requests
});

export default apiClient;