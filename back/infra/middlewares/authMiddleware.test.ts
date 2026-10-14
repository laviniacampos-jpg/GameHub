import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import { adminOnly, authMiddleware } from "./authMiddleware";
import type { AuthenticatedRequest } from "./authMiddleware";
import { environment } from "../config/environment";

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

describe("authMiddleware", () => {
  it("valida Bearer JWT e disponibiliza as claims do usuário", () => {
    const token = jwt.sign(
      { id: 9, email: "admin@gamehub.local", role: "admin" },
      environment.jwtSecret,
      { expiresIn: "8h" }
    );
    const request = { headers: { authorization: `Bearer ${token}` } } as AuthenticatedRequest;
    const recorder = createResponseRecorder();
    let nextCalled = false;

    authMiddleware(request, recorder.response, (() => { nextCalled = true; }) as NextFunction);

    assert.equal(nextCalled, true);
    assert.deepEqual(request.user, { id: 9, email: "admin@gamehub.local", role: "admin" });
    assert.equal(recorder.record.statusCode, 200);
  });

  it("recusa requisição sem token", () => {
    const request = { headers: {} } as AuthenticatedRequest;
    const recorder = createResponseRecorder();

    authMiddleware(request, recorder.response, (() => undefined) as NextFunction);

    assert.equal(recorder.record.statusCode, 401);
  });

  it("bloqueia usuário student na barreira administrativa", () => {
    const request = {
      user: { id: 3, email: "aluno@gamehub.local", role: "student" }
    } as AuthenticatedRequest;
    const recorder = createResponseRecorder();
    let nextCalled = false;

    adminOnly(request, recorder.response, (() => { nextCalled = true; }) as NextFunction);

    assert.equal(recorder.record.statusCode, 403);
    assert.equal(nextCalled, false);
  });
});