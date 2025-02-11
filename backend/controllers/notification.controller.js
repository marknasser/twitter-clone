import Notification from "../models/notification.model.js";

export const deleteNotifications = async (req, res) => {
  try {
    const { currentUser } = req;
    const result = await Notification.deleteMany({ to: currentUser._id });

    res.status(200).json({ message: "Notifications deleted successfully" });
  } catch (error) {
    console.log("Error in deleteNotifications controller: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getNotifications = async (req, res) => {
  try {
    const { currentUser } = req;
    const myNotifications = await Notification.find({
      to: currentUser._id,
    }).populate({
      path: "from",
      select: "username profileImg",
    });

    await Notification.updateMany({ to: currentUser._id }, { read: true });

    res.status(200).json(myNotifications);
  } catch (error) {
    console.log("Error in getNotifications controller: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
