import jwt from "jsonwebtoken";

export function generateToken(user: any) {
  return jwt.sign(
    {
      sub: user.id, // 🔥 ESSENCIAL
      email: user.email,
    },
    process.env.JWT_SECRET!,
    {
      expiresIn: "7d",
    },
  );
}
