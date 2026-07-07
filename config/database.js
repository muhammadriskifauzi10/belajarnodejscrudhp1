const mysql = require("mysql2");

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "db_hp"
});

db.connect((err) => {
    if (err) {
        console.log("Database gagal terkoneksi!");
        console.log(err);
        return;
    }

    console.log("Database berhasil terkoneksi!");
});

module.exports = db;