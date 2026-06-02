import express from "express"

import {
  getComments,
  addComment,
  deleteComment
} from "../controllers/commentController.js"

import {
  verifyToken
} from "../middleware/authMiddleware.js"

const router = express.Router()

// GET COMMENTS
router.get(
  "/:laporan_id",
  getComments
)

// ADD COMMENT
router.post(
  "/",
  verifyToken,
  addComment
)

// DELETE COMMENT
router.delete(
  "/:id",
  verifyToken,
  deleteComment
)

export default router