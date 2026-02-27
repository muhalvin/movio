import { Request, Response, NextFunction } from "express";
import { loginUser, logoutAll, logoutSession, refreshSession, registerUser } from "./auth.service";

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password, username } = req.body;
    const result = await registerUser(email, password, username);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;
    const result = await loginUser(email, password);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const { refreshToken } = req.body;
    const result = await refreshSession(refreshToken);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    const { refreshToken } = req.body;
    await logoutSession(refreshToken);
    res.json({ success: true, data: { message: "Logged out" } });
  } catch (error) {
    next(error);
  }
}

export async function logoutAllSessions(req: Request, res: Response, next: NextFunction) {
  try {
    await logoutAll(req.user!.id);
    res.json({ success: true, data: { message: "Logged out of all sessions" } });
  } catch (error) {
    next(error);
  }
}
