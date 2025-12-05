import mongoose, { Schema } from "mongoose";

const notifcationSchema = new Schema(
  {
    recipient: {
      type: Schema.Types.ObjectId, // The person who will see the notification
      ref: "User",
      required: true,
    },
    sender: {
      type: Schema.Types.ObjectId, // one who the event
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["LIKE", "COMMENT", "SUBSCRIBE"],
      required: true,
    },
    video: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video",
    },
    message: {
      type: String,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const Notification = mongoose.model("Notification", notifcationSchema);
