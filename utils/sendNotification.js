import db from "../config/db.js"

export const sendNotification = (
  user_id,
  title,
  message,
  type = "general",
  report_id = null
) => {

  const q = `
    INSERT INTO notifications
    (
      user_id,
      title,
      message,
      type,
      report_id
    )

    VALUES (?, ?, ?, ?, ?)
  `

  db.query(
    q,
    [
      user_id,
      title,
      message,
      type,
      report_id
    ]
  )

}