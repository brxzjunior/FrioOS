import { Router } from "express";
import multer from "multer";

const router = Router();

const upload = multer({ dest: "uploads/" });

router.post("/avatar", upload.single("avatar"), (req, res) => {
  const file = req.file;

  if (!file) {
    return res.status(400).json({ message: "Arquivo não enviado" });
  }

  const url = `http://localhost:3333/uploads/${file.filename}`;

  return res.json({ url });
});

export default router;
