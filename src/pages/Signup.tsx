import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signup } from "../services/authServices";
import { setToken } from "../auth/auth";

export default function Signup() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await signup({ name, email, password });
      setToken(data.token);
      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      alert(err?.response?.data?.message ?? "Erro ao cadastrar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 20, maxWidth: 420 }}>
      <h2>Criar conta</h2>

      <form onSubmit={handleSignup} style={{ display: "grid", gap: 10 }}>
        <input
          placeholder="Nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          placeholder="Senha (mín. 6)"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit" disabled={loading}>
          {loading ? "Cadastrando..." : "Cadastrar"}
        </button>

        <button type="button" onClick={() => navigate("/login")}>
          Já tenho conta
        </button>
      </form>
    </div>
  );
}
