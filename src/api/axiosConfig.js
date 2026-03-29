import axios from "axios";

const API = axios.create({
  baseURL: "https://voicemeet.onrender.com",
  timeout: 15000, // 🔥 important for mobile
});

API.interceptors.request.use((config) => {
  const token = window.localStorage.getItem("token"); // safer for mobile

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default API;