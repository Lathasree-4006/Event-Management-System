
export const BACKEND_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:8080"
).replace(/\/$/, "");

export const API_URL = `${BACKEND_URL}/api`;
