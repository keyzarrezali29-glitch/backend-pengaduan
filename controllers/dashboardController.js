import  db  from "../config/db.js"

// ======================
// USER DASHBOARD STATS
// ======================

export const getUserStats = (req, res) => {

  const userId = req.user.id

  // ======================
  // STATS QUERY
  // ======================

  const statsQuery = `

    SELECT

      COUNT(*) as total,

      SUM(
        CASE
        WHEN status = 'pending'
        THEN 1 ELSE 0 END
      ) as pending,

      SUM(
        CASE
        WHEN status = 'approved'
        THEN 1 ELSE 0 END
      ) as approved,

      SUM(
        CASE
        WHEN status = 'rejected'
        THEN 1 ELSE 0 END
      ) as rejected

    FROM laporan

    WHERE user_id = ?

  `

  // ======================
  // RECENT REPORT QUERY
  // ======================

  const recentQuery = `

    SELECT *

    FROM laporan

    WHERE user_id = ?

    ORDER BY created_at DESC

    LIMIT 5

  `

  db.query(
    statsQuery,
    [userId],

    (err, statsData) => {

      if (err) {

        return res.status(500).json(err)

      }

      db.query(
        recentQuery,
        [userId],

        (err2, recentData) => {

          if (err2) {

            return res.status(500).json(err2)

          }

          res.json({

            stats: statsData[0],

            recentReports: recentData

          })

        }
      )

    }
  )

}