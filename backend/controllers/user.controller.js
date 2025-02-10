import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";

import { v2 as cloudinary } from "cloudinary";
import bcrypt from "bcryptjs";

export const getUserProfile = async (req, res) => {
  const { username } = req.params;
  try {
    const user = await User.findOne({ username }).select("-password");

    if (!user) {
      return res.status(401).json({ error: "username is not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.log("Error in getUserProfile controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
export const followUnfollowUser = async (req, res) => {
  try {
    const { id } = req.params;
    const userToModify = await User.findById(id);
    if (!userToModify) {
      return await res.status(400).json({ error: "User not found" });
    }

    if (id === req.currentUser._id.toString()) {
      return res
        .status(400)
        .json({ message: "You can't foolow/unfollow yourself" });
    }

    const isFollowing = req.currentUser.following.includes(id);

    if (isFollowing) {
      //Unfollow the user
      await User.findByIdAndUpdate(id, {
        $pull: { followers: req.currentUser._id },
      });
      await User.findByIdAndUpdate(req.currentUser._id, {
        $pull: { following: id },
      });

      return res.status(200).json({ message: "unfollowed successfully" });
    } else {
      //follow the user
      await User.findByIdAndUpdate(id, {
        $push: { followers: req.currentUser._id },
      });
      await User.findByIdAndUpdate(req.currentUser._id, {
        $push: { following: id },
      });

      //send notification to the user

      const newNotification = new Notification({
        type: "follow",
        from: req.currentUser._id,
        to: userToModify._id,
      });

      await newNotification.save();
      return res.status(200).json({ message: "followed successfully" });
    }
  } catch (error) {
    console.log("Error in followUnfollowUser controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getSuggestedUsers = async (req, res) => {
  console.log();
  try {
    const userFollowedByMe = await User.findById(req.currentUser._id).select(
      "following"
    );

    const users = await User.aggregate([
      {
        $match: {
          _id: { $ne: req.currentUser._id },
        },
      },
      { $sample: { size: 10 } },
    ]);

    const filteredUsers = users.filter(
      (user) => !userFollowedByMe.following.includes(user._id)
    );

    const suggestedUsers = filteredUsers.slice(0, 4);
    suggestedUsers.forEach((user) => (user.password = null));

    res.status(200).json(suggestedUsers);
  } catch (error) {
    console.log("Error in getSuggestedUsers controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const updateUser = async (req, res) => {
  let { currentUser } = req;
  const { fullName, email, username, currentPassword, newPassword, bio, link } =
    req.body;
  let { profileImg, coverImg } = req.body;

  try {
    if (
      (!newPassword && currentPassword) ||
      (!currentPassword && newPassword)
    ) {
      return res
        .status(400)
        .json({ error: "please provide both current and new password" });
    }
    if (newPassword && currentPassword) {
      const isMatch = await bcrypt.compare(
        currentPassword,
        currentUser.password
      );
      if (!isMatch) {
        return res.status(400).json({ error: "Current password is incorrect" });
      }
      if (newPassword.length < 6) {
        return res
          .status(400)
          .json({ error: "Password must be at least 6 characters long" });
      }

      const salt = await bcrypt.genSalt(10);
      currentUser.password = await bcrypt.hash(newPassword, salt);
    }

    if (profileImg) {
      if (currentUser.profileImg) {
        await cloudinary.uploader.destroy(
          currentUser.profileImg.split("/").pop().slpit(".")[0]
        );
      }

      const uploadedResponse = await cloudinary.uploader.upload(profileImg);
      profileImg = uploadedResponse.secure_url;
    }

    if (coverImg) {
      if (currentUser.coverImg) {
        await cloudinary.uploader.destroy(
          currentUser.coverImg.split("/").pop().slpit(".")[0]
        );

        const uploadedResponse = await cloudinary.uploader.upload(coverImg);
        coverImg = uploadedResponse.secure_url;
      }
    }
    currentUser.fullName = fullName || currentUser.fullName;
    currentUser.email = email || currentUser.email;
    currentUser.username = username || currentUser.username;
    currentUser.bio = bio || currentUser.bio;
    currentUser.link = link || currentUser.link;
    currentUser.profileImg = profileImg || currentUser.profileImg;
    currentUser.coverImg = coverImg || currentUser.coverImg;

    currentUser = await currentUser.save();

    currentUser.password = null;

    res.status(200).json(currentUser);
  } catch (error) {
    console.log("Error in updateUser controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
