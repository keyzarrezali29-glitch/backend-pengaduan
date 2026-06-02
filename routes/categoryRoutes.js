import express from "express"

import {
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory
} from "../controllers/categoryController.js"

const router = express.Router()

// GET
router.get("/", getCategories)

// ADD
router.post("/", addCategory)

// UPDATE
router.put("/:id", updateCategory)

// DELETE
router.delete("/:id", deleteCategory)

export default router