import mysql from "mysql2";

export const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "pengaduan_masyarakat",
  port: process.env.DB_PORT || 3306,
});

// cek koneksi
db.connect((err) => {
  if (err) {
    console.log("Koneksi gagal:", err);
  } else {
    console.log("Database terhubung 🔥");
  }
});