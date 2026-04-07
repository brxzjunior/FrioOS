import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signup } from "../services/authService";
import { setToken } from "../auth/auth";
import toast from "react-hot-toast";

export default function Signup() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();

    if (!name || !email || !password) {
      toast.error("Preencha todos os campos.");
      return;
    }

    if (password.length < 6) {
      toast.error("Senha deve ter pelo menos 6 caracteres.");
      return;
    }

    try {
      setLoading(true);

      const data = await signup({ name, email, password });
      setToken(data.token);

      toast.success("Conta criada!");
      navigate("/dashboard");
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? "Erro ao criar conta.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="main" style={{ display: "flex", justifyContent: "center" }}>
      <div className="card" style={{ width: 400 }}>
        {/* LOGO (IGUAL LOGIN) */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 56,
              height: 56,
              borderRadius: 14,
              background: "rgba(45,212,191,0.12)",
              border: "1px solid rgba(45,212,191,0.25)",
              marginBottom: 14,
            }}
          >
            <img
              src="/Frio.svg"
              alt="FrioOS"
              style={{
                width: 28,
                height: 28,
                objectFit: "contain",
                filter: "drop-shadow(0 0 6px rgba(45,212,191,0.4))",
              }}
            />
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: 22,
              color: "var(--text)",
              letterSpacing: "0.02em",
            }}
          >
            FrioOS
          </h1>

          <p style={{ margin: "6px 0 0", fontSize: 13 }}>
            Crie sua conta para começar
          </p>
        </div>

        {/* FORM */}
        <form onSubmit={handleSignup} style={{ display: "grid", gap: 10 }}>
          <input
            className="input"
            placeholder="Nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            className="input"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            className="input"
            type="password"
            placeholder="Senha (mín. 6)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="button" disabled={loading}>
            {loading ? "Cadastrando..." : "Cadastrar"}
          </button>

          <button
            type="button"
            className="button"
            style={{ background: "#5e18e0", color: "#ffffff" }}
            onClick={() => navigate("/login")}
          >
            Já tenho conta
          </button>
        </form>
      </div>
    </div>
  );
}
