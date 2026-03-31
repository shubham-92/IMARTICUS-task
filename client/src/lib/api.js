const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const buildHeaders = (customHeaders = {}) => {
  const token = window.localStorage.getItem("lms_token");
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...customHeaders
  };
};

export const apiGet = async (path) => {
  const response = await fetch(`${API_URL}${path}`, {
    headers: buildHeaders()
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || `Request failed: ${response.status}`);
  }

  return response.json();
};

export const apiPost = async (path, payload) => {
  const response = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: buildHeaders({
      "Content-Type": "application/json"
    }),
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || `Request failed: ${response.status}`);
  }

  return response.json();
};

export const apiPut = async (path, payload) => {
  const response = await fetch(`${API_URL}${path}`, {
    method: "PUT",
    headers: buildHeaders({
      "Content-Type": "application/json"
    }),
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || `Request failed: ${response.status}`);
  }

  return response.json();
};

export const apiUpload = async (path, formData) => {
  const response = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: buildHeaders(),
    body: formData
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || `Request failed: ${response.status}`);
  }

  return response.json();
};

export const apiDelete = async (path) => {
  const response = await fetch(`${API_URL}${path}`, {
    method: "DELETE",
    headers: buildHeaders()
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || `Request failed: ${response.status}`);
  }

  return response.json();
};
