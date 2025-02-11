import mongoose, { Types } from "mongoose";

const postSchema = new mongoose.Schema(
  {
    text: String,
    img: String,
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    comments: [
      {
        text: { type: String, required: true },
        commenter: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

const Post = mongoose.model("Post", postSchema);
export default Post;
