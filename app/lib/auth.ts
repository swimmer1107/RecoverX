/**
 * Thin localStorage auth store.
 * Works in browser only — always check if window is defined.
 */

export type UserRole = "patient" | "doctor";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  // Patient-specific fields (optional for doctors)
  week?: number;
  surgeryType?: string;
  surgeryDate?: string;
  side?: string;
  surgeon?: string;
  hospital?: string;
}

const KEY = "ag_user";

export function saveUser(user: AuthUser): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(user));
}

export function getUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function updateUser(patch: Partial<AuthUser>): void {
  const current = getUser();
  if (!current) return;
  saveUser({ ...current, ...patch });
}

export function clearUser(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
}

/** Returns initials (up to 2 chars) from a full name */
export function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .slice(0, 2)
    .join("");
}
