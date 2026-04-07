import { Router } from "express";
import multer from "multer";

const router = Router();

const upload = multer({ dest: "uploads/" });

router.post("/avatar", upload.single("avatar"), (req, res) => {
  const file = req.file;

  if (!file) {
    return res.status(400).json({ message: "Arquivo não enviado" });
  }

  const BACKEND_URL = process.env.BACKEND_URL || `http://localhost:3333`;
  const url = `${BACKEND_URL}/uploads/${file.filename}`;

  return res.json({ url });
});

export default router;
