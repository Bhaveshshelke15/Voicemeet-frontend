import axios from "axios";

const API = axios.create({
  baseURL: "https://voicemeet.onrender.com"
});

API.interceptors.request.use((config) => {

  const token =
    localStorage.getItem("adminToken") ||
    localStorage.getItem("userToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;

});

export default API;