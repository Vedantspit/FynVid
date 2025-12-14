import { Notification } from "../models/notification.model.js";

//  Get all notifications for the logged-in user
export const getUserNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .populate("sender", "fullName avatar")
      .populate("video", "title thumbnail")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: notifications });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "Error fetching notifications" });
  }
};

//  Mark a single notification as read
export const markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findOneAndUpdate(
      { _id: id, recipient: req.user._id },
      { isRead: true },
      { new: true }
    );

    if (!notification)
      return res
        .status(404)
        .json({ success: false, message: "Notification not found" });

    res.json({ success: true, data: notification });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error marking as read" });
  }
};

//  Mark ALL unread notifications as read
export const markAllNotificationsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { isRead: true }
    );
    res.json({ success: true, message: "All notifications marked as read" });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Error marking all notifications as read",
    });
  }
};

// Get count of unread notifications
export const getUnreadNotificationCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      recipient: req.user._id,
      isRead: false,
    });
    res.json({ success: true, count });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Error fetching unread notification count",
    });
  }
};
