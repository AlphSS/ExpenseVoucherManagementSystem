import "dotenv/config";
import bcrypt from "bcrypt";
import pool from "../src/config/db.js";

const testUsers = [
  {
    name: "Test Employee",
    employeeId: "EMP001",
    email: "employee@example.com",
    role: "EMPLOYEE",
    department: "IT",
    passwordEnv: "SEED_EMPLOYEE_PASSWORD",
  },
  {
    name: "Test Director",
    employeeId: null,
    email: "director@example.com",
    role: "DIRECTOR",
    department: "Management",
    passwordEnv: "SEED_DIRECTOR_PASSWORD",
  },
  {
    name: "Test Accounts",
    employeeId: null,
    email: "accounts@example.com",
    role: "ACCOUNTS",
    department: "Finance",
    passwordEnv: "SEED_ACCOUNTS_PASSWORD",
  },
];

async function seedUsers() {
  for (const user of testUsers) {
    const password = process.env[user.passwordEnv];

    if (!password || password.length < 12) {
      throw new Error(
        `${user.passwordEnv} must be set and at least 12 characters long.`,
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const result = await pool.query(
      `INSERT INTO users
         (name, employee_id, email, password_hash, role, department)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (email) DO NOTHING
       RETURNING id, email, role`,
      [
        user.name,
        user.employeeId,
        user.email,
        passwordHash,
        user.role,
        user.department,
      ],
    );

    if (result.rowCount) {
      console.log("Created test user:", result.rows[0]);
    } else {
      console.log("Email already exists; skipped:", user.email);
    }
  }
}

try {
  await seedUsers();
} catch (error) {
  console.error("Test user seeding failed:", error.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
