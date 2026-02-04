import dotenv from "dotenv";
import connectDb from "./db/index.js";
import { app } from "./app.js";
import { connectProducer } from "./kafka/producers/videoEventsProducer.js";
import { runVideoLikeConsumer } from "./kafka/consumers/videoLikeConsumer.js";
import { runVideoCommentConsumer } from "./kafka/consumers/videoCommentConsumer.js";
import { runPublishSubscriptionConsumer } from "./kafka/consumers/subscriptionPublishConsumer.js";
import { runVideoViewsConsumer } from "./kafka/consumers/videoViewConsumer.js";
dotenv.config();

(async () => {
  await connectProducer();
  await runVideoViewsConsumer();
  await runVideoLikeConsumer();
  await runVideoCommentConsumer();
  await runPublishSubscriptionConsumer();
})();

connectDb()
  .then(
    app.listen(process.env.PORT, () => {
      console.log(`Listening on port ${process.env.PORT}`);
    }),
  )
  .catch((err) => {
    console.log("MongoDB Connection Error !! ", err);
  });
