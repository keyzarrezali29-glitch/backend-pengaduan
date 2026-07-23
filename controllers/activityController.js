import db from "../config/db.js"

// ======================
// GET ACTIVITIES
// ======================

export const getActivities = async (req, res) => {
  try {
    const q = `
      SELECT
        activity_logs.*,
        users.name,
        users.role

      FROM activity_logs

      JOIN users
      ON activity_logs.user_id = users.id

      ORDER BY activity_logs.created_at DESC

      LIMIT 20
    `

    const [data] = await db.query(q)

    res.json(data)
  } catch (err) {
    console.error("GET ACTIVITIES ERROR:", err)
    return res.status(500).json(err)
  }
}