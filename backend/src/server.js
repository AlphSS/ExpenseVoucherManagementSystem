
import express from "express";
import "dotenv/config";
import authRoutes from "./routes/auth.routes.js";
import { authenticate } from "./middleware/authenticate.js";
import { authorizeRole } from "./middleware/authorizeRole.js";

const app = express();

app.use(express.json({ limit: "1mb" }));

// Public route
app.use("/api/auth", authRoutes);

// Protected test route: any authenticated user
app.get("/api/auth/me", authenticate, (req, res) => {
  res.json({ user: req.user });
});

// Test routes for the three roles
app.get(
  "/api/test/employee",
  authenticate,
  authorizeRole("EMPLOYEE"),
  (req, res) => res.json({ message: "Employee access granted." })
);

app.get(
  "/api/test/director",
  authenticate,
  authorizeRole("DIRECTOR"),
  (req, res) => res.json({ message: "Director access granted." })
);

app.get(
  "/api/test/accounts",
  authenticate,
  authorizeRole("ACCOUNTS"),
  (req, res) => res.json({ message: "Accounts access granted." })
);

// Generic error handler
app.use((err, req, res, next) => {
  console.error(err);

  if (res.headersSent) {
    return next(err);
  }

  res.status(500).json({
    message: "An unexpected server error occurred.",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
