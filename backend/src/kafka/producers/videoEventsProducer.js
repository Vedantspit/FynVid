import kafka from "../kafkaClient.js";

const producer = kafka.producer();
export const connectProducer = async () => {
  await producer.connect();
  console.log("✅ Kafka Producer connected");
};
// producer function for Video View Event
const publishVideoViewEvent = async (videoId, userId) => {
  try {
    await producer.send({
      topic: "fynvid-video-views",
      messages: [
        {
          value: JSON.stringify({
            videoId,
            userId: userId || null,
            timestamp: Date.now(),
          }),
        },
      ],
    });
  } catch (error) {
    console.error("❌ Error publishing video view event:", error);
  }
};
// producer for sending Video Liked info
const publishVideoLikeEvent = async (videoId, userId, message) => {
  try {
    await producer.send({
      topic: "fynvid-video-like",
      messages: [
        {
          value: JSON.stringify({
            videoId,
            userId: userId || null,
            personalMsg: message,
            timestamp: Date.now(),
          }),
        },
      ],
    });
  } catch (error) {
    console.error("❌ Error publishing video like event:", error);
  }
};

// producer for sending someone added Comment on Owners Video
const videoCommentAddEvent = async (videoId, userId, commentId, content) => {
  try {
    await producer.send({
      topic: "fynvid-video-comments",
      messages: [
        {
          value: JSON.stringify({
            videoId,
            userId,
            commentId,
            content,
            timestamp: Date.now(),
          }),
        },
      ],
    });
  } catch (error) {
    console.error("❌ Error publishing video comment event:", error);
  }
};

// producer for sending someone subscribed to Owners Channel
const publishSubscriptionEvent = async (subscriberId, channelId, action) => {
  try {
    await producer.send({
      topic: "fynvid-subscription",
      messages: [
        {
          value: JSON.stringify({
            subscriberId,
            channelId,
            action, // "SUBSCRIBE" or "UNSUBSCRIBE"
            timestamp: Date.now(),
          }),
        },
      ],
    });
    console.log(`💡Published ${action} event for channel ${channelId}`);
  } catch (error) {
    console.error("❌ Error publishing subscription event:", error);
  }
};

export {
  publishVideoLikeEvent,
  publishVideoViewEvent,
  videoCommentAddEvent,
  publishSubscriptionEvent,
};
