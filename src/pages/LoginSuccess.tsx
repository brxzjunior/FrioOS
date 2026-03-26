import { useEffect } from "react";
import { setToken } from "../auth/auth";

export default function LoginSuccess() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      setToken(token);
      window.location.href = "/dashboard";
    } else {
      window.location.href = "/login";
    }
  }, []);

  return <p>Entrando...</p>;
}
