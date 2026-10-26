import { loginUser } from "../services/auth.service.js";
import { demoLogin } from "../services/auth.service.js";

export async function login(req, res, next) {
  try {
    const { email, password } = req.body ?? {};

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password ||
      email.length > 255 ||
      password.length > 128
    ) {
      return res.status(400).json({
        message: "A valid email and password are required.",
      });
    }

    const result = await loginUser(email, password);

    if (!result) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    return res.status(200).json({
      message: "Login successful.",
      token: result.token,
      user: result.user,
    });
  } catch (error) {
    next(error);
  }
}



export async function demoLoginController(req, res, next) {
  try {
    const { role } = req.body ?? {};

    if (
      typeof role !== "string" ||
      !["EMPLOYEE", "DIRECTOR", "ACCOUNTS"].includes(role)
    ) {
      return res.status(400).json({
        message: "A valid demo role is required.",
      });
    }

    const result = await demoLogin(role);

    if (!result) {
      return res.status(401).json({
        message: "Demo account is unavailable.",
      });
    }

    return res.status(200).json({
      message: "Demo login successful.",
      token: result.token,
      user: result.user,
    });
  } catch (error) {
    next(error);
  }
}