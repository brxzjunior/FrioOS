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
    } catch {
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

    try {
      setLoading(true);

      await createClient({
        nome,
        telefone,
        endereco,
      });

      setNome("");
      setTelefone("");
      setEndereco("");

      toast.success("Cliente criado.");
      loadClients();
    } catch {
      toast.error("Erro ao criar cliente.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Excluir cliente?")) return;

    try {
      await deleteClient(id);
      toast.success("Cliente removido.");
      loadClients();
    } catch {
      toast.error("Erro ao excluir.");
    }
  }

  return (
    <div className="main">
      <h1>Clientes</h1>
      <p style={{ color: "#666", marginBottom: 20 }}>Gerencie seus clientes</p>

      {/* FORM */}
      <div className="card">
        <h3>Novo cliente</h3>

        <form onSubmit={handleCreate} style={{ display: "grid", gap: 10 }}>
          <input
            className="input"
            placeholder="Nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />

          <input
            className="input"
            placeholder="Telefone"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
          />

          <input
            className="input"
            placeholder="Endereço"
            value={endereco}
            onChange={(e) => setEndereco(e.target.value)}
          />

          <button className="button" disabled={loading}>
            {loading ? "Salvando..." : "Adicionar cliente"}
          </button>
        </form>
      </div>

      {/* LISTA */}
      <div className="card">
        <h3>Lista de clientes</h3>

        {clients.length === 0 ? (
          <p>Nenhum cliente cadastrado.</p>
        ) : (
          clients.map((client) => (
            <div
              key={client.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "8px 0",
                borderBottom: "1px solid #eee",
              }}
            >
              <div>
                <strong>{client.nome}</strong>
                <div style={{ fontSize: 13, color: "#666" }}>
                  {client.telefone} {client.endereco && `• ${client.endereco}`}
                </div>
              </div>

              <button
                className="button"
                onClick={() => handleDelete(client.id)}
              >
                Excluir
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
