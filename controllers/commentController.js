import  db  from "../config/db.js"
import { createNotification } from "../utils/createNotification.js"

// ======================
// GET COMMENTS
// ======================

export const getComments = (req, res) => {

  const q = `
    SELECT
      comments.*,
      users.name,
      users.role
    FROM comments

    JOIN users
    ON comments.user_id = users.id

    WHERE laporan_id = ?

    ORDER BY comments.created_at ASC
  `

  db.query(
    q,
    [req.params.laporan_id],

    (err, data) => {

      if (err) {

        console.log(err)

        return res.status(500).json(err)

      }

      res.json(data)

    }
  )

}

// ======================
// ADD COMMENT
// ======================

export const addComment = (req, res) => {

  const {
    laporan_id,
    comment,
    parent_id
  } = req.body

  // VALIDASI
  if (!laporan_id || !comment) {

    return res.status(400).json({
      message: "Data komentar tidak lengkap"
    })

  }

  // VALIDASI USER
  if (!req.user || !req.user.id) {

    return res.status(401).json({
      message: "User belum login"
    })

  }

  const q = `
    INSERT INTO comments
    (
      laporan_id,
      user_id,
      comment,
      parent_id
    )

    VALUES (?, ?, ?, ?)
  `

  db.query(
    q,
    [
      laporan_id,
      req.user.id,
      comment,
      parent_id || null
    ],

    (err, data) => {

      if (err) {

        console.log(err)

        return res.status(500).json(err)

      }

      // ======================
      // GET OWNER LAPORAN
      // ======================

      db.query(
        `
        SELECT *
        FROM laporan
        WHERE id = ?
        `,
        [laporan_id],

        (errLap, lapData) => {

          if (!errLap && lapData.length > 0) {

            const laporan = lapData[0]

            // JANGAN KIRIM KE DIRI SENDIRI
if (
  Number(laporan.user_id)
  !==
  Number(req.user.id)
) {

  db.query(
    `
    SELECT name
    FROM users
    WHERE id = ?
    `,
    [req.user.id],

    (errUser, userData) => {

      let senderName = "Seseorang"

      if (
        !errUser &&
        userData.length > 0
      ) {

        senderName =
          userData[0].name

      }

      createNotification(
        laporan.user_id,
        "Komentar Baru",
        `${senderName} mengomentari laporan kamu`,
        "comment",
        laporan_id
      )

    }
  )

}

          }

        }
      )

      res.json({
        message:
          "Komentar berhasil ditambahkan"
      })

    }
  )

}

// ======================
// DELETE COMMENT
// ======================

export const deleteComment = (
  req,
  res
) => {

  const checkQuery = `
    SELECT *
    FROM comments
    WHERE id = ?
  `

  db.query(
    checkQuery,
    [req.params.id],

    (err, data) => {

      if (err) {

        console.log(err)

        return res.status(500).json(err)

      }

      if (data.length === 0) {

        return res.status(404).json({
          message:
            "Komentar tidak ditemukan"
        })

      }

      const comment = data[0]

      // VALIDASI AKSES
      if (
        Number(comment.user_id)
        !==
        Number(req.user.id)
      ) {

        return res.status(403).json({
          message:
            "Tidak punya akses"
        })

      }

      // DELETE COMMENT
      const deleteQuery = `
        DELETE FROM comments
        WHERE id = ?
      `

      db.query(
        deleteQuery,
        [req.params.id],

        (err) => {

          if (err) {

            console.log(err)

            return res.status(500).json(err)

          }

          res.json({
            message:
              "Komentar berhasil dihapus"
          })

        }
      )

    }
  )

}