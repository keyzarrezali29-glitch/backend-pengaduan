import mysql from "mysql2";

export const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "pengaduan_masyarakat",
});

// cek koneksi
db.connect((err) => {

  if (err) {
    console.log("Koneksi gagal:", err);
  }

  else {
    console.log("Database terhubung 🔥");
  }

});