import { useEffect, useState } from "react";
import { createOrder, type OrderTipo } from "../services/orderService";
import { getClients, createClient } from "../services/clientService";
import toast from "react-hot-toast";

type ClientLite = {
  id: string;
  nome: string;
  telefone?: string;
  endereco?: string;
};

export default function NewOrder() {
  const [clients, setClients] = useState<ClientLite[]>([]);
  const [clientId, setClientId] = useState("");

  const [tipo, setTipo] = useState<OrderTipo>("MANUTENCAO");
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [obs, setObs] = useState("");
  const [scheduledFor, setScheduledFor] = useState(""); // yyyy-mm-dd

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
        if (data.length > 0) {
          setClientId(data[0].id);
        }
      } catch (err) {
        console.error("Erro ao carregar clientes:", err);
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
        scheduledFor: scheduledFor || undefined, // 👈 CORRETO
      });

      setDescricao("");
      setValor("");
      setObs("");
      setScheduledFor("");

      toast.success("OS criada com sucesso.");
    } catch (err) {
      console.error("Erro ao criar OS:", err);
      toast.error("Erro ao criar OS. Tente novamente.");
    } finally {
      setCreatingOrder(false);
    }
  }

  async function handleQuickCreateClient() {
    try {
      if (!qcNome.trim()) {
        toast.error("Nome é obrigatório.");
        return;
      }

      setCreatingClient(true);

      const created = await createClient({
        nome: qcNome.trim(),
        telefone: qcTelefone.trim(),
        endereco: qcEndereco.trim(),
      });

      setClients((prev) => [created as ClientLite, ...prev]);
      setClientId(created.id);

      setQcNome("");
      setQcTelefone("");
      setQcEndereco("");
      setShowQuickClient(false);

      toast.success("Cliente criado e selecionado.");
    } catch (error) {
      console.error("Erro ao criar cliente:", error);
      toast.error("Erro ao criar cliente. Tente novamente.");
    } finally {
      setCreatingClient(false);
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Nova Ordem de Serviço</h2>

      {loadingClients ? (
        <p>Carregando clientes...</p>
      ) : (
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

              <button
                type="button"
                onClick={handleQuickCreateClient}
                disabled={creatingClient}
              >
                {creatingClient
                  ? "Salvando cliente..."
                  : "Salvar cliente e selecionar"}
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
              <option value="MANUTENCAO">Manutenção / limpeza</option>
              <option value="CONSERTO">Remoção</option>
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

          {/* DATA DO SERVIÇO */}
          <label>
            Data do serviço
            <input
              type="date"
              value={scheduledFor}
              onChange={(e) => setScheduledFor(e.target.value)}
            />
          </label>

          {/* OBSERVAÇÕES */}
          <label>
            Observações
            <textarea
              rows={4}
              value={obs}
              onChange={(e) => setObs(e.target.value)}
              placeholder="Ex: equipamento antigo, cliente pediu retorno em 30 dias..."
            />
          </label>

          {/* VALOR */}
          <label>
            Valor (R$)
            <input
              type="text"
              placeholder="Ex: 200,50"
              value={valor}
              onChange={(e) =>
                setValor(e.target.value.replace(/[^0-9.,]/g, ""))
              }
            />
          </label>

          <button onClick={handleCreate} disabled={creatingOrder}>
            {creatingOrder ? "Criando OS..." : "Criar OS"}
          </button>
        </div>
      )}
    </div>
  );
}
