import { isDesktopApp } from './platform';

// The browser build reaches the API through the dev proxy or the same origin; the desktop app needs an absolute URL.
const apiBase = import.meta.env.VITE_XBO_API_URL ?? (isDesktopApp() ? 'http://localhost:3000' : '');

export function apiUrl(path: string): string {
  return `${apiBase}/api/v1${path}`;
}
