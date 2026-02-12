import { Router } from "express";
import { listClients, createClient } from "../controllers/client.controller";

const router = Router();

router.get("/clients", listClients);
router.post("/clients", createClient);

export default router;
