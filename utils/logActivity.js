import db from "../config/db.js"

export const logActivity = (
  userId,
  activity
) => {

  // CEK DATA
  if (!userId || !activity) {

    console.log(
      "Activity log dilewati"
    )

    return

  }

  const q = `
    INSERT INTO activity_logs
    (
      user_id,
      activity
    )

    VALUES (?, ?)
  `

  db.query(
    q,
    [userId, activity],

    (err) => {

      // BIAR TIDAK CRASH SERVER
      if (err) {

        console.log(
          "Activity log error:"
        )

        console.log(err)

      }

    }
  )

}