import express from "express";
import cors from "cors";
import multer from "multer";
import "dotenv/config";
import authRoutes from "./routes/auth.routes.js";
import { authenticate } from "./middleware/authenticate.js";
import { authorizeRole } from "./middleware/authorizeRole.js";
import voucherRoutes from "./routes/voucher.routes.js";
import directorRoutes from "./routes/director.routes.js";
import accountsRoutes from "./routes/accounts.routes.js";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json({ limit: "1mb" }));

// Public route
app.use("/api/auth", authRoutes);
app.use("/api/vouchers", voucherRoutes);
app.use("/api/director", directorRoutes);
app.use("/api/accounts", accountsRoutes);

app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  if (err instanceof multer.MulterError) {
    const message =
      err.code === "LIMIT_FILE_SIZE"
        ? "Signature image must be 2 MB or smaller."
        : "Invalid signature upload.";

    return res.status(400).json({ message });
  }

  if (err.status) {
    return res.status(err.status).json({
      message: err.message,
    });
  }

  console.error("Request failed:", err.message);

  return res.status(500).json({
    message: "An unexpected server error occurred.",
  });
});

// Protected test route: any authenticated user
app.get("/api/auth/me", authenticate, (req, res) => {
  res.json({ user: req.user });
});

// Test routes for the three roles
app.get(
  "/api/test/employee",
  authenticate,
  authorizeRole("EMPLOYEE"),
  (req, res) => res.json({ message: "Employee access granted." }),
);

app.get(
  "/api/test/director",
  authenticate,
  authorizeRole("DIRECTOR"),
  (req, res) => res.json({ message: "Director access granted." }),
);

app.get(
  "/api/test/accounts",
  authenticate,
  authorizeRole("ACCOUNTS"),
  (req, res) => res.json({ message: "Accounts access granted." }),
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
