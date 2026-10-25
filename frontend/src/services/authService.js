import { apiRequest } from "./api";

export async function loginUser(email, password) {
  const data = await apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  if (!data.token || !data.user) {
    throw new Error("Invalid login response from the server.");
  }

  localStorage.setItem("evms_token", data.token);
  localStorage.setItem("evms_user", JSON.stringify(data.user));

  return data.user;
}

export function logoutUser() {
  localStorage.removeItem("evms_token");
  localStorage.removeItem("evms_user");
}
