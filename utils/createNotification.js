import db from "../config/db.js"

export const createNotification = async (
  user_id,
  title,
  message,
  type = "general",
  laporan_id = null
) => {
  try {
    const q = `
      INSERT INTO notifications
      (user_id, title, message, type, laporan_id)
      VALUES (?, ?, ?, ?, ?)
    `

    await db.query(q, [user_id, title, message, type, laporan_id])
  } catch (err) {
    console.log("ERROR CREATE NOTIFICATION:", err)
  }
}