import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.js";
import {
  getUserNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getUnreadNotificationCount,
} from "../controllers/notification.controller.js";

const router = Router();

router.get("/", verifyJWT, getUserNotifications);
router.patch("/:id/read", verifyJWT, markNotificationRead);
router.patch("/read/all", verifyJWT, markAllNotificationsRead);
router.get("/unread-count", verifyJWT, getUnreadNotificationCount);
export default router;
