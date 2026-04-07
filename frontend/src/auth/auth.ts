const KEY = "frioos_token";

export function isAuthenticated(): boolean {
  return Boolean(localStorage.getItem(KEY));
}

export function setToken(token: string) {
  localStorage.setItem("token", token);
}

export function getToken() {
  return localStorage.getItem("token");
}

export function clearToken() {
  localStorage.removeItem("token");
}

// alias, se em algum lugar você já usa logout()
export function logout(): void {
  clearToken();
}
