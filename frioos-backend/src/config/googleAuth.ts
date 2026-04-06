import passport from "passport";
import { Strategy as GoogleStrategy, Profile } from "passport-google-oauth20";
import { VerifyCallback } from "passport-oauth2";

import { getUserByEmail, createUser } from "../services/user.service";

import crypto from "crypto";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  throw new Error(
    "GOOGLE_CLIENT_ID ou GOOGLE_CLIENT_SECRET não definidos no .env",
  );
}

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3333/auth/google/callback",
      scope: ["profile", "email"],
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
          return done(new Error("Email não encontrado no Google"), false);
        }

        let user = await getUserByEmail(email);

        if (!user) {
          console.log("🆕 Criando novo usuário");

          user = await createUser({
            id: crypto.randomUUID(),
            name: profile.displayName,
            email,
            avatarUrl: profile.photos?.[0]?.value || null,
          });
        } else {
          console.log("✅ Usuário já existe");
        }

        return done(null, user);
      } catch (error) {
        console.error("💥 ERRO NO GOOGLE AUTH:", error);
        return done(
          error instanceof Error ? error : new Error("Erro no Google Auth"),
          false,
        );
      }
    },
  ),
);
