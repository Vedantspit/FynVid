import kafka from "../kafkaClient.js";
import { Notification } from "../../models/notification.model.js";
import { Video } from "../../models/video.model.js";
const consumer = kafka.consumer({
  groupId: "publish-subscription-events-group",
});

export const runPublishSubscriptionConsumer = async () => {
  await consumer.connect();
  console.log("✅ Kafka Publish Subscription Consumer connected");

  await consumer.subscribe({
    topic: "fynvid-subscription",
    fromBeginning: false,
  });
  // For Notiication
  await consumer.run({
    eachMessage: async ({ message }) => {
      const {
        subscriberId,
        channelId,
        action, // "SUBSCRIBE" or "UNSUBSCRIBE"
      } = JSON.parse(message.value.toString());

      try {
        if (action === "SUBSCRIBED") {
          await Notification.create({
            recipient: channelId,
            sender: subscriberId,
            type: "SUBSCRIBE",
            message: `subscribed to your channel`,
          });
          console.log(
            `🔔 Notification: ${subscriberId} subscribed to ${channelId}`
          );
        }
      } catch (error) {
        console.error("❌ Error creating subscription notification:", err);
      }
    },
  });
};
