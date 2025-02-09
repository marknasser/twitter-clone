import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateTokenAndSetCookie } from "../lib/utils/generateToken.js";

export const signup = async (req, res) => {
  try {
    const { fullName, username, email, password } = req.body;

    //check for a valid emaild
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    //check for a uniqe username
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: "username is already taken" });
    }

    //check for a uniqe email
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ error: "Email is already taken" });
    }
    // check the pass validation before hashing
    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters long" });
    }
    // hash the passs
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName,
      username,
      email,
      password: hashedPassword,
    });

    if (newUser) {
      generateTokenAndSetCookie(newUser._id, res);
      await newUser.save();
      res.status(201).json({
        _id: newUser._id,
        email: newUser.email,
        username: newUser.username,
        fullName: newUser.fullName,
        followers: newUser.followers,
        following: newUser.following,
        profileImg: newUser.profileImg,
        coverImg: newUser.coverImg,
      });
    } else {
      res.status(400).json({ error: "Invalid user data" });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .send({ error: "username and password are required to login" });
    }
    // searsh for a given username
    const currentUser = await User.findOne({ username });
    if (!currentUser) {
      return res.status(400).send({ error: "username does not exist" });
    }

    //passwprd and copmapre
    const isPasswordCrorrect = await bcrypt.compare(
      password,
      currentUser.password
    );

    if (!isPasswordCrorrect) {
      return res.status(400).send({ error: "Invaild username or password" });
    }

    generateTokenAndSetCookie(currentUser._id, res);

    res.status(200).json({
      _id: currentUser._id,
      email: currentUser.email,
      username: currentUser.username,
      fullName: currentUser.fullName,
      followers: currentUser.followers,
      following: currentUser.following,
      profileImg: currentUser.profileImg,
      coverImg: currentUser.coverImg,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const logout = async (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 }); // Expire immediately
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getMe = async (req, res) => {
  try {
    const currentUser = await User.findById(req.currentUser._id).select(
      "-password"
    );
    res.status(200).json(currentUser);
  } catch (error) {
    console.log("Error in getMe controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
