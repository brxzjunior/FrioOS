import { useNavigate } from "react-router-dom";
import { setToken } from "../auth/auth";

export default function Login() {
  const navigate = useNavigate();

  function handleLogin() {
    setToken("mock-token");
    navigate("/");
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Login</h2>

      <button onClick={handleLogin}>Entrar</button>

      <button onClick={() => navigate("/signup")} style={{ marginLeft: 8 }}>
        Criar conta
      </button>
    </div>
  );
}
