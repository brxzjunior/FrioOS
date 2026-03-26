import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/authService";
import { setToken } from "../auth/auth";
import toast from "react-hot-toast";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Preencha email e senha.");
      return;
    }

    setLoading(true);

    try {
      const data = await login({ email, password });

      setToken(data.token);

      toast.success("Login realizado com sucesso.");
      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ?? "Erro ao logar. Verifique os dados.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  function handleGoogleLogin(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault(); // 🔥 garante que NÃO vai submeter o form

    console.log("👉 Redirecionando para Google..."); // debug opcional

    window.location.href = "http://localhost:3333/auth/google";
  }

  return (
    <div style={{ padding: 20, maxWidth: 420 }}>
      <h2>Login</h2>

      <form onSubmit={handleLogin} style={{ display: "grid", gap: 10 }}>
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          placeholder="Senha"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit" disabled={loading}>
          {loading ? "Entrando..." : "Entrar"}
        </button>

        <button type="button" onClick={() => navigate("/signup")}>
          Criar conta
        </button>

        {/* 🔥 GOOGLE LOGIN */}
        <button type="button" onClick={handleGoogleLogin}>
          Entrar com Google
        </button>
      </form>
    </div>
  );
}
