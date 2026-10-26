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

const DEMO_EMAILS = {
  EMPLOYEE: process.env.DEMO_EMPLOYEE_EMAIL,
  DIRECTOR: process.env.DEMO_DIRECTOR_EMAIL,
  ACCOUNTS: process.env.DEMO_ACCOUNTS_EMAIL,
};

export async function demoLogin(role) {
  if (process.env.ENABLE_DEMO_LOGIN !== "true") {
    const error = new Error("Demo login is disabled.");
    error.status = 404;
    throw error;
  }

  const normalizedRole = String(role || "").toUpperCase();
  const email = DEMO_EMAILS[normalizedRole];

  if (!email) {
    return null;
  }

  // Verify the configured account exists and has the expected role.
  const result = await pool.query(
    `SELECT role, is_active
     FROM users
     WHERE email = $1
     LIMIT 1`,
    [email.trim().toLowerCase()],
  );

  const demoUser = result.rows[0];

  if (
    !demoUser ||
    !demoUser.is_active ||
    demoUser.role !== normalizedRole
  ) {
    return null;
  }

  // The demo account's password is read only on the server.
  const passwordEnvKey = `DEMO_${normalizedRole}_PASSWORD`;
  const password = process.env[passwordEnvKey];

  if (!password) {
    throw new Error(`Missing server configuration: ${passwordEnvKey}`);
  }

  return loginUser(email, password);
}