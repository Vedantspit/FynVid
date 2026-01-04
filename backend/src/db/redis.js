import { createClient } from "redis";

const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://host.docker.internal:6379",
});
redisClient.on("connect", () =>
  console.log(`⏰Initiating Redis connection to the server`)
);
redisClient.on("ready", () => console.log(`Redis Client ready to use 🚩`));

redisClient.on("error", (err) => console.log("Redis Client Error", err));

await redisClient.connect();

export default redisClient;
