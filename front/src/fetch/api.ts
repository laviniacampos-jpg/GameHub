function getApiBaseUrl() {
  if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
    return `${window.location.protocol}//${window.location.hostname}:3001/api`;
  }

  const configuredUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (configuredUrl) {
    return configuredUrl.replace(/\/+$/, "");
  }

  if (typeof window !== "undefined") {
    return `${window.location.protocol}//${window.location.hostname}:3001/api`;
  }

  return "http://localhost:3001/api";
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = typeof window !== "undefined"
    ? window.localStorage.getItem("gamehub-token")
    : null;

  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  });

  if (!response.ok) {
    if (response.status === 401 && typeof window !== "undefined") {
      window.localStorage.removeItem("gamehub-token");
      window.localStorage.removeItem("gamehub-user");
      window.dispatchEvent(new Event("gamehub:unauthorized"));
    }
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.message ?? "Não foi possível concluir a requisição.");
  }

  return response.json() as Promise<T>;
}
