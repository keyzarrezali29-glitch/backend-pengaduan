import db from "../config/db.js"

export const logActivity = async (userId, activity) => {
  // CEK DATA
  if (!userId || !activity) {
    console.log("Activity log dilewati")
    return
  }

  try {
    const q = `
      INSERT INTO activity_logs
      (user_id, activity)
      VALUES (?, ?)
    `

    await db.query(q, [userId, activity])
  } catch (err) {
    // BIAR TIDAK CRASH SERVER
    console.log("Activity log error:")
    console.log(err)
  }
}