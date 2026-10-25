import jwt from "jsonwebtoken";

const JWT_ISSUER = "expense-voucher-api";
const JWT_AUDIENCE = "expense-voucher-client";

export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Authentication required.",
    });
  }

  const token = authHeader.slice("Bearer ".length).trim();

  if (!token) {
    return res.status(401).json({
      message: "Authentication required.",
    });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ["HS256"],
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    });

    if (
      typeof payload === "string" ||
      typeof payload.sub !== "string" ||
      !["EMPLOYEE", "DIRECTOR", "ACCOUNTS"].includes(payload.role)
    ) {
      return res.status(401).json({
        message: "Invalid authentication token.",
      });
    }

    req.user = {
      id: payload.sub,
      role: payload.role,
    };

    next();
  } catch {
    return res.status(401).json({
      message: "Invalid or expired token.",
    });
  }
}
