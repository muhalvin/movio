import request from "supertest";
import { app, registerUser, loginUser, makeAdmin } from "./helpers";

describe("Reviews", () => {
  it("allows a user to create, update, and delete their review", async () => {
    const admin = await registerUser("admin2@example.com", "password123");
    await makeAdmin(admin.user.id);
    const adminLogin = await loginUser("admin2@example.com", "password123");

    const movie = await request(app)
      .post("/api/movies")
      .set("Authorization", `Bearer ${adminLogin.accessToken}`)
      .send({
        title: "Interstellar",
        description: "Space adventure",
        releaseDate: "2014-11-07",
        genres: ["Sci-Fi"],
      });

    await registerUser("reviewer@example.com", "password123");
    const userLogin = await loginUser("reviewer@example.com", "password123");

    const create = await request(app)
      .post("/api/reviews")
      .set("Authorization", `Bearer ${userLogin.accessToken}`)
      .send({
        movieId: movie.body.data.id,
        rating: 5,
        comment: "Amazing",
      });

    expect(create.status).toBe(201);

    const update = await request(app)
      .put(`/api/reviews/${create.body.data.id}`)
      .set("Authorization", `Bearer ${userLogin.accessToken}`)
      .send({
        rating: 4,
        comment: "Great",
      });

    expect(update.status).toBe(200);

    const del = await request(app)
      .delete(`/api/reviews/${create.body.data.id}`)
      .set("Authorization", `Bearer ${userLogin.accessToken}`);

    expect(del.status).toBe(200);
  });

  it("prevents duplicate reviews", async () => {
    const admin = await registerUser("admin3@example.com", "password123");
    await makeAdmin(admin.user.id);
    const adminLogin = await loginUser("admin3@example.com", "password123");

    const movie = await request(app)
      .post("/api/movies")
      .set("Authorization", `Bearer ${adminLogin.accessToken}`)
      .send({
        title: "Dune",
        description: "Epic",
        releaseDate: "2021-10-22",
        genres: ["Sci-Fi"],
      });

    await registerUser("reviewer2@example.com", "password123");
    const userLogin = await loginUser("reviewer2@example.com", "password123");

    await request(app)
      .post("/api/reviews")
      .set("Authorization", `Bearer ${userLogin.accessToken}`)
      .send({
        movieId: movie.body.data.id,
        rating: 5,
        comment: "Great",
      });

    const duplicate = await request(app)
      .post("/api/reviews")
      .set("Authorization", `Bearer ${userLogin.accessToken}`)
      .send({
        movieId: movie.body.data.id,
        rating: 4,
        comment: "Second",
      });

    expect(duplicate.status).toBe(409);
  });
});
