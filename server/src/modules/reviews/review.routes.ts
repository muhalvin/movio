import { Router } from "express";
import { validate } from "../../middlewares/validate";
import { requireAuth } from "../../middlewares/auth";
import { createReview, deleteReview, listReviewsForMovie, updateReview } from "./review.controller";
import { createReviewSchema, deleteReviewSchema, listReviewsSchema, updateReviewSchema } from "./review.validators";

const router = Router();

router.get("/movie/:movieId", validate(listReviewsSchema), listReviewsForMovie);
router.post("/", requireAuth, validate(createReviewSchema), createReview);
router.put("/:id", requireAuth, validate(updateReviewSchema), updateReview);
router.delete("/:id", requireAuth, validate(deleteReviewSchema), deleteReview);

export default router;
