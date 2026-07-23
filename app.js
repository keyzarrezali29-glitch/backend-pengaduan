import express from "express"
import cors from "cors"
import dotenv from "dotenv"

// ======================
// ROUTES
// ======================

import authRoutes from "./routes/authRoutes.js"
import laporanRoutes from "./routes/laporanRoutes.js"
import commentRoutes from "./routes/commentRoutes.js"
import categoryRoutes from "./routes/categoryRoutes.js"
import userRoutes from "./routes/userRoutes.js"
import dashboardRoutes from "./routes/dashboardRoutes.js"
import notificationRoutes from "./routes/notificationRoutes.js"
import activityRoutes from "./routes/activityRoutes.js"

// ======================
// CONFIG
// ======================

dotenv.config()

const app = express()

// ======================
// MIDDLEWARE
// ======================

app.use(express.json())

app.use(express.urlencoded({
  extended: true
}))

const allowedOrigins = [
  "http://localhost:3000",
  "https://keyzarrezali29-glitch-pedumas-front.vercel.app"
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

// ======================
// STATIC FILES
// ======================

app.use(
  "/uploads",
  express.static("uploads")
)

// ======================
// API ROUTES
// ======================

app.use(
  "/api/auth",
  authRoutes
)

app.use(
  "/api/laporan",
  laporanRoutes
)

// ======================
// COMMENT ROUTES
// ======================

app.use(
  "/api/comment",
  commentRoutes
)

app.use(
  "/api/categories",
  categoryRoutes
)

app.use(
  "/api/users",
  userRoutes
)

app.use(
  "/api/dashboard",
  dashboardRoutes
)

app.use(
  "/api/notifications",
  notificationRoutes
)

app.use(
  "/api/activity",
  activityRoutes
)

// ======================
// TEST API
// ======================

app.get("/", (req, res) => {

  res.json({
    message:
      "API Pengaduan berjalan 🚀"
  })

})

// ======================
// 404 HANDLER
// ======================

app.use((req, res) => {

  res.status(404).json({
    message: "Route tidak ditemukan"
  })

})

// ======================
// SERVER
// ======================

const PORT =
  process.env.PORT || 3000

app.listen(PORT, () => {

  console.log(`

=================================
🚀 SERVER PEDUMAS BERJALAN
=================================

URL:
http://localhost:${PORT}

=================================

  `)

})