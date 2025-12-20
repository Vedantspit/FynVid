import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import { RedisStore } from "rate-limit-redis";
import redisClient from "./db/redis.js";

dotenv.config();

const globalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore({
    sendCommand: (...args) => redisClient.sendCommand(args),
  }),
});
const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
app.set("trust proxy", 1);
app.use(globalLimiter);
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

app.use((req, res, next) => {
  console.log(
    `[${process.env.SERVER_NAME}] served ${req.method}  ${req.originalUrl}. Client IP: ${req.ip}`
  );
  next();
});
//routes import
import userRouter from "./routes/user.router.js";
import subscriptionRouter from "./routes/subscription.router.js";
import videoRouter from "./routes/video.router.js";
import commentRouter from "./routes/comment.router.js";
import likeRouter from "./routes/like.router.js";
import playlistRouter from "./routes/playlist.router.js";
import dashboardRouter from "./routes/dashboard.router.js";
import notifyRouter from "./routes/notification.router.js";
//routes declaration
// app.get("/api/v1/check", () => {
//   console.log("Health check working fine ☑️");
// });
app.head("/api/v1/check", (req, res) => {
  console.log("Health check working fine ☑️"); // 1. Use res.sendStatus(200) for a successful HEAD request. //    sendStatus(200) automatically sets the status and sends the response //    with no body, which is exactly what HEAD expects.
  res.sendStatus(200);
});
app.use("/api/v1/users", userRouter);
app.use("/api/v1/subscriptions", subscriptionRouter);
app.use("/api/v1/videos", videoRouter);
app.use("/api/v1/comments", commentRouter);
app.use("/api/v1/likes", likeRouter);
app.use("/api/v1/playlist", playlistRouter);
app.use("/api/v1/dashboard", dashboardRouter);
app.use("/api/v1/notifications", notifyRouter);

// http://localhost:8000/api/v1/users/register

export { app };
