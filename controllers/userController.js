import { db } from "../config/db.js"
import bcrypt from "bcryptjs"
import { logActivity } from "../utils/logActivity.js"

// ======================
// GET USERS
// ======================

export const getUsers = (req, res) => {

  const q = `
    SELECT
      id,
      name,
      email,
      role,
      photo,
      created_at
    FROM users

    ORDER BY created_at DESC
  `

  db.query(q, (err, data) => {

    if (err) {

      console.log(err)

      return res.status(500).json(err)

    }

    res.json(data)

  })

}

// ======================
// GET PROFILE
// ======================

export const getProfile = (
  req,
  res
) => {

  const q = `
    SELECT
      id,
      name,
      email,
      role,
      photo
    FROM users

    WHERE id = ?
  `

  db.query(
    q,
    [req.user.id],

    (err, data) => {

      if (err) {

        console.log(err)

        return res.status(500).json(err)

      }

      res.json(data[0])

    }
  )

}

// ======================
// UPDATE PROFILE
// ======================

export const updateProfile = (
  req,
  res
) => {

  const {
    name,
    password
  } = req.body

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
          message:
            "Gagal update profile"
        })

      }

      // ACTIVITY
      try {

        logActivity(
          req.user.id,
          "Mengupdate profile"
        )

      } catch (e) {

        console.log(e)

      }

      res.json({
        message:
          "Profile berhasil diupdate"
      })

    }
  )

}

// ======================
// TAMBAH ADMIN
// ======================

export const addAdmin = async (
  req,
  res
) => {

  try {

    const {
      name,
      email,
      password
    } = req.body

    const hashedPassword =
      await bcrypt.hash(password, 10)

    const q = `
      INSERT INTO users
      (
        name,
        email,
        password,
        role
      )

      VALUES (?, ?, ?, ?)
    `

    db.query(
      q,
      [
        name,
        email,
        hashedPassword,
        "admin"
      ],

      (err) => {

        if (err) {

          console.log(err)

          return res.status(500).json(err)

        }

        try {

          logActivity(
            req.user.id,
            `Menambahkan admin baru: ${name}`
          )

        } catch (e) {

          console.log(e)

        }

        res.json({
          message:
            "Admin berhasil ditambahkan"
        })

      }
    )

  } catch (err) {

    console.log(err)

    res.status(500).json(err)

  }

}

// ======================
// DELETE USER
// ======================

export const deleteUser = (
  req,
  res
) => {

  db.query(
    `
    SELECT name
    FROM users
    WHERE id = ?
    `,
    [req.params.id],

    (errUser, userData) => {

      if (errUser) {

        console.log(errUser)

        return res.status(500).json(errUser)

      }

      const deletedUser =
        userData[0]?.name || "User"

      const q = `
        DELETE FROM users
        WHERE id = ?
      `

      db.query(
        q,
        [req.params.id],

        (err) => {

          if (err) {

            console.log(err)

            return res.status(500).json(err)

          }

          try {

            logActivity(
              req.user.id,
              `Menghapus user: ${deletedUser}`
            )

          } catch (e) {

            console.log(e)

          }

          res.json({
            message:
              "User berhasil dihapus"
          })

        }
      )

    }
  )

}