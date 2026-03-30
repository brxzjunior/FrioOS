import { useEffect, useState } from "react";
import { createOrder, type OrderTipo } from "../services/orderService";
import { getClients, createClient } from "../services/clientService";
import toast from "react-hot-toast";

type ClientLite = {
  id: string;
  nome: string;
};

export default function NewOrder() {
  const [clients, setClients] = useState<ClientLite[]>([]);
  const [clientId, setClientId] = useState("");

  const [tipo, setTipo] = useState<OrderTipo>("MANUTENCAO");
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [obs, setObs] = useState("");
  const [scheduledFor, setScheduledFor] = useState("");

  const [showQuickClient, setShowQuickClient] = useState(false);
  const [qcNome, setQcNome] = useState("");
  const [qcTelefone, setQcTelefone] = useState("");
  const [qcEndereco, setQcEndereco] = useState("");

  const [loadingClients, setLoadingClients] = useState(true);
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [creatingClient, setCreatingClient] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoadingClients(true);
        const data = await getClients();
        setClients(data as ClientLite[]);
        if (data.length > 0) setClientId(data[0].id);
      } catch {
        toast.error("Erro ao carregar clientes.");
      } finally {
        setLoadingClients(false);
      }
    })();
  }, []);

  async function handleCreate() {
    if (!clientId || !descricao.trim()) {
      toast.error("Selecione um cliente e preencha a descrição.");
      return;
    }

    if (!valor.trim()) {
      toast.error("Preencha o valor.");
      return;
    }

    try {
      setCreatingOrder(true);

      await createOrder({
        tipo,
        descricao,
        valor: Number(valor),
        clientId,
        obs,
        scheduledFor: scheduledFor || undefined,
      });

      setDescricao("");
      setValor("");
      setObs("");
      setScheduledFor("");

      toast.success("OS criada com sucesso.");
    } catch {
      toast.error("Erro ao criar OS.");
    } finally {
      setCreatingOrder(false);
    }
  }

  async function handleQuickCreateClient() {
    if (!qcNome.trim()) {
      toast.error("Nome é obrigatório.");
      return;
    }

    try {
      setCreatingClient(true);

      const created = await createClient({
        nome: qcNome,
        telefone: qcTelefone,
        endereco: qcEndereco,
      });

      setClients((prev) => [created as ClientLite, ...prev]);
      setClientId(created.id);

      setQcNome("");
      setQcTelefone("");
      setQcEndereco("");
      setShowQuickClient(false);

      toast.success("Cliente criado.");
    } catch {
      toast.error("Erro ao criar cliente.");
    } finally {
      setCreatingClient(false);
    }
  }

  return (
    <div className="main">
      <h1 style={{ marginBottom: 5 }}>Nova Ordem de Serviço</h1>
      <p style={{ color: "#666", marginBottom: 20 }}>
        Preencha os dados para criar uma nova OS
      </p>

      {/* CLIENTE */}
      <div className="card">
        <h3>Cliente</h3>

        {loadingClients ? (
          <p>Carregando...</p>
        ) : (
          <>
            <select
              className="input"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
            >
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </select>

            <button
              className="button"
              style={{ marginTop: 10 }}
              onClick={() => setShowQuickClient((v) => !v)}
            >
              {showQuickClient ? "Cancelar" : "Cadastrar cliente rápido"}
            </button>

            {showQuickClient && (
              <div className="card" style={{ marginTop: 15 }}>
                <h4>Novo cliente</h4>

                <input
                  className="input"
                  placeholder="Nome"
                  value={qcNome}
                  onChange={(e) => setQcNome(e.target.value)}
                />

                <input
                  className="input"
                  placeholder="Telefone"
                  value={qcTelefone}
                  onChange={(e) => setQcTelefone(e.target.value)}
                />

                <input
                  className="input"
                  placeholder="Endereço"
                  value={qcEndereco}
                  onChange={(e) => setQcEndereco(e.target.value)}
                />

                <button
                  className="button"
                  onClick={handleQuickCreateClient}
                  disabled={creatingClient}
                  style={{ marginTop: 10 }}
                >
                  {creatingClient ? "Salvando..." : "Salvar cliente"}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* DETALHES */}
      <div className="card">
        <h3>Detalhes da OS</h3>

        <label>
          Tipo
          <select
            className="input"
            value={tipo}
            onChange={(e) => setTipo(e.target.value as OrderTipo)}
          >
            <option value="INSTALACAO">Instalação</option>
            <option value="MANUTENCAO">Manutenção</option>
            <option value="LIMPEZA">Limpeza</option>
            <option value="RETIRADA">Retirada</option>
          </select>
        </label>

        <label>
          Data do serviço
          <input
            type="date"
            className="input"
            value={scheduledFor}
            onChange={(e) => setScheduledFor(e.target.value)}
          />
        </label>

        <label>
          Descrição
          <textarea
            className="input"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
          />
        </label>

        <label>
          Observações
          <textarea
            className="input"
            value={obs}
            onChange={(e) => setObs(e.target.value)}
          />
        </label>

        <label>
          Valor (R$)
          <input
            className="input"
            value={valor}
            onChange={(e) => setValor(e.target.value.replace(/[^0-9.,]/g, ""))}
          />
        </label>

        <button
          className="button"
          onClick={handleCreate}
          disabled={creatingOrder}
          style={{ marginTop: 15 }}
        >
          {creatingOrder ? "Criando..." : "Criar Ordem de Serviço"}
        </button>
      </div>
    </div>
  );
}
