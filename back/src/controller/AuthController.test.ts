import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { AuthController } from "./AuthController";
import type { User } from "../model/User";
import { environment } from "../../infra/config/environment";

function createResponseRecorder() {
  const record: { statusCode: number; body: unknown } = { statusCode: 200, body: undefined };
  const response = {
    status(statusCode: number) {
      record.statusCode = statusCode;
      return response;
    },
    json(body: unknown) {
      record.body = body;
      return response;
    }
  };
  return { response: response as unknown as Response, record };
}

function requestWithBody(body: unknown) {
  return { body } as Request;
}

describe("AuthController", () => {
  it("autentica com bcrypt e emite JWT com id, email, role e expiração de 8h", async () => {
    const passwordHash = await bcrypt.hash("123456", 4);
    const user: User = {
      id: 7,
      name: "Conta de teste",
      email: "aluno@gamehub.local",
      passwordHash,
      role: "student"
    };
    const controller = new AuthController({
      findByEmail: async () => user,
      create: async () => user
    });
    const recorder = createResponseRecorder();

    await controller.login(requestWithBody({ email: user.email, password: "123456" }), recorder.response);

    assert.equal(recorder.record.statusCode, 200);
    const result = recorder.record.body as { token: string; user: Omit<User, "passwordHash"> };
    const claims = jwt.verify(result.token, environment.jwtSecret) as jwt.JwtPayload;
    assert.deepEqual(
      { id: claims.id, email: claims.email, role: claims.role },
      { id: user.id, email: user.email, role: user.role }
    );
    assert.equal((claims.exp ?? 0) - (claims.iat ?? 0), 8 * 60 * 60);
    assert.equal("passwordHash" in result.user, false);
  });

  it("recusa senha incorreta", async () => {
    const user: User = {
      id: 7,
      name: "Conta de teste",
      email: "aluno@gamehub.local",
      passwordHash: await bcrypt.hash("123456", 4),
      role: "student"
    };
    const controller = new AuthController({
      findByEmail: async () => user,
      create: async () => user
    });
    const recorder = createResponseRecorder();

    await controller.login(requestWithBody({ email: user.email, password: "senha-errada" }), recorder.response);

    assert.equal(recorder.record.statusCode, 401);
  });

  it("registra usuário com senha bcrypt e papel student", async () => {
    let createdUser: User | undefined;
    const controller = new AuthController({
      findByEmail: async () => null,
      create: async (input) => {
        createdUser = { id: 22, ...input };
        return createdUser;
      }
    });
    const recorder = createResponseRecorder();

    await controller.register(
      requestWithBody({ name: "Novo Aluno", email: "novo@gamehub.local", password: "123456" }),
      recorder.response
    );

    assert.equal(recorder.record.statusCode, 201);
    assert.equal(createdUser?.role, "student");
    assert.notEqual(createdUser?.passwordHash, "123456");
    assert.equal(await bcrypt.compare("123456", createdUser?.passwordHash ?? ""), true);
  });
});