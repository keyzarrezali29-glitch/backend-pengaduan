import { db } from "../config/db.js"

// ======================
// GET NOTIFICATIONS
// ======================

export const getNotifications = (
  req,
  res
) => {

  const q = `
    SELECT *
    FROM notifications

    WHERE user_id = ?

    ORDER BY created_at DESC
  `

  db.query(
    q,
    [req.user.id],

    (err, data) => {

      if (err)
        return res.status(500).json(err)

      res.json(data)

    }
  )

}

// ======================
// MARK AS READ
// ======================

export const readNotification = (
  req,
  res
) => {

  const q = `
    UPDATE notifications
    SET is_read = 1
    WHERE id = ?
  `

  db.query(
    q,
    [req.params.id],

    (err) => {

      if (err)
        return res.status(500).json(err)

      res.json({
        message:
          "Notif dibaca"
      })

    }
  )

}