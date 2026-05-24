import axios, { type AxiosInstance } from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ?? '';

export const apiClient: AxiosInstance = axios.create({
  baseURL,
  timeout: 120_000,
  headers: {
    Accept: 'application/json',
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

export function getApiBaseUrl(): string {
  return baseURL;
}
