import { getToken } from "./auth";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export const apiFetch = async (path: string, options: RequestInit = {}) => {
  const token = getToken();
  const res = await fetch(`${BACKEND_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  return res.json();
};
