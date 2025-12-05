import kafka from "../kafkaClient.js";
import { Notification } from "../../models/notification.model.js";
import { Video } from "../../models/video.model.js";

const consumer = kafka.consumer({ groupId: "video-comment-events-group" });

export const runVideoCommentConsumer = async () => {
  await consumer.connect();
  console.log("✅ Kafka Comment Consumer connected");

  await consumer.subscribe({
    topic: "fynvid-video-comments",
    fromBeginning: false,
  });

  await consumer.run({
    eachMessage: async ({ message }) => {
      const { videoId, userId, commentId, content } = JSON.parse(
        message.value.toString()
      );
      // For Notiication

      try {
        const video = await Video.findById(videoId);
        if (!video) return;

        await Notification.create({
          recipient: video.owner,
          sender: userId,
          type: "COMMENT",
          video: videoId,
          message: `commented: ${content}`,
        });

        console.log(
          `💬 Notification created: ${userId} commented on ${videoId}`
        );
      } catch (err) {
        console.error("❌ Error creating comment notification:", err);
      }
    },
  });
};
