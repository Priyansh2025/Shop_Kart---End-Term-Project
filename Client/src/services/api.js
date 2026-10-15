import axios from "axios";

const api = axios.create({
  baseURL: "https://shopkart-backend.vercel.app",
  withCredentials: true,
});

export default api;
