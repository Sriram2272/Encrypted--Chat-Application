import { apiRequest } from "./queryClient";

export interface AuthResponse {
  token: string;
  user: {
    id: number;
    username: string;
    isAdmin: boolean;
  };
}

export interface UserPublicKey {
  id: number;
  username: string;
  publicKey: string;
}

export async function register(
  username: string,
  password: string,
  publicKey: string,
  isAdmin?: boolean
): Promise<AuthResponse> {
  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password, publicKey, isAdmin }),
  });
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Registration failed");
  }
  
  return res.json();
}

export async function login(username: string, password: string): Promise<AuthResponse> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Login failed");
  }
  
  return res.json();
}

export async function fetchUsers(token: string) {
  const res = await fetch("/api/users", {
    headers: { Authorization: `Bearer ${token}` },
  });
  
  if (!res.ok) throw new Error("Failed to fetch users");
  return res.json();
}

export async function fetchUserPublicKey(userId: number, token: string): Promise<UserPublicKey> {
  const res = await fetch(`/api/users/${userId}/pubkey`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  
  if (!res.ok) throw new Error("Failed to fetch public key");
  return res.json();
}

export async function toggleUserDisabled(userId: number, token: string) {
  const res = await fetch(`/api/admin/users/${userId}/toggle`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  
  if (!res.ok) throw new Error("Failed to toggle user status");
  return res.json();
}

export async function fetchAdminMessages(token: string) {
  const res = await fetch("/api/admin/messages", {
    headers: { Authorization: `Bearer ${token}` },
  });
  
  if (!res.ok) throw new Error("Failed to fetch messages");
  return res.json();
}
