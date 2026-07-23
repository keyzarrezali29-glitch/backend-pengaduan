import db from "../config/db.js"

// ======================
// USER DASHBOARD STATS
// ======================

export const getUserStats = async (req, res) => {
  try {
    const userId = req.user.id

    const statsQuery = `
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected
      FROM laporan
      WHERE user_id = ?
    `

    const recentQuery = `
      SELECT *
      FROM laporan
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 5
    `

    const [statsData] = await db.query(statsQuery, [userId])
    const [recentData] = await db.query(recentQuery, [userId])

    res.json({
      stats: statsData[0],
      recentReports: recentData,
    })
  } catch (err) {
    console.log(err)
    return res.status(500).json(err)
  }
}