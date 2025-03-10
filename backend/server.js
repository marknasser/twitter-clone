import path from "path";
import express from "express";
import { connectDB } from "./config/db.js";

//3p libbraries
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { v2 as cloudinary } from "cloudinary";

//Routers
import authRouter from "./routs/auth.routes.js";
import userRouter from "./routs/user.routes.js";
import postRouter from "./routs/post.routes.js";
import notificationRouter from "./routs/notification.routes.js";

dotenv.config(); //so the app can read .env file
const app = express();
const PORT = process.env.PORT || 5000;
const __dirname = path.resolve();

//limit should not be to big to prevent DOS
app.use(express.json({ limit: "5mb" })); //this middleware allows us to accept jason data in the req.body
app.use(express.urlencoded());
app.use(cookieParser()); //to pars cookie object from body

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/posts", postRouter);
app.use("/api/notifications", notificationRouter);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "/frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
  });
}

app.listen(PORT, () => {
  //connect to DB
  connectDB();
  console.log(`server startt at http://localhost:${PORT}`);
});
