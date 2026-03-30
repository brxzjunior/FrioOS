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

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Preencha todos os campos.");
      return;
    }

    try {
      setLoading(true);

      const data = await login({ email, password });
      setToken(data.token);

      toast.success("Login realizado!");
      navigate("/dashboard");
    } catch {
      toast.error("Erro ao fazer login.");
    } finally {
      setLoading(false);
    }
  }

  function handleGoogleLogin() {
    // 🔥 REDIRECIONA PRO BACKEND
    window.location.href = "http://localhost:3333/auth/google";
  }

  return (
    <div className="main" style={{ display: "flex", justifyContent: "center" }}>
      <div className="card" style={{ width: 400 }}>
        <h2>Login</h2>

        <form onSubmit={handleLogin} style={{ display: "grid", gap: 10 }}>
          <input
            className="input"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            className="input"
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="button" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </button>

          {/* 🔥 GOOGLE */}
          <button type="button" className="button" onClick={handleGoogleLogin}>
            Entrar com Google
          </button>

          <button
            type="button"
            className="button"
            style={{ background: "#5e18e0", color: "#fdfbfb" }}
            onClick={() => navigate("/signup")}
          >
            Criar conta
          </button>
        </form>
      </div>
    </div>
  );
}
