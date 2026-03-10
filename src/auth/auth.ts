const KEY = "frioos_token";

export function isAuthenticated(): boolean {
  return Boolean(localStorage.getItem(KEY));
}

export function setToken(token: string): void {
  localStorage.setItem(KEY, token);
}

export function getToken(): string | null {
  return localStorage.getItem(KEY);
}

export function logout(): void {
  localStorage.removeItem(KEY);
}
