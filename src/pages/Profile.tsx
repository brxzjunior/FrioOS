import { useEffect, useState } from "react";
import { getMe, updateProfile } from "../services/userService";
import { uploadAvatar } from "../services/uploadService"; // ✅ ADICIONADO
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
      setUser(updated);
      toast.success("Perfil atualizado!");

      localStorage.setItem(
        "user",
        JSON.stringify({
          id: updated.id,
          name: updated.name,
          email: updated.email,
          avatarUrl: updated.avatarUrl,
        }),
      );
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
      toast.success("Foto enviada!");
    } catch (err: any) {
      console.error(err);
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
    "https://ui-avatars.com/api/?name=" + encodeURIComponent(name || "Usuario");

  return (
    <div className="main">
      <h1>Meu Perfil</h1>
      <p style={{ marginBottom: 20 }}>Gerencie suas informações</p>

      <div className="card" style={{ maxWidth: 500 }}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <img
            src={preview}
            alt="avatar"
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              objectFit: "cover",
            }}
          />

          <div style={{ marginTop: 10 }}>
            <label
              style={{
                fontSize: 12,
                color: "var(--accent)",
                cursor: "pointer",
              }}
            >
              <input
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
              {uploading ? "Enviando..." : "Enviar foto da máquina"}
            </label>
          </div>
        </div>

        <div className="field">
          <span>Nome</span>
          <input
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="field">
          <span>Email</span>
          <input className="input" value={user.email} disabled />
        </div>

        <div className="field">
          <span>URL da foto</span>
          <input
            className="input"
            placeholder="https://..."
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
          />
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <button className="button" onClick={handleSave} disabled={saving}>
            {saving ? "Salvando..." : "Salvar"}
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
