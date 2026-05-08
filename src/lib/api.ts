import axios from "axios";
import { useAuthStore } from "../store/authStore";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080/api/v1";

export const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;

  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const { refreshToken } = useAuthStore.getState();

      if (!refreshToken) {
        useAuthStore.getState().logout();
        window.location.href = "/";
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(
          "http://localhost:8080/api/v1/auth/refresh",
          { refreshToken },
        );

        const newToken = response.data.data.token;
        const newRefreshToken = response.data.data.refreshToken;

        console.log("Token:", newToken);
        console.log("RefreshToken:", newRefreshToken);

        useAuthStore.getState().setAuth(newToken, newRefreshToken);

        originalRequest.headers["Authorization"] = `Bearer ${newToken}`;

        return api(originalRequest);
      } catch {
        useAuthStore.getState().logout();
        window.location.href = "/";
      }
    }

    return Promise.reject(error);
  },
);
