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
        <h2>Criar conta</h2>

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
