import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// Request interceptor to attach JWT token and handle multipart
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("agriassist_token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (config.data instanceof FormData && config.headers) {
      delete config.headers["Content-Type"];
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for structured error extraction
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token if expired or invalid
      if (!window.location.pathname.includes("/login") && !window.location.pathname.includes("/signup")) {
        localStorage.removeItem("agriassist_token");
        localStorage.removeItem("agriassist_user");
        window.location.href = "/login";
      }
    }
    const message =
      error.response?.data?.error?.message ||
      error.response?.data?.message ||
      error.message ||
      "An unexpected error occurred. Please try again.";
    return Promise.reject(new Error(message));
  }
);
