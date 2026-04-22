import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { setToken } from "../auth/auth";

export default function LoginSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      setToken(token);
      navigate("/dashboard", { replace: true });
    } else {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  return <p>Entrando...</p>;
}