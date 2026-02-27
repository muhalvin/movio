import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes";
import movieRoutes from "../modules/movies/movie.routes";
import reviewRoutes from "../modules/reviews/review.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/movies", movieRoutes);
router.use("/reviews", reviewRoutes);

export default router;
