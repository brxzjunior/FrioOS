import { useEffect, useState } from "react";
import { getMe, updateProfile } from "../services/userService";
import { uploadAvatar } from "../services/uploadService";
import { clearToken } from "../auth/auth";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function Profile() {
  const navigate = useNavigate();

  const [user, setUser] = useState<any>(null);
  const [name, setName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await getMe();
        setUser(data);
        setName(data.name);
        setAvatarUrl(data.avatarUrl || "");
      } catch {
        toast.error("Erro ao carregar perfil.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function handleSave() {
    try {
      setSaving(true);

      const updated = await updateProfile({ name, avatarUrl });

      const finalUser = {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        avatarUrl,
      };

      setUser(finalUser);
      localStorage.setItem("user", JSON.stringify(finalUser));

      toast.success("Perfil atualizado!");

      // atualiza topbar sem reload pesado
      window.dispatchEvent(new Event("storage"));
    } catch {
      toast.error("Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);

      const { url } = await uploadAvatar(file);
      setAvatarUrl(url);

      toast.success("Foto atualizada!");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Erro ao enviar foto.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  function handleLogout() {
    clearToken();
    localStorage.removeItem("user");
    navigate("/login");
  }

  if (loading) return <div className="main">Carregando...</div>;

  const preview =
    avatarUrl ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "User")}`;

  return (
    <div className="main" style={{ maxWidth: 700, margin: "0 auto" }}>
      <h1>Perfil</h1>
      <p style={{ marginBottom: 24, color: "var(--muted)" }}>
        Gerencie suas informações pessoais
      </p>

      <div className="card" style={{ padding: 24 }}>
        {/* AVATAR */}
        <div style={{ textAlign: "center", marginBottom: 30 }}>
          <div
            style={{
              position: "relative",
              display: "inline-block",
            }}
          >
            <img
              src={preview}
              alt="avatar"
              style={{
                width: 100,
                height: 100,
                borderRadius: "50%",
                objectFit: "cover",
                border: "2px solid var(--border)",
              }}
            />

            <label
              style={{
                position: "absolute",
                bottom: 0,
                right: 0,
                background: "var(--accent)",
                borderRadius: "50%",
                width: 32,
                height: 32,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                fontSize: 14,
              }}
            >
              📷
              <input
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
            </label>
          </div>

          <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 10 }}>
            {uploading ? "Enviando..." : "Clique no ícone para trocar a foto"}
          </p>
        </div>

        {/* NOME */}
        <div className="field">
          <span>Nome</span>
          <input
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* EMAIL */}
        <div className="field">
          <span>Email</span>
          <input className="input" value={user.email} disabled />
        </div>

        {/* AÇÕES */}
        <div
          style={{
            display: "flex",
            gap: 10,
            marginTop: 30,
            justifyContent: "space-between",
          }}
        >
          <button className="button" onClick={handleSave} disabled={saving}>
            {saving ? "Salvando..." : "Salvar alterações"}
          </button>

          <button
            onClick={handleLogout}
            style={{
              border: "1px solid #f87171",
              background: "rgba(248,113,113,0.1)",
              color: "#f87171",
              padding: "10px 16px",
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            Sair
          </button>
        </div>
      </div>
    </div>
  );
}
