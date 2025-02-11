import express from "express";
import {
  deleteNotifications,
  getNotifications,
} from "../controllers/notification.controller.js";
import { protectRoute } from "../middleware/protectRoute.js";

const router = express.Router();

router.use(protectRoute);
router.route("/").get(getNotifications).delete(deleteNotifications);

export default router;
