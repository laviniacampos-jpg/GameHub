import { db } from "../database/db";
import type { User } from "../../src/model/User";

interface UserRow {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  role: User["role"];
}

function mapUser(row: UserRow): User {
  return {
    id: Number(row.id),
    name: row.name,
    email: row.email,
    passwordHash: row.password_hash,
    role: row.role
  };
}

export class UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    const result = await db.query<UserRow>(
      "SELECT id, name, email, password_hash, role FROM users WHERE email = $1",
      [email]
    );
    return result.rows[0] ? mapUser(result.rows[0]) : null;
  }

  async create(input: Omit<User, "id">): Promise<User> {
    const result = await db.query<UserRow>(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, password_hash, role`,
      [input.name, input.email, input.passwordHash, input.role]
    );
    return mapUser(result.rows[0]);
  }
}