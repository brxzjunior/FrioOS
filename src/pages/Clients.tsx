import { useEffect, useState } from "react";
import {
  getClients,
  createClient,
  deleteClient,
  type Client,
} from "../services/clientService";
import toast from "react-hot-toast";

export default function Clients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [endereco, setEndereco] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadClients() {
    try {
      const data = await getClients();
      setClients(data);
    } catch (err) {
      console.error("Erro ao carregar clientes:", err);
      toast.error("Erro ao carregar clientes.");
    }
  }

  useEffect(() => {
    loadClients();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!nome.trim()) {
      toast.error("Nome é obrigatório.");
      return;
    }

    setLoading(true);
    try {
      await createClient({
        nome: nome.trim(),
        telefone: telefone.trim(),
        endereco: endereco.trim(),
      });
      setNome("");
      setTelefone("");
      setEndereco("");
      toast.success("Cliente adicionado.");
      await loadClients();
    } catch (err) {
      console.error("Erro ao criar cliente:", err);
      toast.error("Erro ao criar cliente.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Tem certeza que deseja excluir este cliente?")) return;

    try {
      await deleteClient(id);
      toast.success("Cliente excluído.");
      await loadClients();
    } catch (err) {
      console.error("Erro ao excluir cliente:", err);
      toast.error("Erro ao excluir cliente.");
    }
  }

  return (
    <div style={{ padding: 20, maxWidth: 600 }}>
      <h2>Clientes</h2>

      <form
        onSubmit={handleCreate}
        style={{ display: "grid", gap: 8, marginBottom: 16 }}
      >
        <input
          placeholder="Nome do cliente"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />
        <input
          placeholder="Telefone"
          value={telefone}
          onChange={(e) => setTelefone(e.target.value)}
        />
        <input
          placeholder="Endereço"
          value={endereco}
          onChange={(e) => setEndereco(e.target.value)}
        />
        <button type="submit" disabled={loading}>
          {loading ? "Salvando..." : "Adicionar"}
        </button>
      </form>

      <ul style={{ marginTop: 20 }}>
        {clients.map((client) => (
          <li
            key={client.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "4px 0",
            }}
          >
            <span>
              <strong>{client.nome}</strong>{" "}
              {client.telefone && <>- {client.telefone}</>}
            </span>
            <button onClick={() => handleDelete(client.id)}>Excluir</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
