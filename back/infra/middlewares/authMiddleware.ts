import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { environment } from "../config/environment";

export interface AuthenticatedRequest extends Request {
  user?: { id: number; email: string; role: "admin" | "student" };
}

export function authMiddleware(
  request: AuthenticatedRequest,
  response: Response,
  next: NextFunction
) {
  const authorization = request.headers.authorization;
  const token = authorization?.startsWith("Bearer ")
    ? authorization.slice(7)
    : null;

  if (!token) {
    response.status(401).json({ message: "Autenticação necessária." });
    return;
  }

  try {
    const payload = jwt.verify(token, environment.jwtSecret);
    if (
      typeof payload === "string" ||
      typeof payload.id !== "number" ||
      typeof payload.email !== "string" ||
      (payload.role !== "admin" && payload.role !== "student")
    ) {
      response.status(401).json({ message: "Token inválido ou expirado." });
      return;
    }
    request.user = { id: payload.id, email: payload.email, role: payload.role };
    next();
  } catch {
    response.status(401).json({ message: "Token inválido ou expirado." });
  }
}

export function adminOnly(
  request: AuthenticatedRequest,
  response: Response,
  next: NextFunction
) {
  if (request.user?.role !== "admin") {
    response.status(403).json({ message: "Acesso restrito ao administrador." });
    return;
  }

  next();
}
