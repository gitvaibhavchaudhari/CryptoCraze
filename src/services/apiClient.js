const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8787/api";

export async function apiRequest(path, options = {}) {
  let response;

  try {
    response = await fetch(`${API_BASE}${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers
      },
      ...options
    });
  } catch (error) {
    throw new Error(`Unable to reach the API at ${API_BASE}. Start the API server and try again.`);
  }

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.error || "Request failed.");
  }

  return payload;
}
