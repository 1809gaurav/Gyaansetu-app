/**
 * Base URL for the backend API.
 *
 * - When the frontend and backend are served from the same origin (e.g. the
 *   whole app running on Render), leave `VITE_API_URL` unset and all requests
 *   stay relative.
 * - When the frontend is hosted separately (e.g. Vercel) from the backend
 *   (Render), set `VITE_API_URL` to the backend origin, e.g.
 *   `https://gyansetu-api.onrender.com`.
 */
const rawBaseUrl = (import.meta.env.VITE_API_URL ?? "").trim().replace(/\/+$/, "");

export const API_BASE_URL = rawBaseUrl;

/** Turn an app-relative API path into an absolute URL when a base URL is set. */
export function apiUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
}
