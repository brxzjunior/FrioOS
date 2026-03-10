import api from "./api";

export async function getClients() {
  const { data } = await api.get("/clients");
  return data;
}

export async function createClient(name: string) {
  const { data } = await api.post("/clients", { name });
  return data;
}

export async function deleteClient(id: string) {
  await api.delete(`/clients/${id}`);
}
