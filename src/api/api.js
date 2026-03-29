import axios from "axios";

const API = axios.create({
  baseURL: "https://voicemeet.onrender.com",
  withCredentials: false,
});

// 🔐 Attach token automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// ✅ ADD THESE FUNCTIONS (IMPORTANT FIX)

export const adminLogin = (data) => {
  return API.post("/auth/admin/login", data);
};

export const userLogin = (data) => {
  return API.post("/auth/user/login", data);
};

export default API;