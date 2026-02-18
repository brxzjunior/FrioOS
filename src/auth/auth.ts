const KEY = "frioos_token";

export function isAuthenticated() {
  return !!localStorage.getItem(KEY);
}

export function setToken(token: string) {
  localStorage.setItem(KEY, token);
}

export function getToken() {
  return localStorage.getItem(KEY);
}

export function logout() {
  localStorage.removeItem(KEY);
}
