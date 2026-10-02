import axios from "axios";

const AxiosClient = axios.create({
  baseURL: import.meta.env.MODE === "development" ? "http://localhost:3000/api" : "/api",
  timeout: 5000,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

export default AxiosClient;
