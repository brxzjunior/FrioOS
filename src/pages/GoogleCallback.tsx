import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { setToken } from "../auth/auth";

export default function GoogleCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      setToken(token);
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  }, []);

  return <p>Entrando com Google...</p>;
}
