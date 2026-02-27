import request from "supertest";
import { app, registerUser } from "./helpers";

describe("Auth", () => {
  it("registers and logs in a user", async () => {
    const register = await request(app).post("/api/auth/register").send({
      email: "user@example.com",
      password: "password123",
      username: "jane",
    });

    expect(register.status).toBe(201);
    expect(register.body.data.user.email).toBe("user@example.com");

    const login = await request(app).post("/api/auth/login").send({
      email: "user@example.com",
      password: "password123",
    });

    expect(login.status).toBe(200);
    expect(login.body.data.accessToken).toBeTruthy();
    expect(login.body.data.refreshToken).toBeTruthy();
  });

  it("refreshes tokens", async () => {
    const data = await registerUser("refresh@example.com", "password123");

    const refresh = await request(app).post("/api/auth/refresh").send({
      refreshToken: data.refreshToken,
    });

    expect(refresh.status).toBe(200);
    expect(refresh.body.data.accessToken).toBeTruthy();
    expect(refresh.body.data.refreshToken).toBeTruthy();
  });

  it("logs out a session", async () => {
    const data = await registerUser("logout@example.com", "password123");

    const logout = await request(app).post("/api/auth/logout").send({
      refreshToken: data.refreshToken,
    });

    expect(logout.status).toBe(200);
  });
});
