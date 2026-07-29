import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "https://complaint-management-1j73.onrender.com";

const api = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true
});

export default api;