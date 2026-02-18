import { api } from "./api";

export type Client = {
  id: string;
  nome: string;
  telefone: string;
  endereco: string;
  createdAt: string;
};

export async function getClients(): Promise<Client[]> {
  const res = await api.get<Client[]>("/clients");
  return res.data;
}

export async function createClient(data: {
  nome: string;
  telefone: string;
  endereco: string;
}): Promise<Client> {
  const res = await api.post<Client>("/clients", data);
  return res.data;
}
