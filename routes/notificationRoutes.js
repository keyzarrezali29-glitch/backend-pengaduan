import express from "express"

import {
  getNotifications,
  readNotification
} from "../controllers/notificationController.js"

import {
  verifyToken
} from "../middleware/authMiddleware.js"

const router = express.Router()

// GET
router.get(
  "/",
  verifyToken,
  getNotifications
)

// READ
router.put(
  "/:id",
  verifyToken,
  readNotification
)

export default router