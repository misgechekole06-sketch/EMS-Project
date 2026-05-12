import axios from "axios";

// Using the exact variable name from your Vercel settings for consistency
const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const api = axios.create({
  // This ensures we don't get double slashes (e.g., http://localhost:5000//api)
  baseURL: `${baseURL.replace(/\/$/, "")}/api`,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Standard error handling for expired tokens
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }

    // Log the actual error message from the server for easier debugging
    const errorMessage = error.response?.data?.message || error.message;
    console.error("API Error:", errorMessage);

    return Promise.reject(error);
  },
);

export default api;
