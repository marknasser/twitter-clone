import express from "express";
import { connectDB } from "./config/db.js";

//3p libbraries
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

//Routers
import authRouter from "./routs/auth.routes.js";

dotenv.config(); //so the app can read .env file
const app = express();
const PORT = process.env.PORT || 5000;
app.use(express.json()); //this middleware allows us to accept jason data in the req.body
app.use(express.urlencoded());
app.use(cookieParser()); //to pars cookie object from body

app.use("/api/auth", authRouter);

app.listen(PORT, () => {
  //connect to DB
  connectDB();
  console.log(`server startt at http://localhost:${PORT}`);
});
