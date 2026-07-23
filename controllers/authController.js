import db from "../config/db.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { logActivity } from "../utils/logActivity.js"

// ======================
// REGISTER
// ======================

export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body

    const [existingUser] = await db.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    )

    if (existingUser.length > 0) {
      return res.status(400).json({
        message: "Email sudah digunakan",
      })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const [result] = await db.query(
      `INSERT INTO users (name, email, password, role)
       VALUES (?, ?, ?, ?)`,
      [name, email, hashedPassword, role || "user"]
    )

    res.status(201).json({
      message: "Register berhasil",
    })

    logActivity(
      result.insertId,
      `${name} melakukan registrasi`
    ).catch(console.error)
  } catch (error) {
    console.error("REGISTER ERROR:", error)

    return res.status(500).json({
      message: "Terjadi kesalahan saat registrasi",
      error: error.message,
    })
  }
}

// ======================
// LOGIN
// ======================

export const login = async (req, res) => {
  try {
    const { email, password } = req.body

    const [result] = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    )

    if (result.length === 0) {
      return res.status(404).json({
        message: "User tidak ditemukan",
      })
    }

    const user = result[0]

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
      return res.status(400).json({
        message: "Password salah",
      })
    }

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    )

    const { password: userPassword, ...other } = user

    res.json({
      token,
      user: other,
    })

    logActivity(
      user.id,
      `${user.name} login ke sistem`
    ).catch(console.error)
  } catch (error) {
    console.error("LOGIN ERROR:", error)

    return res.status(500).json({
      message: "Terjadi kesalahan saat login",
      error: error.message,
    })
  }
}

// ======================
// UPDATE PROFILE
// ======================

export const updateProfile = async (req, res) => {
  try {
    const { name, password } = req.body

    let q = `
      UPDATE users
      SET name = ?
    `

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

    q += `
      WHERE id = ?
    `

    values.push(req.user.id)

    await db.query(q, values)

    // ACTIVITY UPDATE PROFILE
    logActivity(
      req.user.id,
      `Mengupdate profile`
    ).catch(console.error)

    // AMBIL USER BARU
    const [data] = await db.query(
      `
      SELECT
        id,
        name,
        email,
        role,
        photo
      FROM users

      WHERE id = ?
      `,
      [req.user.id]
    )

    res.json({
      message: "Profile berhasil diupdate",
      user: data[0],
    })
  } catch (err) {
    console.error("UPDATE PROFILE ERROR:", err)

    return res.status(500).json({
      message: "Gagal update profile",
    })
  }
}