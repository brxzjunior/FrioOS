import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/authServices";
import { setToken } from "../auth/auth";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!email || !password) {
      alert("Preencha email e senha");
      return;
    }

    setLoading(true);

    try {
      const data = await login({ email, password });

      console.log("TOKEN RECEBIDO:", data.token);

      setToken(data.token);

      console.log("TOKEN SALVO:", localStorage.getItem("frioos_token"));

      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      console.error("ERRO LOGIN:", err);
      alert(err?.response?.data?.message ?? "Erro ao logar");
    } finally {
      setLoading(false);
    }
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
      </form>
    </div>
  );
}
