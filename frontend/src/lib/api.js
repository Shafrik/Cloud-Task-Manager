const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

async function request(path, options = {}) {
  const method = options.method ?? "GET";
  const headers = {
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...options.headers,
  };
  if (!["GET", "HEAD", "OPTIONS", "TRACE"].includes(method.toUpperCase())) {
    headers["X-CSRFToken"] = await getCsrfToken();
  }

  const response = await fetch(`${API_BASE_URL}/api${path}`, {
    ...options,
    method,
    credentials: "include",
    headers,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const message = body
      ? Object.entries(body)
          .map(([field, errors]) =>
            `${field === "non_field_errors" ? "" : `${field}: `}${Array.isArray(errors) ? errors.join(", ") : errors}`,
          )
          .join(" ")
      : `Request failed (${response.status}).`;
    const error = new Error(message || `Request failed (${response.status}).`);
    error.status = response.status;
    throw error;
  }

  if (response.status === 204) return null;
  return response.json();
}

async function getCsrfToken() {
  const response = await fetch(`${API_BASE_URL}/api/auth/csrf/`, { credentials: "include" });
  if (!response.ok) throw new Error("Could not start a secure session. Please try again.");
  const data = await response.json();
  return data.csrfToken;
}

export function getCurrentUser() {
  return request("/auth/me/").then((response) => response.user);
}

export function signIn(credentials) {
  return request("/auth/login/", { method: "POST", body: JSON.stringify(credentials) }).then((response) => response.user);
}

export function signUp(credentials) {
  return request("/auth/register/", { method: "POST", body: JSON.stringify(credentials) }).then((response) => response.user);
}

export function signOut() {
  return request("/auth/logout/", { method: "POST" });
}

export function getTasks(filters = {}) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value) params.set(key, value);
  }
  const query = params.toString();
  return request(`/tasks/${query ? `?${query}` : ""}`);
}

export function getStats() {
  return request("/tasks/stats/");
}

export function createTask(task) {
  return request("/tasks/", { method: "POST", body: JSON.stringify(task) });
}

export function updateTask(id, task) {
  return request(`/tasks/${id}/`, { method: "PATCH", body: JSON.stringify(task) });
}

export function deleteTask(id) {
  return request(`/tasks/${id}/`, { method: "DELETE" });
}

export function completeTask(id) {
  return request(`/tasks/${id}/complete/`, { method: "POST" });
}
