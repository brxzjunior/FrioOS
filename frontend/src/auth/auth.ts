const KEY = "frioos_token";

export function isAuthenticated(): boolean {
  return Boolean(localStorage.getItem(KEY));
}

export function setToken(token: string) {
  localStorage.setItem(KEY, token);
}

export function getToken() {
  return localStorage.getItem(KEY);
}

export function clearToken() {
  localStorage.removeItem(KEY);
}

export function logout(): void {
  clearToken();
}