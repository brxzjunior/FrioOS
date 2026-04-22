import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, forgotPassword } from "../services/authService";
import { setToken } from "../auth/auth";
import toast from "react-hot-toast";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [sending, setSending] = useState(false);

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
      localStorage.setItem("user", JSON.stringify(data.user));
      toast.success("Login realizado!");
      navigate("/dashboard");
    } catch {
      toast.error("Email ou senha incorretos.");
    } finally {
      setLoading(false);
    }
  }

  function handleGoogleLogin() {
    const API_URL =
      import.meta.env.VITE_API_URL?.replace("/api", "") ||
      "http://localhost:3333";
    window.location.href = `${API_URL}/auth/google`;
  }

  async function handleForgotPassword() {
    if (!forgotEmail) {
      toast.error("Digite seu email.");
      return;
    }
    try {
      setSending(true);
      await forgotPassword(forgotEmail);
      toast.success("Link de recuperação enviado!");
      setShowForgot(false);
      setForgotEmail("");
    } catch {
      toast.error("Erro ao enviar email.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 400,
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 16,
          padding: "40px 32px",
        }}
      >
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
            <img src="/Frio.svg" alt="FrioOS" style={{ width: 28, height: 28, objectFit: "contain" }} />
          </div>
          <h1 style={{ margin: 0, fontSize: 22, color: "var(--text)", letterSpacing: "0.02em" }}>FrioOS</h1>
          <p style={{ margin: "6px 0 0", fontSize: 13 }}>Entre na sua conta para continuar</p>
        </div>

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="field" style={{ marginBottom: 0 }}>
            <span>Email</span>
            <input
              className="input"
              type="email"
              placeholder="seu@email.com"
              value={email}
              autoComplete="email"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="field" style={{ marginBottom: 0 }}>
            <span>Senha</span>
            <div style={{ position: "relative" }}>
              <input
                className="input"
                type={showPass ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                autoComplete="current-password"
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingRight: 42 }}
              />
              <button
                type="button"
                onClick={() => setShowPass((v) => !v)}
                style={{
                  position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer", color: "var(--muted)", fontSize: 15, padding: 0,
                }}
              >
                {showPass ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <div style={{ textAlign: "right", marginTop: -6 }}>
            <button
              type="button"
              onClick={() => setShowForgot(true)}
              style={{ background: "none", border: "none", cursor: "pointer", color: "var(--accent)", fontSize: 12, padding: 0 }}
            >
              Esqueci minha senha
            </button>
          </div>

          <button className="button" disabled={loading} style={{ marginTop: 4, width: "100%", fontSize: 15 }}>
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "20px 0" }}>
          <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
          <span style={{ fontSize: 12, color: "var(--muted)" }}>ou</span>
          <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          style={{
            width: "100%", padding: "11px 16px", borderRadius: 8, cursor: "pointer",
            border: "1px solid var(--border)", background: "var(--surface2)", color: "var(--text)",
            fontSize: 14, fontWeight: 500, display: "flex", alignItems: "center", justifyContent: "center",
            gap: 10, minHeight: 44, transition: "border-color 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
        >
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.35-8.16 2.35-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          Continuar com Google
        </button>

        <p style={{ textAlign: "center", marginTop: 24, fontSize: 13, color: "var(--muted)" }}>
          Não tem conta?{" "}
          <button
            type="button"
            onClick={() => navigate("/signup")}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--accent)", fontWeight: 600, fontSize: 13, padding: 0 }}
          >
            Criar conta
          </button>
        </p>
      </div>

      {showForgot && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3 style={{ marginTop: 0 }}>Recuperar senha</h3>
            <p style={{ fontSize: 13, marginBottom: 16 }}>
              Digite seu email para receber o link de recuperação
            </p>
            <div className="field">
              <span>Email</span>
              <input
                className="input"
                type="email"
                placeholder="seu@email.com"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
              />
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 }}>
              <button
                onClick={() => setShowForgot(false)}
                style={{ padding: "10px 16px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface2)", cursor: "pointer" }}
              >
                Cancelar
              </button>
              <button className="button" onClick={handleForgotPassword} disabled={sending}>
                {sending ? "Enviando..." : "Enviar link"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}