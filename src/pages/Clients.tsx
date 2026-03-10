import { useEffect, useState } from "react";
import {
  getClients,
  createClient,
  deleteClient,
} from "../services/clientService";

type Client = {
  id: string;
  name: string;
};

export default function Clients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadClients() {
    const data = await getClients();
    setClients(data);
  }

  useEffect(() => {
    loadClients();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    await createClient(name);
    setName("");
    await loadClients();
    setLoading(false);
  }

  async function handleDelete(id: string) {
    await deleteClient(id);
    await loadClients();
  }

  return (
    <div style={{ padding: 20, maxWidth: 600 }}>
      <h2>Clientes</h2>

      <form onSubmit={handleCreate} style={{ display: "flex", gap: 10 }}>
        <input
          placeholder="Nome do cliente"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button type="submit" disabled={loading}>
          {loading ? "Salvando..." : "Adicionar"}
        </button>
      </form>

      <ul style={{ marginTop: 20 }}>
        {clients.map((client) => (
          <li
            key={client.id}
            style={{ display: "flex", justifyContent: "space-between" }}
          >
            {client.name}
            <button onClick={() => handleDelete(client.id)}>Excluir</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
