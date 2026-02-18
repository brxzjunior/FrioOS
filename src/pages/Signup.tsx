import { useNavigate } from "react-router-dom";
import { setToken, getToken } from "../auth/auth";

export default function Signup() {
  const navigate = useNavigate();

  function handleSignup(e: React.FormEvent) {
    e.preventDefault();

    console.log("Clicou cadastrar ✅");

    setToken("mock-token");

    console.log("Token salvo:", getToken());

    navigate("/dashboard", { replace: true });
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Criar conta</h2>

      <form onSubmit={handleSignup}>
        <button type="submit">Cadastrar e entrar</button>

        <button
          type="button"
          onClick={() => navigate("/login")}
          style={{ marginLeft: 8 }}
        >
          Já tenho conta
        </button>
      </form>
    </div>
  );
}
