import { useEffect, useState } from "react";
import { createOrder, type OrderTipo } from "../services/orderService";
import {
  getClients,
  createClient,
  type Client,
} from "../services/clientService";

export default function NewOrder() {
  const [clients, setClients] = useState<Client[]>([]);
  const [clientId, setClientId] = useState("");

  const [tipo, setTipo] = useState<OrderTipo>("MANUTENCAO");
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");

  // 🟢 cadastro rápido
  const [showQuickClient, setShowQuickClient] = useState(false);
  const [qcNome, setQcNome] = useState("");
  const [qcTelefone, setQcTelefone] = useState("");
  const [qcEndereco, setQcEndereco] = useState("");

  // carregar clientes
  useEffect(() => {
    (async () => {
      const data = await getClients();
      setClients(data);
      if (data.length > 0) {
        setClientId(data[0].id);
      }
    })();
  }, []);

  // criar OS
  async function handleCreate() {
    if (!clientId || !descricao.trim()) {
      alert("Selecione um cliente e preencha a descrição.");
      return;
    }

    await createOrder({
      clientId,
      tipo,
      descricao: descricao.trim(),
      valor: Number(valor.replace(",", ".")),
    });

    setDescricao("");
    setValor("");
    alert("OS criada ✅");
  }

  // criar cliente rápido
  async function handleQuickCreateClient() {
    try {
      if (!qcNome.trim()) {
        alert("Nome é obrigatório.");
        return;
      }

      console.log("Criando cliente...");

      const created = await createClient({
        nome: qcNome.trim(),
        telefone: qcTelefone.trim(),
        endereco: qcEndereco.trim(),
      });

      console.log("Cliente criado:", created);

      // atualiza lista
      setClients((prev) => [created, ...prev]);

      // seleciona automaticamente
      setClientId(created.id);

      // limpa form
      setQcNome("");
      setQcTelefone("");
      setQcEndereco("");

      // fecha form
      setShowQuickClient(false);

      alert("Cliente criado com sucesso ✅");
    } catch (error) {
      console.error("Erro ao criar cliente:", error);
      alert("Erro ao criar cliente. Veja o console.");
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Nova Ordem de Serviço</h2>

      <div style={{ display: "grid", gap: 8, maxWidth: 520 }}>
        {/* CLIENTE */}
        <label>
          Cliente
          <select
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
          >
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
        </label>

        <button type="button" onClick={() => setShowQuickClient((v) => !v)}>
          {showQuickClient
            ? "Cancelar cadastro rápido"
            : "Cadastrar cliente rápido"}
        </button>

        {/* CADASTRO RÁPIDO */}
        {showQuickClient && (
          <div
            style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8 }}
          >
            <h4>Cadastrar cliente rápido</h4>

            <input
              placeholder="Nome"
              value={qcNome}
              onChange={(e) => setQcNome(e.target.value)}
            />

            <input
              placeholder="Telefone"
              value={qcTelefone}
              onChange={(e) => setQcTelefone(e.target.value)}
            />

            <input
              placeholder="Endereço"
              value={qcEndereco}
              onChange={(e) => setQcEndereco(e.target.value)}
            />

            <button type="button" onClick={handleQuickCreateClient}>
              Salvar cliente e selecionar
            </button>
          </div>
        )}

        {/* TIPO */}
        <label>
          Tipo
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value as OrderTipo)}
          >
            <option value="INSTALACAO">Instalação</option>
            <option value="MANUTENCAO">Manutenção</option>
            <option value="CONSERTO">Conserto</option>
          </select>
        </label>

        {/* DESCRIÇÃO */}
        <label>
          Descrição
          <textarea
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
          />
        </label>

        {/* VALOR */}
        <label>
          Valor (R$)
          <input
            type="text"
            placeholder="Ex: 150 ou 150,50"
            value={valor}
            onChange={(e) => setValor(e.target.value.replace(/[^0-9.,]/g, ""))}
          />
        </label>

        <button onClick={handleCreate}>Criar OS</button>
      </div>
    </div>
  );
}
