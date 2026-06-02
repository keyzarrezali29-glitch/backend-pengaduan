import express from "express"

import {
  getLaporan,
  getLaporanById,
  getLaporanByUser,
  addLaporan,
  deleteLaporan,
  updateStatus,
  updateLaporan
} from "../controllers/laporanController.js"

import upload from "../middleware/upload.js"

import {
  verifyToken
} from "../middleware/authMiddleware.js"

const router = express.Router()

// GET ALL (admin only)
router.get("/", getLaporan)

// GET LAPORAN MILIK USER SENDIRI
router.get(
  "/my-reports",
  verifyToken,
  getLaporanByUser
)

// GET DETAIL
router.get("/:id", getLaporanById)

// CREATE
router.post(
  "/",
  verifyToken,
  upload.single("image"),
  addLaporan
)

// UPDATE LAPORAN
router.put(
  "/:id",
  verifyToken,
  upload.single("image"),
  updateLaporan
)

// UPDATE STATUS
router.put(
  "/status/:id",
  verifyToken,
  updateStatus
)

// DELETE
router.delete(
  "/:id",
  verifyToken,
  deleteLaporan
)

export default router