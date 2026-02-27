import { Router } from "express";
import { login, logout, logoutAllSessions, refresh, register } from "./auth.controller";
import { validate } from "../../middlewares/validate";
import { loginSchema, logoutSchema, refreshSchema, registerSchema } from "./auth.validators";
import { requireAuth } from "../../middlewares/auth";

const router = Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/refresh", validate(refreshSchema), refresh);
router.post("/logout", validate(logoutSchema), logout);
router.post("/logout-all", requireAuth, logoutAllSessions);

export default router;
