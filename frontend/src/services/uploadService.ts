import api from "./api";
import { getToken } from "../auth/auth";

export async function uploadAvatar(file: File) {
  const form = new FormData();
  form.append("avatar", file);

  const res = await api.post("/upload/avatar", form, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  return res.data;
}
