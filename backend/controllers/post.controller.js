import Post from "../models/post.model.js";
import Notification from "../models/notification.model.js";
import { v2 as cloudinary } from "cloudinary";
import User from "../models/user.model.js";
import mongoose from "mongoose";

export const createPost = async (req, res) => {
  const { img, text } = req.body;
  const { currentUser } = req;

  try {
    if (!text && !img) {
      return res.status(400).json({ error: "post must have any content" });
    }

    if (img) {
      const uploadedResponse = await cloudinary.uploader.upload(img);
      img = uploadedResponse.secure_url;
    }

    const newPost = new Post({
      text,
      img,
      owner: currentUser._id,
    });

    await newPost.save();

    res.status(201).json(newPost);
  } catch (error) {
    console.log("Error in createPost controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const deletePost = async (req, res) => {
  const { id } = req.params;
  const { currentUser } = req;

  const postTobeDeleted = await Post.findById(id);
  if (!postTobeDeleted)
    return res.status(400).json({ error: "post not found" });

  if (currentUser._id.toString() !== postTobeDeleted.owner.toString()) {
    return res
      .status(400)
      .json({ error: "You are not authorized to delete this post" });
  }

  if (postTobeDeleted.img) {
    const imgId = postTobeDeleted.img.split("/").pop().split(".")[0];
    await cloudinary.uploader.destroy(imgId);
  }

  await postTobeDeleted.deleteOne();
  res.status(200).json({ message: "Post deleted successfully" });
  try {
  } catch (error) {
    console.log("Error in deletePost controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const commentOnPost = async (req, res) => {
  try {
    const { currentUser } = req;
    const { text } = req.body;
    const { id } = req.params;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: "comment must have a content" });
    }

    const thePost = await Post.findById(id);
    if (!thePost) {
      return res.status(404).json({ error: "Post not found" });
    }

    thePost.comments.push({ text, commenter: currentUser._id });

    await thePost.save();

    res.status(200).json(thePost);
  } catch (error) {
    console.log("Error in commentOnPost controller: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const likeUnlikePost = async (req, res) => {
  try {
    const { currentUser } = req;
    const { id } = req.params;

    const thePost = await Post.findById(id);

    if (!thePost) {
      return res.status(404).json({ error: "Post not found" });
    }

    const isTheUserLikedThePost = thePost.likes.includes(
      currentUser._id.toString()
    );
    if (isTheUserLikedThePost) {
      //Unlike
      thePost.likes.pull(currentUser._id);
      currentUser.likedPosts.pull(thePost._d);
    } else {
      //Like
      thePost.likes.push(currentUser._id);
      currentUser.likedPosts.push(thePost._id);

      const notification = new Notification({
        from: currentUser._id,
        to: thePost.owner,
        type: "like",
      });
      await notification.save();
    }
    await currentUser.save();
    await thePost.save();

    res.status(200).json({
      message: isTheUserLikedThePost ? "Post unliked" : "Post liked",
      data: thePost,
    });
  } catch (error) {
    console.log("Error in likeUnlikePost controller: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getAllPosts = async (req, res) => {
  try {
    const allposts = await Post.find()
      .sort({ createdAt: -1 })
      .populate({
        path: "owner",
        select: "-password",
      })
      .populate({
        path: "comments.commenter",
        select: "-password",
      });

    if (allposts.length === 0) {
      return res.status(200).json([]);
    }

    res.status(200).json(allposts);
  } catch (error) {
    console.log("Error in getAllPosts controller: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getLikedPosts = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if the provided ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const user = await User.findById(id).populate({
      path: "likedPosts",
      select: "-password",
      populate: [
        {
          path: "likes",
          select: "username fullName profileImg",
        },
        {
          path: "owner",
          select: "username fullName profileImg",
        },
        {
          path: "comments.commenter",
          select: "username fullName profileImg",
        },
      ],
    });

    if (!user) return res.status(404).json({ error: "User not found" });

    res.status(200).json(user.likedPosts);
  } catch (error) {
    console.log("Error in getAllPosts controller: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getFollowingPosts = async (req, res) => {
  try {
    const { currentUser } = req;
    const postsOftheFollowins = await Post.find({
      owner: { $in: currentUser.following },
    })
      .sort({ createdAt: -1 })
      .populate({
        path: "owner",
        select: "-password",
      })
      .populate({
        path: "comments.commenter",
        select: "-password",
      });

    res.status(200).json(postsOftheFollowins);
  } catch (error) {
    console.log("Error in getFollowingPosts controller: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getUserPosts = async (req, res) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ error: "User not found" });

    const userPosts = await Post.find({ owner: user._id })
      .sort({ createdAt: -1 })
      .populate({
        path: "owner",
        select: "-password",
      })
      .populate({
        path: "comments.commenter",
        select: "-password",
      });
    console.log(user);
    console.log(userPosts);
    res.status(200).json(userPosts);
  } catch (error) {
    console.log("Error in getUserPosts controller: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
