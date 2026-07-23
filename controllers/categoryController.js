import db from "../config/db.js"

// GET
export const getCategories = async (req, res) => {
  try {
    const q = `
      SELECT *
      FROM categories
      ORDER BY id DESC
    `

    const [data] = await db.query(q)

    res.json(data)
  } catch (err) {
    console.error("GET CATEGORIES ERROR:", err)
    return res.status(500).json(err)
  }
}

// ADD
export const addCategory = async (req, res) => {
  try {
    const { name } = req.body

    const q = `
      INSERT INTO categories (name)
      VALUES (?)
    `

    await db.query(q, [name])

    res.json({
      message: "Kategori berhasil ditambahkan",
    })
  } catch (err) {
    console.error("ADD CATEGORY ERROR:", err)
    return res.status(500).json(err)
  }
}

// UPDATE
export const updateCategory = async (req, res) => {
  try {
    const { name } = req.body

    const q = `
      UPDATE categories
      SET name = ?
      WHERE id = ?
    `

    await db.query(q, [name, req.params.id])

    res.json({
      message: "Kategori berhasil diupdate",
    })
  } catch (err) {
    console.error("UPDATE CATEGORY ERROR:", err)
    return res.status(500).json(err)
  }
}

// DELETE
export const deleteCategory = async (req, res) => {
  try {
    const q = `
      DELETE FROM categories
      WHERE id = ?
    `

    await db.query(q, [req.params.id])

    res.json({
      message: "Kategori berhasil dihapus",
    })
  } catch (err) {
    console.error("DELETE CATEGORY ERROR:", err)
    return res.status(500).json(err)
  }
}