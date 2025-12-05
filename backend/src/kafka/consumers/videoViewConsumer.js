import kafka from "../kafkaClient.js";
import mongoose from "mongoose";
import { Video } from "../../models/video.model.js";
import { User } from "../../models/user.model.js";

const consumer = kafka.consumer({ groupId: "video-events-group" });

export const runVideoViewsConsumer = async () => {
  await consumer.connect();
  console.log("✅ Kafka Video Views Consumer connected");

  await consumer.subscribe({
    topic: "fynvid-video-views",
    fromBeginning: false,
  });

  await consumer.run({
    eachBatch: async ({ batch }) => {
      const updates = {};

      for (const message of batch.messages) {
        const { videoId, userId } = JSON.parse(message.value.toString());

        // Track view count aggregation
        if (mongoose.isValidObjectId(videoId)) {
          updates[videoId] = (updates[videoId] || 0) + 1;
        }

        // Update watch history (async, per user)
        if (mongoose.isValidObjectId(userId)) {
          try {
            const user = await User.findById(userId);
            if (user) {
              user.watchHistory = user.watchHistory.filter(
                (id) => String(id) !== String(videoId)
              );
              user.watchHistory.push(videoId);
              await user.save();
            }
          } catch (err) {
            console.error("Error updating watch history:", err);
          }
        }
      }

      // Batch update view counts
      const bulkOps = Object.entries(updates).map(([videoId, count]) => ({
        updateOne: {
          filter: { _id: videoId },
          update: { $inc: { views: count } },
        },
      }));

      if (bulkOps.length) {
        await Video.bulkWrite(bulkOps);
        console.log(`✅ Updated ${bulkOps.length} videos' views`);
      }
    },
  });
};
