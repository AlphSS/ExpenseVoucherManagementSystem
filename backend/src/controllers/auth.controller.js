import { loginUser } from "../services/auth.service.js";

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
