import axios from "axios";

const api = axios.create({
  baseURL: "https://shopkart-backend-eight.vercel.app",
  withCredentials: true,
});

export default api;
