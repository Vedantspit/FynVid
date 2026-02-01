import { Router } from "express";
import {
  addComment,
  deleteComment,
  getVideoComments,
  updateComment,
  getCommentReplies,
} from "../controllers/comment.controller.js";
import { verifyJWT } from "../middlewares/auth.js";
import rateLimit from "express-rate-limit";

// Specific limiter: Comment spam
const commentLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  limit: 10,
  message: { error: "Too many comments, please slow down." },
  standardHeaders: true,
  legacyHeaders: false,
});
const router = Router();

router.use(verifyJWT);

// COMMENT-LEVEL routes first
router.get("/c/:commentId", getCommentReplies);
router.delete("/c/:commentId", deleteComment);
router.patch("/c/:commentId", updateComment);

// VIDEO-LEVEL routes last
router.get("/:videoId", getVideoComments);
router.post("/:videoId", commentLimiter, addComment);

export default router;
