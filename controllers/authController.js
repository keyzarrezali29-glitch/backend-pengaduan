import db from "../config/db.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { logActivity } from "../utils/logActivity.js"

// ======================
// REGISTER
// ======================

export const register = (req, res) => {

  const {
    name,
    email,
    password,
    role
  } = req.body

  db.query(
    "SELECT * FROM users WHERE email = ?",
    [email],

    (err, result) => {

      if (err)
        return res.status(500).json(err)

      if (result.length > 0) {

        return res.status(400).json({
          message: "Email sudah digunakan",
        })

      }

      const hashedPassword =
        bcrypt.hashSync(password, 10)

      db.query(
        `
        INSERT INTO users
        (
          name,
          email,
          password,
          role
        )

        VALUES (?, ?, ?, ?)
        `,

        [
          name,
          email,
          hashedPassword,
          role || "user",
        ],

        (err, data) => {

          if (err)
            return res.status(500).json(err)

          // ACTIVITY REGISTER
          logActivity(
            data.insertId,
            `${name} melakukan registrasi`
          )

          res.json({
            message: "Register berhasil",
          })

        }
      )

    }
  )

}

// ======================
// LOGIN
// ======================

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const [result] = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (result.length === 0) {
      return res.status(404).json({
        message: "User tidak ditemukan",
      });
    }

    const user = result[0];

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        message: "Password salah",
      });
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
    );

    const {
      password: userPassword,
      ...other
    } = user;

    res.json({
      token,
      user: other,
    });

    logActivity(
      user.id,
      `${user.name} login ke sistem`
    ).catch(console.error);
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    return res.status(500).json({
      message: "Terjadi kesalahan saat login",
      error: error.message,
    });
  }
};

// ======================
// UPDATE PROFILE
// ======================

export const updateProfile = (req, res) => {

  const { name, password } = req.body

  let q = `
    UPDATE users
    SET name = ?
  `

  let values = [name]

  // PASSWORD
  if (password && password !== "") {

    const hashedPassword =
      bcrypt.hashSync(password, 10)

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

  db.query(
    q,
    values,

    (err) => {

      if (err) {

        console.log(err)

        return res.status(500).json({
          message: "Gagal update profile"
        })

      }

      // ACTIVITY UPDATE PROFILE
      logActivity(
        req.user.id,
        `Mengupdate profile`
      )

      // AMBIL USER BARU
      db.query(
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
        [req.user.id],

        (err, data) => {

          if (err)
            return res.status(500).json(err)

          res.json({
            message:
              "Profile berhasil diupdate",

            user: data[0]
          })

        }
      )

    }
  )

}