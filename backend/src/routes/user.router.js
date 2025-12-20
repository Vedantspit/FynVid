import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  getRefreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
  getWatchHistory,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.js";
import { verifyJWT } from "../middlewares/auth.js";
import rateLimit from "express-rate-limit";
import redisClient from "../db/redis.js";
import { RedisStore } from "rate-limit-redis";

const router = Router();

router.post(
  "/register",
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    { name: "coverImage", maxCount: 1 },
  ]),
  registerUser
);
const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 20,
  message: { error: "Too many login attempts, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore({
    sendCommand: (...args) => redisClient.sendCommand(args),
    prefix: "rl-login:",
  }),
});
router.post("/login", loginLimiter, loginUser);
router.post("/refresh-token", getRefreshAccessToken);

//secured routes
router.post("/logout", verifyJWT, logoutUser);
router.post("/change-password", verifyJWT, changeCurrentPassword);

// get current logged-in user
router.get("/current-user", verifyJWT, getCurrentUser);

// update user account details (name/email)
router.patch("/update-account", verifyJWT, updateAccountDetails);

// update avatar
router.patch(
  "/update-avatar",
  verifyJWT,
  upload.single("avatar"),
  updateUserAvatar
);

// update cover image
router.patch(
  "/update-cover",
  verifyJWT,
  upload.single("coverImage"),
  updateUserCoverImage
);

router.get("/channel/:username", verifyJWT, getUserChannelProfile);
router.get("/history", verifyJWT, getWatchHistory);

router.options("/", (req, res) => {
  console.log("Custom OPTIONS handler executed!"); // Check container logs
  res.setHeader("X-Custom-Options-Handler", "true"); // Check Postman headers
  res.setHeader("Allow", "GET, POST, HEAD, PATCH");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, HEAD, PATCH");
  res.status(204).end();
});
export default router;
