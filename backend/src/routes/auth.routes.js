import { Router } from "express";
import { login, demoLoginController } from "../controllers/auth.controller.js";

const router = Router();

router.post("/login", login);
router.post("/demo-login", demoLoginController);

export default router;
