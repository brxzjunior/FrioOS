import api from "./api";

export type Client = {
  id: string;
  nome: string;
  telefone: string;
  endereco: string;
};

export async function getClients(): Promise<Client[]> {
  const { data } = await api.get<Client[]>("/clients");
  return data;
}

export async function createClient(data: {
  nome: string;
  telefone: string;
  endereco: string;
}): Promise<Client> {
  const { data: created } = await api.post<Client>("/clients", data);
  return created;
}

export async function updateClient(
  id: string,
  data: { nome?: string; telefone?: string; endereco?: string },
): Promise<Client> {
  const { data: updated } = await api.put<Client>(`/clients/${id}`, data);
  return updated;
}

export async function deleteClient(id: string): Promise<void> {
  await api.delete(`/clients/${id}`);
}
