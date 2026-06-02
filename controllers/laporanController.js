import { db } from "../config/db.js"
import { logActivity } from "../utils/logActivity.js"
import { createNotification } from "../utils/createNotification.js"

// ======================
// GET SEMUA LAPORAN
// ======================

export const getLaporan = (req, res) => {

  const search = req.query.search || ""

  const q = `
    SELECT
      laporan.*,
      users.name,
      categories.name AS category_name
    FROM laporan
    JOIN users ON laporan.user_id = users.id
    LEFT JOIN categories ON laporan.category_id = categories.id
    WHERE laporan.title LIKE ?
    ORDER BY laporan.created_at DESC
  `

  db.query(q, [`%${search}%`], (err, data) => {
    if (err) { console.log(err); return res.status(500).json(err) }
    res.json(data)
  })
}

// ======================
// GET DETAIL LAPORAN
// ======================

export const getLaporanById = (req, res) => {

  const q = `
    SELECT
      laporan.*,
      users.name,
      categories.name AS category_name
    FROM laporan
    JOIN users ON laporan.user_id = users.id
    LEFT JOIN categories ON laporan.category_id = categories.id
    WHERE laporan.id = ?
  `

  db.query(q, [req.params.id], (err, data) => {
    if (err) { console.log(err); return res.status(500).json(err) }
    res.json(data[0])
  })
}

// ======================
// GET LAPORAN BY USER
// ======================

export const getLaporanByUser = (req, res) => {

  const q = `
    SELECT
      laporan.*,
      users.name,
      categories.name AS category_name
    FROM laporan
    JOIN users ON laporan.user_id = users.id
    LEFT JOIN categories ON laporan.category_id = categories.id
    WHERE laporan.user_id = ?
    ORDER BY laporan.created_at DESC
  `

  db.query(q, [req.user.id], (err, data) => {
    if (err) { console.log(err); return res.status(500).json(err) }
    res.json(data)
  })
}

// ======================
// TAMBAH LAPORAN
// ======================

export const addLaporan = (req, res) => {

  const { title, description, category_id, location } = req.body

  if (!title || !description || !category_id) {
    return res.status(400).json({ message: "Data belum lengkap" })
  }

  const image = req.file ? req.file.filename : null

  const q = `
    INSERT INTO laporan (user_id, category_id, title, description, image, location)
    VALUES (?, ?, ?, ?, ?, ?)
  `

  db.query(q, [req.user.id, Number(category_id), title, description, image, location || null], (err, result) => {
    if (err) {
      console.log(err)
      return res.status(500).json({ message: "Gagal membuat laporan", error: err })
    }

    try { logActivity(req.user.id, `Membuat laporan: ${title}`) } catch (e) { console.log(e) }

    db.query(`SELECT name FROM users WHERE id = ?`, [req.user.id], (errU, userData) => {
      const userName = userData?.[0]?.name || "User"
      db.query(`SELECT * FROM users WHERE role = 'admin'`, (err2, admins) => {
        if (!err2) {
          admins.forEach((admin) => {
            createNotification(admin.id, "Laporan Baru", `${userName} membuat laporan baru`, "laporan", result.insertId)
          })
        }
      })
    })

    res.json({ message: "Laporan berhasil dibuat", laporan_id: result.insertId })
  })
}

// ======================
// DELETE LAPORAN
// ======================

export const deleteLaporan = (req, res) => {

  // CEK KEPEMILIKAN
  db.query(`SELECT * FROM laporan WHERE id = ?`, [req.params.id], (err, data) => {
    if (err) { return res.status(500).json(err) }
    if (!data[0]) { return res.status(404).json({ message: "Laporan tidak ditemukan" }) }

    const laporan = data[0]
    const isOwner = laporan.user_id === req.user.id
    const isAdmin = req.user.role === "admin" || req.user.role === "super_admin"

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Tidak diizinkan menghapus laporan ini" })
    }

    db.query(`DELETE FROM laporan WHERE id = ?`, [req.params.id], (err2) => {
      if (err2) { console.log(err2); return res.status(500).json(err2) }

      try { logActivity(req.user.id, `Menghapus laporan`) } catch (e) { console.log(e) }

      res.json({ message: "Laporan berhasil dihapus" })
    })
  })
}

// ======================
// UPDATE STATUS
// ======================

export const updateStatus = (req, res) => {

  const { status, response } = req.body

  const q = `UPDATE laporan SET status = ?, response = ? WHERE id = ?`

  db.query(q, [status, response, req.params.id], (err) => {
    if (err) { console.log(err); return res.status(500).json(err) }

    db.query(`SELECT * FROM laporan WHERE id = ?`, [req.params.id], (err2, laporanData) => {
      if (err2) { console.log(err2); return res.status(500).json(err2) }

      const laporan = laporanData[0]

      try {
        logActivity(req.user.id, `Mengubah status laporan "${laporan.title}" menjadi ${status}`)
      } catch (e) { console.log(e) }

      createNotification(laporan.user_id, "Status Laporan", `Laporan kamu diupdate menjadi ${status}`, "status", laporan.id)

      res.json({ message: "Laporan berhasil diupdate" })
    })
  })
}

// ======================
// UPDATE LAPORAN
// ======================

export const updateLaporan = (req, res) => {

  // CEK KEPEMILIKAN
  db.query(`SELECT * FROM laporan WHERE id = ?`, [req.params.id], (errCheck, dataCheck) => {
    if (errCheck) { return res.status(500).json(errCheck) }
    if (!dataCheck[0]) { return res.status(404).json({ message: "Laporan tidak ditemukan" }) }

    const laporan = dataCheck[0]
    const isOwner = laporan.user_id === req.user.id
    const isAdmin = req.user.role === "admin" || req.user.role === "super_admin"

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Tidak diizinkan mengubah laporan ini" })
    }

    const { title, description, category_id, location } = req.body

    let q = `UPDATE laporan SET title = ?, description = ?, category_id = ?, location = ?`
    let values = [title, description, category_id, location]

    if (req.file) {
      q += `, image = ?`
      values.push(req.file.filename)
    }

    q += ` WHERE id = ?`
    values.push(req.params.id)

    db.query(q, values, (err) => {
      if (err) { console.log(err); return res.status(500).json(err) }

      try { logActivity(req.user.id, `Mengupdate laporan`) } catch (e) { console.log(e) }

      res.json({ message: "Laporan berhasil diupdate" })
    })
  })
}

// ======================
// DASHBOARD STATS
// ======================

export const getDashboardStats = (req, res) => {

  const q = `
    SELECT
      COUNT(*) AS total,
      SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending,
      SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) AS approved,
      SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) AS rejected
    FROM laporan
  `

  db.query(q, (err, data) => {
    if (err) { console.log(err); return res.status(500).json(err) }
    res.json(data[0])
  })
}