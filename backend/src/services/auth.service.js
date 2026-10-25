import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";

const JWT_ISSUER = "expense-voucher-api";
const JWT_AUDIENCE = "expense-voucher-client";

export async function loginUser(email, password) {
  const normalizedEmail = email.trim().toLowerCase();

  const result = await pool.query(
    `SELECT id, name, email, password_hash, role, is_active
     FROM users
     WHERE email = $1
     LIMIT 1`,
    [normalizedEmail],
  );

  const user = result.rows[0];

  // Use the same response for an unknown email and wrong password.
  if (!user || !user.is_active) {
    return null;
  }

  const passwordMatches = await bcrypt.compare(password, user.password_hash);

  if (!passwordMatches) {
    return null;
  }

  const token = jwt.sign({ role: user.role }, process.env.JWT_SECRET, {
    subject: String(user.id),
    expiresIn: process.env.JWT_EXPIRES_IN || "15m",
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE,
    algorithm: "HS256",
  });

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
}
