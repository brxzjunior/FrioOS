import passport from "passport";
import { Strategy as GoogleStrategy, Profile } from "passport-google-oauth20";
import { VerifyCallback } from "passport-oauth2";
import { findUserByEmail, createUser } from "../services/user.service";

// 🔍 DEBUG ENV (ESSENCIAL AGORA)
console.log("🔐 GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID);
console.log("🔐 GOOGLE_CLIENT_SECRET:", process.env.GOOGLE_CLIENT_SECRET);

// 🔐 ENV
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

// ❗ VALIDAÇÃO FORTE (evita erro silencioso)
if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  throw new Error(
    "❌ GOOGLE_CLIENT_ID ou GOOGLE_CLIENT_SECRET não definidos no .env",
  );
}

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3333/auth/google/callback",
    },
    async (
      accessToken: string,
      refreshToken: string,
      profile: Profile,
      done: VerifyCallback,
    ) => {
      try {
        console.log("👤 Perfil Google recebido:", profile.displayName);

        const email = profile.emails?.[0]?.value;

        if (!email) {
          console.log("❌ Email não veio do Google");
          return done(new Error("Email não encontrado no Google"), undefined);
        }

        console.log("📧 Email:", email);

        let user = await findUserByEmail(email);

        if (!user) {
          console.log("🆕 Criando novo usuário");

          user = await createUser({
            name: profile.displayName,
            email,
            googleId: profile.id,
          });
        } else {
          console.log("✅ Usuário já existe");
        }

        return done(null, user);
      } catch (error) {
        console.error("💥 ERRO NO GOOGLE AUTH:", error);
        return done(error as Error, undefined);
      }
    },
  ),
);
