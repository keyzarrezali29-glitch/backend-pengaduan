import db from "../config/db.js"
import { logActivity } from "../utils/logActivity.js"
import { createNotification } from "../utils/createNotification.js"

// ======================
// GET SEMUA LAPORAN
// ======================

export const getLaporan = async (req, res) => {
  try {
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

    const [data] = await db.query(q, [`%${search}%`])
    res.json(data)
  } catch (err) {
    console.log(err)
    return res.status(500).json(err)
  }
}

// ======================
// GET DETAIL LAPORAN
// ======================

export const getLaporanById = async (req, res) => {
  try {
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

    const [data] = await db.query(q, [req.params.id])
    res.json(data[0])
  } catch (err) {
    console.log(err)
    return res.status(500).json(err)
  }
}

// ======================
// GET LAPORAN BY USER
// ======================

export const getLaporanByUser = async (req, res) => {
  try {
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

    const [data] = await db.query(q, [req.user.id])
    res.json(data)
  } catch (err) {
    console.log(err)
    return res.status(500).json(err)
  }
}

// ======================
// TAMBAH LAPORAN
// ======================

export const addLaporan = async (req, res) => {
  try {
    const { title, description, category_id, location } = req.body

    if (!title || !description || !category_id) {
      return res.status(400).json({ message: "Data belum lengkap" })
    }

    const image = req.file ? req.file.filename : null

    const q = `
      INSERT INTO laporan (user_id, category_id, title, description, image, location)
      VALUES (?, ?, ?, ?, ?, ?)
    `

    const [result] = await db.query(q, [
      req.user.id,
      Number(category_id),
      title,
      description,
      image,
      location || null,
    ])

    try {
      logActivity(req.user.id, `Membuat laporan: ${title}`)
    } catch (e) {
      console.log(e)
    }

    const [userData] = await db.query(`SELECT name FROM users WHERE id = ?`, [req.user.id])
    const userName = userData?.[0]?.name || "User"

    const [admins] = await db.query(`SELECT * FROM users WHERE role = 'admin'`)
    admins.forEach((admin) => {
      createNotification(admin.id, "Laporan Baru", `${userName} membuat laporan baru`, "laporan", result.insertId)
    })

    res.json({ message: "Laporan berhasil dibuat", laporan_id: result.insertId })
  } catch (err) {
    console.log(err)
    return res.status(500).json({ message: "Gagal membuat laporan", error: err.message })
  }
}

// ======================
// DELETE LAPORAN
// ======================

export const deleteLaporan = async (req, res) => {
  try {
    const [data] = await db.query(`SELECT * FROM laporan WHERE id = ?`, [req.params.id])

    if (!data[0]) {
      return res.status(404).json({ message: "Laporan tidak ditemukan" })
    }

    const laporan = data[0]
    const isOwner = laporan.user_id === req.user.id
    const isAdmin = req.user.role === "admin" || req.user.role === "super_admin"

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Tidak diizinkan menghapus laporan ini" })
    }

    await db.query(`DELETE FROM laporan WHERE id = ?`, [req.params.id])

    try {
      logActivity(req.user.id, `Menghapus laporan`)
    } catch (e) {
      console.log(e)
    }

    res.json({ message: "Laporan berhasil dihapus" })
  } catch (err) {
    console.log(err)
    return res.status(500).json(err)
  }
}

// ======================
// UPDATE STATUS
// ======================

export const updateStatus = async (req, res) => {
  try {
    const { status, response } = req.body

    const q = `UPDATE laporan SET status = ?, response = ? WHERE id = ?`
    await db.query(q, [status, response, req.params.id])

    const [laporanData] = await db.query(`SELECT * FROM laporan WHERE id = ?`, [req.params.id])
    const laporan = laporanData[0]

    try {
      logActivity(req.user.id, `Mengubah status laporan "${laporan.title}" menjadi ${status}`)
    } catch (e) {
      console.log(e)
    }

    createNotification(laporan.user_id, "Status Laporan", `Laporan kamu diupdate menjadi ${status}`, "status", laporan.id)

    res.json({ message: "Laporan berhasil diupdate" })
  } catch (err) {
    console.log(err)
    return res.status(500).json(err)
  }
}

// ======================
// UPDATE LAPORAN
// ======================

export const updateLaporan = async (req, res) => {
  try {
    const [dataCheck] = await db.query(`SELECT * FROM laporan WHERE id = ?`, [req.params.id])

    if (!dataCheck[0]) {
      return res.status(404).json({ message: "Laporan tidak ditemukan" })
    }

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

    await db.query(q, values)

    try {
      logActivity(req.user.id, `Mengupdate laporan`)
    } catch (e) {
      console.log(e)
    }

    res.json({ message: "Laporan berhasil diupdate" })
  } catch (err) {
    console.log(err)
    return res.status(500).json(err)
  }
}

// ======================
// DASHBOARD STATS
// ======================

export const getDashboardStats = async (req, res) => {
  try {
    const q = `
      SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) AS approved,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) AS rejected
      FROM laporan
    `

    const [data] = await db.query(q)
    res.json(data[0])
  } catch (err) {
    console.log(err)
    return res.status(500).json(err)
  }
}