import db from "../config/db.js"
import { createNotification } from "../utils/createNotification.js"

// ======================
// GET COMMENTS
// ======================

export const getComments = async (req, res) => {
  try {
    const q = `
      SELECT comments.*, users.name, users.role
      FROM comments
      JOIN users ON comments.user_id = users.id
      WHERE laporan_id = ?
      ORDER BY comments.created_at ASC
    `

    const [data] = await db.query(q, [req.params.laporan_id])
    res.json(data)
  } catch (err) {
    console.log(err)
    return res.status(500).json(err)
  }
}

// ======================
// ADD COMMENT
// ======================

export const addComment = async (req, res) => {
  try {
    const { laporan_id, comment, parent_id } = req.body

    // VALIDASI
    if (!laporan_id || !comment) {
      return res.status(400).json({ message: "Data komentar tidak lengkap" })
    }

    // VALIDASI USER
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "User belum login" })
    }

    const q = `
      INSERT INTO comments (laporan_id, user_id, comment, parent_id)
      VALUES (?, ?, ?, ?)
    `

    await db.query(q, [laporan_id, req.user.id, comment, parent_id || null])

    // ======================
    // GET OWNER LAPORAN
    // ======================

    const [lapData] = await db.query(`SELECT * FROM laporan WHERE id = ?`, [laporan_id])

    if (lapData.length > 0) {
      const laporan = lapData[0]

      // JANGAN KIRIM KE DIRI SENDIRI
      if (Number(laporan.user_id) !== Number(req.user.id)) {
        const [userData] = await db.query(`SELECT name FROM users WHERE id = ?`, [req.user.id])
        const senderName = userData.length > 0 ? userData[0].name : "Seseorang"

        createNotification(
          laporan.user_id,
          "Komentar Baru",
          `${senderName} mengomentari laporan kamu`,
          "comment",
          laporan_id
        )
      }
    }

    res.json({ message: "Komentar berhasil ditambahkan" })
  } catch (err) {
    console.log(err)
    return res.status(500).json(err)
  }
}

// ======================
// DELETE COMMENT
// ======================

export const deleteComment = async (req, res) => {
  try {
    const [data] = await db.query(`SELECT * FROM comments WHERE id = ?`, [req.params.id])

    if (data.length === 0) {
      return res.status(404).json({ message: "Komentar tidak ditemukan" })
    }

    const comment = data[0]

    // VALIDASI AKSES
    if (Number(comment.user_id) !== Number(req.user.id)) {
      return res.status(403).json({ message: "Tidak punya akses" })
    }

    await db.query(`DELETE FROM comments WHERE id = ?`, [req.params.id])

    res.json({ message: "Komentar berhasil dihapus" })
  } catch (err) {
    console.log(err)
    return res.status(500).json(err)
  }
}