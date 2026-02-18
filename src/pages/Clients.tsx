import { useEffect, useState } from "react";
import {
  createClient,
  getClients,
  type Client,
} from "../services/clientService";

export default function Clients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [endereco, setEndereco] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadClients() {
    try {
      setLoading(true);
      const data = await getClients();
      setClients(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadClients();
  }, []);

  async function handleAddClient() {
    if (!nome.trim()) return;

    const newClient = await createClient({
      nome: nome.trim(),
      telefone: telefone.trim(),
      endereco: endereco.trim(),
    });

    // atualiza a lista sem precisar refazer GET
    setClients((prev) => [newClient, ...prev]);

    setNome("");
    setTelefone("");
    setEndereco("");
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Clientes</h2>

      <div style={{ display: "grid", gap: 8, maxWidth: 420 }}>
        <input
          placeholder="Nome"
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
        <button onClick={handleAddClient}>Adicionar</button>
      </div>

      <hr />

      {loading ? (
        <p>Carregando...</p>
      ) : (
        <ul>
          {clients.map((c) => (
            <li key={c.id}>
              <strong>{c.nome}</strong> — {c.telefone || "sem telefone"} —{" "}
              {c.endereco || "sem endereço"}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
