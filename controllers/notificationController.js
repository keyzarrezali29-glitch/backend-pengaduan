import db from "../config/db.js"

// ======================
// GET NOTIFICATIONS
// ======================

export const getNotifications = async (req, res) => {
  try {
    const q = `
      SELECT *
      FROM notifications
      WHERE user_id = ?
      ORDER BY created_at DESC
    `

    const [data] = await db.query(q, [req.user.id])
    res.json(data)
  } catch (err) {
    console.log(err)
    return res.status(500).json(err)
  }
}

// ======================
// MARK AS READ
// ======================

export const readNotification = async (req, res) => {
  try {
    const q = `
      UPDATE notifications
      SET is_read = 1
      WHERE id = ?
    `

    await db.query(q, [req.params.id])
    res.json({ message: "Notif dibaca" })
  } catch (err) {
    console.log(err)
    return res.status(500).json(err)
  }
}