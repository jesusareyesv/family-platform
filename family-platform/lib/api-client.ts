import { Transaction, TransactionInsert } from "./types";
import { getToken, clearToken } from "./token";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (res.status === 401) {
    clearToken();
    window.location.href = "/login";
    throw new Error("Session expired");
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail ?? `API error ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export async function apiLogin(email: string, password: string): Promise<string> {
  const data = await apiFetch<{ access_token: string }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  return data.access_token;
}

export async function apiRegister(
  email: string,
  password: string
): Promise<{ access_token: string; message?: string }> {
  return apiFetch("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

// ── Transactions ──────────────────────────────────────────────────────────────

export async function getTransactions(month: string): Promise<Transaction[]> {
  return apiFetch(`/transactions?month=${month}`);
}

export async function createTransaction(tx: TransactionInsert): Promise<Transaction> {
  return apiFetch("/transactions", {
    method: "POST",
    body: JSON.stringify(tx),
  });
}

export async function updateTransaction(
  id: string,
  tx: Partial<TransactionInsert>
): Promise<Transaction> {
  return apiFetch(`/transactions/${id}`, {
    method: "PUT",
    body: JSON.stringify(tx),
  });
}

export async function deleteTransaction(id: string): Promise<void> {
  return apiFetch(`/transactions/${id}`, { method: "DELETE" });
}
