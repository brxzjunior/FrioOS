import { useEffect, useState } from "react";
import { createOrder, type OrderTipo } from "../services/orderService";
import { getClients, createClient } from "../services/clientService";
import toast from "react-hot-toast";

type ClientLite = { id: string; nome: string };

const TIPO_OPTIONS: {
  value: OrderTipo;
  label: string;
  icon: string;
  desc: string;
}[] = [
  {
    value: "MANUTENCAO",
    label: "Manutenção",
    icon: "🔧",
    desc: "Reparo e manutenção",
  },
  {
    value: "INSTALACAO",
    label: "Instalação",
    icon: "⚙️",
    desc: "Instalação de equipamento",
  },
  {
    value: "LIMPEZA",
    label: "Limpeza",
    icon: "🧹",
    desc: "Limpeza e higienização",
  },
  {
    value: "RETIRADA",
    label: "Retirada",
    icon: "📦",
    desc: "Retirada de equipamento",
  },
];

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
    if (!clientId) {
      toast.error("Selecione um cliente.");
      return;
    }
    if (!descricao.trim()) {
      toast.error("Preencha a descrição.");
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

  const selectedClient = clients.find((c) => c.id === clientId);

  return (
    <div className="main">
      <h1 style={{ marginBottom: 4 }}>Nova Ordem de Serviço</h1>
      <p style={{ marginBottom: 24 }}>
        Preencha os dados abaixo para registrar um novo atendimento
      </p>

      {/* ── STEP 1: CLIENTE ─────────────────────────────── */}
      <Section step="1" title="Cliente" icon="👤">
        {loadingClients ? (
          <p style={{ color: "var(--muted)" }}>Carregando clientes...</p>
        ) : (
          <>
            <div className="field">
              <span>Selecionar cliente</span>
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
            </div>

            {selectedClient && (
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "6px 12px",
                  borderRadius: 8,
                  background: "rgba(45,212,191,0.08)",
                  border: "1px solid rgba(45,212,191,0.2)",
                  fontSize: 13,
                  color: "var(--accent)",
                  marginBottom: 12,
                }}
              >
                ✓ {selectedClient.nome} selecionado
              </div>
            )}

            <button
              onClick={() => setShowQuickClient((v) => !v)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "7px 14px",
                borderRadius: 8,
                cursor: "pointer",
                border: "1px dashed var(--border)",
                background: "transparent",
                color: "var(--muted)",
                fontSize: 13,
                transition: "border-color 0.15s, color 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--accent)";
                e.currentTarget.style.color = "var(--accent)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.color = "var(--muted)";
              }}
            >
              {showQuickClient ? "✕ Cancelar" : "+ Cadastrar cliente novo"}
            </button>

            {showQuickClient && (
              <div
                style={{
                  marginTop: 14,
                  padding: 16,
                  borderRadius: 8,
                  background: "var(--surface2)",
                  border: "1px solid var(--border)",
                }}
              >
                <p
                  style={{
                    margin: "0 0 12px",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--text)",
                  }}
                >
                  Novo cliente
                </p>

                <div className="field">
                  <span>Nome *</span>
                  <input
                    className="input"
                    placeholder="Ex: João Silva"
                    value={qcNome}
                    onChange={(e) => setQcNome(e.target.value)}
                  />
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 10,
                  }}
                >
                  <div className="field">
                    <span>Telefone</span>
                    <input
                      className="input"
                      placeholder="(00) 00000-0000"
                      inputMode="tel"
                      value={qcTelefone}
                      onChange={(e) => setQcTelefone(e.target.value)}
                    />
                  </div>
                  <div className="field">
                    <span>Endereço</span>
                    <input
                      className="input"
                      placeholder="Rua, número"
                      value={qcEndereco}
                      onChange={(e) => setQcEndereco(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  className="button"
                  onClick={handleQuickCreateClient}
                  disabled={creatingClient}
                  style={{ marginTop: 4, width: "100%" }}
                >
                  {creatingClient ? "Salvando..." : "Salvar cliente"}
                </button>
              </div>
            )}
          </>
        )}
      </Section>

      {/* ── STEP 2: TIPO ────────────────────────────────── */}
      <Section step="2" title="Tipo de Serviço" icon="🔧">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
            gap: 8,
          }}
        >
          {TIPO_OPTIONS.map((opt) => {
            const active = tipo === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => setTipo(opt.value)}
                style={{
                  padding: "12px 10px",
                  borderRadius: 10,
                  cursor: "pointer",
                  textAlign: "center",
                  border: active
                    ? "1px solid rgba(45,212,191,0.5)"
                    : "1px solid var(--border)",
                  background: active
                    ? "rgba(45,212,191,0.08)"
                    : "var(--surface2)",
                  transition: "all 0.15s",
                }}
              >
                <div style={{ fontSize: 22, marginBottom: 4 }}>{opt.icon}</div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: active ? 600 : 400,
                    color: active ? "var(--accent)" : "var(--text)",
                  }}
                >
                  {opt.label}
                </div>
                <div
                  style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}
                >
                  {opt.desc}
                </div>
              </button>
            );
          })}
        </div>
      </Section>

      {/* ── STEP 3: DETALHES ────────────────────────────── */}
      <Section step="3" title="Detalhes" icon="📋">
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
        >
          <div className="field" style={{ marginBottom: 0 }}>
            <span>Data do serviço</span>
            <input
              type="date"
              className="input"
              value={scheduledFor}
              onChange={(e) => setScheduledFor(e.target.value)}
            />
          </div>
          <div className="field" style={{ marginBottom: 0 }}>
            <span>Valor (R$) *</span>
            <input
              className="input"
              inputMode="decimal"
              placeholder="0,00"
              value={valor}
              onChange={(e) =>
                setValor(e.target.value.replace(/[^0-9.,]/g, ""))
              }
            />
          </div>
        </div>

        <div className="field" style={{ marginTop: 12 }}>
          <span>Descrição do problema *</span>
          <textarea
            className="input"
            rows={3}
            placeholder="Descreva o serviço a ser realizado..."
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
          />
        </div>

        <div className="field">
          <span>Observações</span>
          <textarea
            className="input"
            rows={2}
            placeholder="Informações adicionais (opcional)"
            value={obs}
            onChange={(e) => setObs(e.target.value)}
          />
        </div>
      </Section>

      {/* ── RESUMO + BOTÃO ──────────────────────────────── */}
      <div
        className="card"
        style={{
          background: "rgba(45,212,191,0.05)",
          border: "1px solid rgba(45,212,191,0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div>
          <p style={{ margin: 0, fontSize: 13, color: "var(--muted)" }}>
            Resumo
          </p>
          <p style={{ margin: "4px 0 0", fontSize: 14, color: "var(--text)" }}>
            <strong style={{ color: "var(--accent)" }}>
              {TIPO_OPTIONS.find((t) => t.value === tipo)?.label}
            </strong>
            {selectedClient && <> · {selectedClient.nome}</>}
            {valor && (
              <>
                {" "}
                ·{" "}
                <strong style={{ color: "var(--accent2)" }}>R$ {valor}</strong>
              </>
            )}
          </p>
        </div>
        <button
          className="button"
          onClick={handleCreate}
          disabled={creatingOrder}
          style={{ minWidth: 180 }}
        >
          {creatingOrder ? "Criando..." : "✓ Criar Ordem de Serviço"}
        </button>
      </div>
    </div>
  );
}

// ── Componente auxiliar de seção ──────────────────────────
function Section({
  step,
  title,
  icon,
  children,
}: {
  step: string;
  title: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <div className="card">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 16,
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: "rgba(45,212,191,0.15)",
            border: "1px solid rgba(45,212,191,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
            fontWeight: 700,
            color: "var(--accent)",
            flexShrink: 0,
          }}
        >
          {step}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 16 }}>{icon}</span>
          <h3 style={{ margin: 0, fontSize: 15 }}>{title}</h3>
        </div>
      </div>
      {children}
    </div>
  );
}
