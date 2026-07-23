import db from "../config/db.js"

// ======================
// GET ACTIVITIES
// ======================

export const getActivities = (
  req,
  res
) => {

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

  db.query(q, (err, data) => {

    if (err)
      return res.status(500).json(err)

    res.json(data)

  })

}