import db from "../config/db.js"
import bcrypt from "bcryptjs"
import { logActivity } from "../utils/logActivity.js"

// ======================
// GET USERS
// ======================

export const getUsers = async (req, res) => {
  try {
    const q = `
      SELECT id, name, email, role, photo, created_at
      FROM users
      ORDER BY created_at DESC
    `

    const [data] = await db.query(q)
    res.json(data)
  } catch (err) {
    console.log(err)
    return res.status(500).json(err)
  }
}

// ======================
// GET PROFILE
// ======================

export const getProfile = async (req, res) => {
  try {
    const q = `
      SELECT id, name, email, role, photo
      FROM users
      WHERE id = ?
    `

    const [data] = await db.query(q, [req.user.id])
    res.json(data[0])
  } catch (err) {
    console.log(err)
    return res.status(500).json(err)
  }
}

// ======================
// UPDATE PROFILE
// ======================

export const updateProfile = async (req, res) => {
  try {
    const { name, password } = req.body

    let q = `UPDATE users SET name = ?`
    let values = [name]

    // PASSWORD
    if (password && password !== "") {
      const hashedPassword = await bcrypt.hash(password, 10)
      q += `, password = ?`
      values.push(hashedPassword)
    }

    // PHOTO
    if (req.file) {
      q += `, photo = ?`
      values.push(req.file.filename)
    }

    q += ` WHERE id = ?`
    values.push(req.user.id)

    await db.query(q, values)

    // ACTIVITY
    try {
      logActivity(req.user.id, "Mengupdate profile")
    } catch (e) {
      console.log(e)
    }

    res.json({ message: "Profile berhasil diupdate" })
  } catch (err) {
    console.log(err)
    return res.status(500).json({ message: "Gagal update profile" })
  }
}

// ======================
// TAMBAH ADMIN
// ======================

export const addAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body

    const hashedPassword = await bcrypt.hash(password, 10)

    const q = `
      INSERT INTO users (name, email, password, role)
      VALUES (?, ?, ?, ?)
    `

    await db.query(q, [name, email, hashedPassword, "admin"])

    try {
      logActivity(req.user.id, `Menambahkan admin baru: ${name}`)
    } catch (e) {
      console.log(e)
    }

    res.json({ message: "Admin berhasil ditambahkan" })
  } catch (err) {
    console.log(err)
    res.status(500).json(err)
  }
}

// ======================
// DELETE USER
// ======================

export const deleteUser = async (req, res) => {
  try {
    const [userData] = await db.query(`SELECT name FROM users WHERE id = ?`, [req.params.id])
    const deletedUser = userData[0]?.name || "User"

    await db.query(`DELETE FROM users WHERE id = ?`, [req.params.id])

    try {
      logActivity(req.user.id, `Menghapus user: ${deletedUser}`)
    } catch (e) {
      console.log(e)
    }

    res.json({ message: "User berhasil dihapus" })
  } catch (err) {
    console.log(err)
    return res.status(500).json(err)
  }
}