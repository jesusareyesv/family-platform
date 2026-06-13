const KEY = "family_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(KEY, token);
  // Also write a non-HttpOnly cookie so Next.js middleware can read it
  document.cookie = `${KEY}=${token}; path=/; samesite=strict`;
}

export function clearToken(): void {
  localStorage.removeItem(KEY);
  document.cookie = `${KEY}=; path=/; max-age=0`;
}

/** Decode the JWT payload without verifying the signature (browser-side only). */
export function getTokenPayload(): Record<string, unknown> | null {
  const token = getToken();
  if (!token) return null;
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
}
