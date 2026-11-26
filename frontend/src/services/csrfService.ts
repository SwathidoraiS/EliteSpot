const BASE_URL = import.meta.env.VITE_API_BASE_URL;

let csrfToken: string | null = null;

export async function getCsrfToken(): Promise<string> {
  if (csrfToken) return csrfToken;

  const response = await fetch(`${BASE_URL}/auth/csrf-token`, {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to obtain CSRF token");
  }

  const data = await response.json();

  if (!data.success || !data.csrfToken) {
    throw new Error("Invalid CSRF token response");
  }

  const token: string = data.csrfToken;
  csrfToken = token;
  return csrfToken;
}

export async function getCsrfHeaders(): Promise<Record<string, string>> {
  const token = await getCsrfToken();

  return {
    "X-CSRF-Token": token,
  };
}

export function clearCsrfToken() {
    csrfToken = null;
}