import express from "express"

import {
  getUserStats
} from "../controllers/dashboardController.js"

import {
  verifyToken
} from "../middleware/authMiddleware.js"

const router = express.Router()

router.get(
  "/user",
  verifyToken,
  getUserStats
)

export default router