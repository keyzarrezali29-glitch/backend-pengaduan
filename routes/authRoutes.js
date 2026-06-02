import express from "express"

import {
  register,
  login,
  updateProfile
} from "../controllers/authController.js"

import {
  verifyToken
} from "../middleware/authMiddleware.js"

import upload from "../middleware/upload.js"

const router = express.Router()

router.post("/register", register)

router.post("/login", login)

router.put(
  "/profile",
  verifyToken,
  upload.single("photo"),
  updateProfile
)

export default router