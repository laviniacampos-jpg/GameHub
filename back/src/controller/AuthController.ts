import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { environment } from "../../infra/config/environment";
import { UserRepository } from "../../infra/repositories/UserRepository";
import type { User } from "../model/User";

export class AuthController {
  constructor(private readonly users = new UserRepository()) {}

  private createToken(user: User) {
    return jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      environment.jwtSecret,
      { expiresIn: "8h" }
    );
  }

  private session(user: User) {
    return {
      token: this.createToken(user),
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    };
  }

  login = async (request: Request, response: Response) => {
    const parsed = z.object({
      email: z.string().email(),
      password: z.string().min(6).max(72)
    }).safeParse(request.body);

    if (!parsed.success) {
      response.status(400).json({ message: "Informe um e-mail e uma senha válidos." });
      return;
    }

    const user = await this.users.findByEmail(parsed.data.email.trim().toLowerCase());

    if (!user || !(await bcrypt.compare(parsed.data.password, user.passwordHash))) {
      response.status(401).json({ message: "E-mail ou senha incorretos." });
      return;
    }

    response.json(this.session(user));
  };

  register = async (request: Request, response: Response) => {
    const parsed = z.object({
      name: z.string().trim().min(2).max(120),
      email: z.string().trim().email().max(255),
      password: z.string().min(6).max(72)
    }).safeParse(request.body);

    if (!parsed.success) {
      response.status(400).json({ message: "Informe nome, e-mail e senha válidos." });
      return;
    }

    const email = parsed.data.email.toLowerCase();
    if (await this.users.findByEmail(email)) {
      response.status(409).json({ message: "Já existe uma conta com este e-mail." });
      return;
    }

    try {
      const user = await this.users.create({
        name: parsed.data.name,
        email,
        passwordHash: await bcrypt.hash(parsed.data.password, 10),
        role: "student"
      });
      response.status(201).json(this.session(user));
    } catch (error) {
      if (typeof error === "object" && error !== null && "code" in error && error.code === "23505") {
        response.status(409).json({ message: "Já existe uma conta com este e-mail." });
        return;
      }
      response.status(500).json({ message: "Não foi possível criar a conta." });
    }
  };
}
