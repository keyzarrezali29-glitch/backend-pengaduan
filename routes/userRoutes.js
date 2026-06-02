import express from "express"

import {
  getUsers,
  getProfile,
  updateProfile,
  deleteUser,
  addAdmin
} from "../controllers/userController.js"

import {
  verifyToken
} from "../middleware/authMiddleware.js"

import upload from "../middleware/upload.js"

const router = express.Router()

// ======================
// GET USERS
// ======================

router.get(
  "/",
  verifyToken,
  getUsers
)

// ======================
// GET PROFILE
// ======================

router.get(
  "/profile",
  verifyToken,
  getProfile
)

// ======================
// UPDATE PROFILE
// ======================

router.put(
  "/profile",
  verifyToken,
  upload.single("photo"),
  updateProfile
)

// ======================
// ADD ADMIN
// ======================

router.post(
  "/admin",
  verifyToken,
  addAdmin
)

// ======================
// DELETE USER
// ======================

router.delete(
  "/:id",
  verifyToken,
  deleteUser
)

export default router