import axios from "axios";

const api = axios.create({
  baseURL: "https://complaint-management-1j73.onrender.com/api",
  withCredentials: true
});

export default api;