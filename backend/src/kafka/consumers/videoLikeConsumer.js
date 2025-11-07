import { Notification } from "../../models/notification.model.js";
import { Video } from "../../models/video.model.js";
import kafka from "../kafkaClient.js";
const consumer = kafka.consumer({ groupId: "video-like-events-group" });

export const runVideoLikeConsumer = async () => {
  await consumer.connect();
  console.log("✅ Kafka Like Consumer connected");

  await consumer.subscribe({
    topic: "fynvid-video-like",
    fromBeginning: false,
  });
  // For analytics only
  await consumer.run({
    eachMessage: async ({ message }) => {
      const { videoId, userId, personalMsg, timestamp } = JSON.parse(
        message.value.toString()
      );
      try {
        if (personalMsg == "LIKED") {
          const video = await Video.findById(videoId);
          if (!video) return;
          await Notification.create({
            recipient: video.owner,
            sender: userId,
            type: "LIKE",
            video: videoId,
            message: personalMsg || "like your video",
          });
          console.log(
            `🔔 Notification created: User ${userId} liked ${videoId}`
          );
        }
      } catch (error) {
        console.error("❌ Error creating like notification:", err);
      }
    },
  });
};
