import { db } from "../config/db.js"

// GET
export const getCategories = (req, res) => {

  const q = `
    SELECT *
    FROM categories
    ORDER BY id DESC
  `

  db.query(q, (err, data) => {

    if (err)
      return res.status(500).json(err)

    res.json(data)

  })

}

// ADD
export const addCategory = (req, res) => {

  const { name } = req.body

  const q = `
    INSERT INTO categories (name)
    VALUES (?)
  `

  db.query(q, [name], (err) => {

    if (err)
      return res.status(500).json(err)

    res.json({
      message:
      "Kategori berhasil ditambahkan"
    })

  })

}

// UPDATE
export const updateCategory = (req, res) => {

  const { name } = req.body

  const q = `
    UPDATE categories
    SET name = ?
    WHERE id = ?
  `

  db.query(
    q,
    [name, req.params.id],
    (err) => {

      if (err)
        return res.status(500).json(err)

      res.json({
        message:
        "Kategori berhasil diupdate"
      })

    }
  )

}

// DELETE
export const deleteCategory = (req, res) => {

  const q = `
    DELETE FROM categories
    WHERE id = ?
  `

  db.query(
    q,
    [req.params.id],
    (err) => {

      if (err)
        return res.status(500).json(err)

      res.json({
        message:
        "Kategori berhasil dihapus"
      })

    }
  )

}