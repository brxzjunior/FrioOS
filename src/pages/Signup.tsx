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
      toast.error("Preencha nome, email e senha.");
      return;
    }

    if (password.length < 6) {
      toast.error("Senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setLoading(true);
    try {
      const data = await signup({ name, email, password });
      setToken(data.token);
      toast.success("Conta criada com sucesso.");
      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      console.error("ERRO SIGNUP:", err);
      const msg =
        err?.response?.data?.message ?? "Erro ao cadastrar. Tente novamente.";
      toast.error(msg);
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
