import { Router } from "express";
import { validate } from "../../middlewares/validate";
import { requireAuth, requireRole } from "../../middlewares/auth";
import { createMovie, deleteMovie, getMovie, listMovies, updateMovie } from "./movie.controller";
import { createMovieSchema, getMovieSchema, listMoviesSchema, updateMovieSchema } from "./movie.validators";

const router = Router();

router.get("/", validate(listMoviesSchema), listMovies);
router.get("/:id", validate(getMovieSchema), getMovie);
router.post("/", requireAuth, requireRole("ADMIN"), validate(createMovieSchema), createMovie);
router.put("/:id", requireAuth, requireRole("ADMIN"), validate(updateMovieSchema), updateMovie);
router.delete("/:id", requireAuth, requireRole("ADMIN"), validate(getMovieSchema), deleteMovie);

export default router;
