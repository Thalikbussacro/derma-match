import axios from 'axios';

// Cliente HTTP único. withCredentials envia o cookie httpOnly de refresh.
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});
