import db from "../config/db.js"

export const createNotification = (
  user_id,
  title,
  message,
  type = "general",
  laporan_id = null
) => {

  const q = `
    INSERT INTO notifications
    (
      user_id,
      title,
      message,
      type,
      laporan_id
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
      laporan_id
    ],

    (err) => {

      if (err) {

        console.log(
          "ERROR CREATE NOTIFICATION:",
          err
        )

      }

    }
  )

}