/**
 * API client for TimberScan AI backend.
 */

// Render backend URL fallback for Vercel / external frontend hosting
const DEFAULT_RENDER_BACKEND = 'https://timber-scan-ai-2.onrender.com';

// Determine API base URL dynamically
const getApiBase = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/$/, '');
  }
  // In production browser environments (not localhost):
  if (
    typeof window !== 'undefined' &&
    window.location &&
    !window.location.hostname.includes('localhost') &&
    !window.location.hostname.includes('127.0.0.1')
  ) {
    // If running directly on Render (same origin as backend API), use relative path
    if (window.location.hostname.includes('onrender.com')) {
      return '';
    }
    // If running on Vercel or third-party static host, point to Render backend URL
    return DEFAULT_RENDER_BACKEND;
  }
  return 'http://127.0.0.1:8000';
};

export const API_BASE = getApiBase();

/**
 * Returns full or relative URL for sample image files based on environment
 */
export function getSampleFileUrl(filename) {
  if (!filename) return '';
  const cleanFilename = encodeURIComponent(filename);
  if (API_BASE) {
    return `${API_BASE}/samples/files/${cleanFilename}`;
  }
  return `/samples/files/${cleanFilename}`;
}

async function request(path, options = {}) {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  // 1. Try explicit API_BASE if set
  if (API_BASE) {
    try {
      const directRes = await fetch(`${API_BASE}${cleanPath}`, options);
      if (directRes.ok) return directRes;
    } catch {
      // Direct request failed (CORS or network error), fallback to relative
    }
  }

  // 2. Try relative path (works when frontend is served from same domain or reverse-proxied)
  const res = await fetch(cleanPath, options);
  return res;
}

export async function fetchHealth() {
  try {
    const res = await request('/health', { method: 'GET' });
    if (res && res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Backend health check error:', err);
  }
  return null;
}

export async function fetchSamples() {
  const res = await request('/samples', { method: 'GET' });
  if (!res || !res.ok) {
    throw new Error(`Failed to fetch samples: ${res?.statusText || 'Network error'}`);
  }
  return await res.json();
}

export async function predictSample(filename) {
  const res = await request(`/predict-sample/${encodeURIComponent(filename)}`, {
    method: 'POST',
  });
  if (!res || !res.ok) {
    const errorData = await res?.json().catch(() => ({}));
    throw new Error(errorData.detail || `Inference error: ${res?.statusText || 'Network error'}`);
  }
  return await res.json();
}

export async function predictUpload(file) {
  const formData = new FormData();
  formData.append('file', file);

  const res = await request('/predict', {
    method: 'POST',
    body: formData,
  });

  if (!res || !res.ok) {
    const errorData = await res?.json().catch(() => ({}));
    throw new Error(errorData.detail || `Upload inference error: ${res?.statusText || 'Network error'}`);
  }
  return await res.json();
}

