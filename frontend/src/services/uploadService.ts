import api from "./api";

export async function uploadAvatar(file: File) {
  const form = new FormData();
  form.append("avatar", file);

  const res = await api.post("/upload/avatar", form);
  return res.data;
}