import { useEffect, useState } from "react";
import {
  getClients,
  createClient,
  updateClient,
  deleteClient,
  type Client,
} from "../services/clientService";
import toast from "react-hot-toast";

function initials(nome: string) {
  return nome
    .trim()
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export default function Clients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);

  // novo cliente
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [endereco, setEndereco] = useState("");
  const [loading, setLoading] = useState(false);

  // edição
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [editNome, setEditNome] = useState("");
  const [editTelefone, setEditTelefone] = useState("");
  const [editEndereco, setEditEndereco] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    loadClients();
  }, []);

  async function loadClients() {
    try {
      setClients(await getClients());
    } catch {
      toast.error("Erro ao carregar clientes.");
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!nome.trim()) {
      toast.error("Nome é obrigatório.");
      return;
    }
    try {
      setLoading(true);
      await createClient({ nome, telefone, endereco });
      setNome("");
      setTelefone("");
      setEndereco("");
      setShowForm(false);
      toast.success("Cliente criado.");
      loadClients();
    } catch {
      toast.error("Erro ao criar cliente.");
    } finally {
      setLoading(false);
    }
  }

  function startEdit(client: Client) {
    setEditingClient(client);
    setEditNome(client.nome);
    setEditTelefone(client.telefone ?? "");
    setEditEndereco(client.endereco ?? "");
  }

  async function handleSaveEdit() {
    if (!editingClient) return;
    if (!editNome.trim()) {
      toast.error("Nome é obrigatório.");
      return;
    }
    try {
      setSavingEdit(true);
      const updated = await updateClient(editingClient.id, {
        nome: editNome,
        telefone: editTelefone,
        endereco: editEndereco,
      });
      setClients((prev) =>
        prev.map((c) => (c.id === updated.id ? updated : c)),
      );
      toast.success("Cliente atualizado.");
      setEditingClient(null);
    } catch {
      toast.error("Erro ao atualizar cliente.");
    } finally {
      setSavingEdit(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Excluir cliente?")) return;
    try {
      await deleteClient(id);
      setClients((prev) => prev.filter((c) => c.id !== id));
      toast.success("Cliente removido.");
    } catch {
      toast.error("Erro ao excluir.");
    }
  }

  const filtered = clients.filter((c) =>
    [c.nome, c.telefone, c.endereco].some((f) =>
      f?.toLowerCase().includes(search.toLowerCase()),
    ),
  );

  return (
    <div className="main">
      {/* CABEÇALHO */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: 24,
        }}
      >
        <div>
          <h1 style={{ margin: 0 }}>Clientes</h1>
          <p style={{ margin: "4px 0 0", fontSize: 13 }}>
            {clients.length} cliente{clients.length !== 1 ? "s" : ""} cadastrado
            {clients.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          className="button"
          onClick={() => setShowForm((v) => !v)}
          style={{ display: "flex", alignItems: "center", gap: 6 }}
        >
          {showForm ? "✕ Cancelar" : "+ Novo cliente"}
        </button>
      </div>

      {/* FORMULÁRIO NOVO CLIENTE */}
      {showForm && (
        <div
          className="card"
          style={{ borderTop: "3px solid var(--accent)", marginBottom: 20 }}
        >
          <h3 style={{ margin: "0 0 16px", fontSize: 15 }}>Novo cliente</h3>
          <form onSubmit={handleCreate}>
            <div className="field">
              <span>Nome *</span>
              <input
                className="input"
                placeholder="Ex: João Silva"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                autoFocus
              />
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
              }}
            >
              <div className="field" style={{ marginBottom: 0 }}>
                <span>Telefone</span>
                <input
                  className="input"
                  placeholder="(00) 00000-0000"
                  inputMode="tel"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                />
              </div>
              <div className="field" style={{ marginBottom: 0 }}>
                <span>Endereço</span>
                <input
                  className="input"
                  placeholder="Rua, número"
                  value={endereco}
                  onChange={(e) => setEndereco(e.target.value)}
                />
              </div>
            </div>
            <button
              className="button"
              disabled={loading}
              style={{ marginTop: 16, width: "100%" }}
            >
              {loading ? "Salvando..." : "✓ Salvar cliente"}
            </button>
          </form>
        </div>
      )}

      {/* BUSCA */}
      {clients.length > 0 && (
        <div style={{ position: "relative", marginBottom: 16 }}>
          <span
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--muted)",
              fontSize: 15,
              pointerEvents: "none",
            }}
          >
            🔍
          </span>
          <input
            className="input"
            placeholder="Buscar por nome, telefone ou endereço..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: 36, marginTop: 0 }}
          />
        </div>
      )}

      {/* LISTA */}
      {clients.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: 48 }}>
          <p style={{ fontSize: 36, margin: "0 0 10px" }}>👤</p>
          <p style={{ margin: 0, fontSize: 15, color: "var(--text)" }}>
            Nenhum cliente ainda
          </p>
          <p style={{ margin: "6px 0 0", fontSize: 13 }}>
            Clique em "+ Novo cliente" para começar
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: 32 }}>
          <p style={{ margin: 0 }}>Nenhum resultado para "{search}"</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          {filtered.map((client, i) => (
            <div
              key={client.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "14px 20px",
                borderBottom:
                  i < filtered.length - 1 ? "1px solid var(--border)" : "none",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "var(--surface2)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              {/* avatar */}
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  flexShrink: 0,
                  background: "rgba(45,212,191,0.12)",
                  border: "1px solid rgba(45,212,191,0.25)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 13,
                  fontWeight: 700,
                  color: "var(--accent)",
                }}
              >
                {initials(client.nome)}
              </div>

              {/* info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: 14,
                    color: "var(--text)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {client.nome}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--muted)",
                    marginTop: 2,
                    display: "flex",
                    gap: 12,
                    flexWrap: "wrap",
                  }}
                >
                  {client.telefone && <span>📞 {client.telefone}</span>}
                  {client.endereco && <span>📍 {client.endereco}</span>}
                </div>
              </div>

              {/* ações */}
              <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                <button
                  onClick={() => startEdit(client)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 7,
                    cursor: "pointer",
                    border: "1px solid rgba(45,212,191,0.25)",
                    background: "rgba(45,212,191,0.06)",
                    color: "var(--accent)",
                    fontSize: 12,
                    minHeight: 36,
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "rgba(45,212,191,0.14)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "rgba(45,212,191,0.06)")
                  }
                >
                  ✏️ Editar
                </button>
                <button
                  onClick={() => handleDelete(client.id)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 7,
                    cursor: "pointer",
                    border: "1px solid rgba(248,113,113,0.25)",
                    background: "rgba(248,113,113,0.06)",
                    color: "#f87171",
                    fontSize: 12,
                    minHeight: 36,
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background =
                      "rgba(248,113,113,0.14)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background =
                      "rgba(248,113,113,0.06)")
                  }
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL EDITAR */}
      {editingClient && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: "50%",
                  background: "rgba(45,212,191,0.12)",
                  border: "1px solid rgba(45,212,191,0.25)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 14,
                  fontWeight: 700,
                  color: "var(--accent)",
                  flexShrink: 0,
                }}
              >
                {initials(editingClient.nome)}
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: 15 }}>Editar cliente</h3>
                <p style={{ margin: 0, fontSize: 12 }}>{editingClient.nome}</p>
              </div>
            </div>

            <div className="field">
              <span>Nome *</span>
              <input
                className="input"
                value={editNome}
                onChange={(e) => setEditNome(e.target.value)}
                autoFocus
              />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
              }}
            >
              <div className="field" style={{ marginBottom: 0 }}>
                <span>Telefone</span>
                <input
                  className="input"
                  inputMode="tel"
                  placeholder="(00) 00000-0000"
                  value={editTelefone}
                  onChange={(e) => setEditTelefone(e.target.value)}
                />
              </div>
              <div className="field" style={{ marginBottom: 0 }}>
                <span>Endereço</span>
                <input
                  className="input"
                  placeholder="Rua, número"
                  value={editEndereco}
                  onChange={(e) => setEditEndereco(e.target.value)}
                />
              </div>
            </div>

            <div
              style={{
                display: "flex",
                gap: 10,
                justifyContent: "flex-end",
                marginTop: 20,
              }}
            >
              <button
                onClick={() => setEditingClient(null)}
                disabled={savingEdit}
                style={{
                  padding: "10px 16px",
                  borderRadius: 8,
                  cursor: "pointer",
                  minHeight: 44,
                  border: "1px solid var(--border)",
                  background: "var(--surface2)",
                  color: "var(--muted)",
                }}
              >
                Cancelar
              </button>
              <button
                className="button"
                onClick={handleSaveEdit}
                disabled={savingEdit}
              >
                {savingEdit ? "Salvando..." : "✓ Salvar alterações"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
