import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleReset() {
    if (!password || password.length < 6) {
      toast.error("Senha deve ter no mínimo 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem.");
      return;
    }

    if (!token) {
      toast.error("Token inválido.");
      return;
    }

    try {
      setLoading(true);

      await api.post("/auth/reset-password", {
        token,
        newPassword: password,
      });

      toast.success("Senha redefinida com sucesso!");

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Erro ao redefinir senha.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="main">
      <div
        className="card"
        style={{
          maxWidth: 420,
          margin: "40px auto",
          textAlign: "center",
        }}
      >
        <h2 style={{ marginBottom: 6 }}>Redefinir senha</h2>
        <p style={{ fontSize: 13, marginBottom: 20, color: "var(--muted)" }}>
          Digite sua nova senha abaixo
        </p>

        {/* NOVA SENHA */}
        <div className="field">
          <span>Nova senha</span>
          <input
            type="password"
            className="input"
            placeholder="••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {/* CONFIRMAR SENHA */}
        <div className="field">
          <span>Confirmar senha</span>
          <input
            type="password"
            className="input"
            placeholder="••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        <button
          className="button"
          onClick={handleReset}
          disabled={loading}
          style={{ width: "100%", marginTop: 10 }}
        >
          {loading ? "Salvando..." : "Redefinir senha"}
        </button>
      </div>
    </div>
  );
}
