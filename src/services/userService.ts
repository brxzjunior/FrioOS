// src/services/userService.ts
import api from "./api";

export async function getMe() {
  const res = await api.get("/me");
  return res.data;
}

export async function updateProfile(data: {
  name?: string;
  avatarUrl?: string;
}) {
  const res = await api.put("/me", data);
  return res.data;
}
