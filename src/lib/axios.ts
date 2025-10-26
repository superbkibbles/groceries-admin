import axios from "axios";

// Create axios instance with base URL
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

// Function to get current language from localStorage
const getCurrentLanguage = (): string => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("preferred_language") || "en";
  }
  return "en";
};

// Add request interceptor to attach token and language to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add language header
    const language = getCurrentLanguage();
    config.headers["Accept-Language"] = language;

    // Add language query parameter if not already present
    if (!config.params) {
      config.params = {};
    }
    if (!config.params.lang) {
      config.params.lang = language;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized errors
    if (error.response && error.response.status === 401) {
      // Clear token and redirect to login if unauthorized
      localStorage.removeItem("token");
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
