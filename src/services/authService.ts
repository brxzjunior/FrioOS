import { api } from "./api";

export type AuthResponse = {
  token: string;
  user: { id: string; name: string; email: string };
};

export async function signup(input: {
  name: string;
  email: string;
  password: string;
}) {
  const res = await api.post<AuthResponse>("/auth/signup", input);
  return res.data;
}

export async function login(input: { email: string; password: string }) {
  const res = await api.post<AuthResponse>("/auth/login", input);
  return res.data;
}

export async function forgotPassword(email: string) {
  const res = await api.post("/auth/forgot-password", { email });
  return res.data;
}
