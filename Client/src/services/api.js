import axios from "axios";

const api = axios.create({
  baseURL:
    "https://shopkart-backend-3iu654u86-priyansh05khanna-8752s-projects.vercel.app",
  withCredentials: true,
});

export default api;
