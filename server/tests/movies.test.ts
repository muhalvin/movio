import request from "supertest";
import { app, registerUser, loginUser, makeAdmin } from "./helpers";

describe("Movies", () => {
  it("allows admin to create and list movies", async () => {
    const admin = await registerUser("admin@example.com", "password123");
    await makeAdmin(admin.user.id);
    const login = await loginUser("admin@example.com", "password123");

    const create = await request(app)
      .post("/api/movies")
      .set("Authorization", `Bearer ${login.accessToken}`)
      .send({
        title: "Inception",
        description: "A mind-bending thriller",
        releaseDate: "2010-07-16",
        genres: ["Sci-Fi", "Thriller"],
      });

    expect(create.status).toBe(201);

    const list = await request(app).get("/api/movies").query({ genre: "Sci-Fi" });
    expect(list.status).toBe(200);
    expect(list.body.data.items.length).toBe(1);
  });
});
