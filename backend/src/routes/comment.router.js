import { Router } from "express";
import {
  addComment,
  deleteComment,
  getVideoComments,
  updateComment,
} from "../controllers/comment.controller.js";
import { verifyJWT } from "../middlewares/auth.js";
import rateLimit from "express-rate-limit";

// Specific limiter: Comment spam
const commentLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  limit: 20,
  message: { error: "Too many comments, please slow down." },
  standardHeaders: true,
  legacyHeaders: false,
});
const router = Router();

router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file
router.get("/:videoId", getVideoComments);

// Add comment (with limiter)
router.post("/:videoId", commentLimiter, addComment);

router.delete("/c/:commentId", deleteComment);
router.patch("/c/:commentId", updateComment);

export default router;
