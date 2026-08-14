/**
 * API client for TimberScan AI backend.
 */

export async function fetchHealth() {
  try {
    const res = await fetch('/health', { method: 'GET' }).catch(() => null);
    if (!res || !res.ok) {
      const rootRes = await fetch('/', { method: 'GET' });
      return await rootRes.json();
    }
    return await res.json();
  } catch (err) {
    console.warn('Backend offline or health check failed', err);
    return null;
  }
}

export async function fetchSamples() {
  const res = await fetch('/samples');
  if (!res.ok) {
    throw new Error(`Failed to fetch samples: ${res.statusText}`);
  }
  return await res.json();
}

export async function predictSample(filename) {
  const res = await fetch(`/predict-sample/${encodeURIComponent(filename)}`, {
    method: 'POST',
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Inference error: ${res.statusText}`);
  }
  return await res.json();
}

export async function predictUpload(file) {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch('/predict', {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Upload inference error: ${res.statusText}`);
  }
  return await res.json();
}
