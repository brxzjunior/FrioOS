import { useEffect, useMemo, useState } from "react";
import { getClients, type Client } from "../services/clientService";
import {
  getOrders,
  updateOrderStatus,
  type Order,
  type OrderStatus,
} from "../services/orderService";
import { generateOrderPdf } from "../utils/orderPdf";

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  // mapa rápido: clientId -> Client
  const clientMap = useMemo(() => {
    const map = new Map<string, Client>();
    clients.forEach((c) => map.set(c.id, c));
    return map;
  }, [clients]);

  async function loadAll() {
    try {
      setLoading(true);
      const [ordersData, clientsData] = await Promise.all([
        getOrders(),
        getClients(),
      ]);
      setOrders(ordersData);
      setClients(clientsData);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function handleStatusChange(id: string, status: OrderStatus) {
    await updateOrderStatus(id, status);
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
  }

  function formatBRL(value: number) {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Ordens de Serviço</h2>

      {loading ? (
        <p>Carregando...</p>
      ) : orders.length === 0 ? (
        <p>Nenhuma OS cadastrada ainda.</p>
      ) : (
        orders.map((o) => {
          const client = clientMap.get(o.clientId);

          return (
            <div
              key={o.id}
              style={{
                border: "1px solid #ddd",
                padding: 12,
                marginBottom: 8,
                borderRadius: 8,
                display: "grid",
                gap: 6,
              }}
            >
              <div>
                <strong>{o.tipo}</strong>{" "}
                <span style={{ opacity: 0.7 }}>({o.status})</span>
              </div>

              <div>
                <strong>Cliente:</strong>{" "}
                {client?.nome ?? "Cliente não encontrado"}
              </div>

              <div>
                <strong>Descrição:</strong> {o.descricao}
              </div>

              {"obs" in o && (o as any).obs ? (
                <div>
                  <strong>Obs:</strong> {(o as any).obs}
                </div>
              ) : null}

              <div>
                <strong>Valor:</strong> {formatBRL(Number(o.valor))}
              </div>

              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <label>
                  Status:{" "}
                  <select
                    value={o.status}
                    onChange={(e) =>
                      handleStatusChange(o.id, e.target.value as OrderStatus)
                    }
                  >
                    <option value="ABERTA">ABERTA</option>
                    <option value="ANDAMENTO">ANDAMENTO</option>
                    <option value="FINALIZADA">FINALIZADA</option>
                  </select>
                </label>

                <button
                  type="button"
                  onClick={() => generateOrderPdf(o, client)}
                >
                  Gerar PDF
                </button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
