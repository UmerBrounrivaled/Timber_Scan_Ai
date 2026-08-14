/**
 * API client for TimberScan AI backend.
 */

// If running in development or standalone, use configured backend URL or proxy
const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

async function request(path, options = {}) {
  // Try direct backend first, fallback to relative proxied path
  try {
    const directRes = await fetch(`${API_BASE}${path}`, options);
    if (directRes.ok) return directRes;
  } catch {
    // try relative proxy
  }

  const res = await fetch(path, options);
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
