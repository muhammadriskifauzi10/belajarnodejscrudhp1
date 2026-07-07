const express = require("express");
const path = require("path");
const db = require("./config/database");
const app = express();

// app engine
app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "resources", "views"))
app.use(express.static(path.join(__dirname, "public")))

// session
const session = require("express-session");
const flash = require("connect-flash");
const { render } = require("ejs");
app.use(session({
    secret: "belajar-express",
    resave: false,
    saveUninitialized: false
}));
app.use(flash());
app.use((req, res, next) => {

    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");

    next();

});

app.use(express.urlencoded({
    extended: true
}))

// home
app.get("/", (req, res) => {
    db.query("SELECT * FROM handphone", (err, result) => {
        if (err) {
            return res.send(err);
        }

        const url = [
            {
                link: "/",
                nama: "Home"
            },
            {
                link: "/about",
                nama: "About"
            }
        ]
    
        const data = {
            judul: "Halaman Home",
            url: url,
            data: result
        }
    
        res.render("home", data)
    })

});

// tambah
app.get("/handphone/tambah", (req, res) => {
    const url = [
        {
            link: "/",
            nama: "Home"
        },
        {
            link: "/about",
            nama: "About"
        }
    ]

    const data = {
        judul: "Tambah data",
        url: url,
    }

    res.render("tambah", data)
})
app.post("/handphone/tambah", (req, res) => {
    const {
        nama_hp,
        merek,
        tipe_os,
        harga
    } = req.body

    db.query("INSERT INTO handphone (nama_hp, merek, tipe_os, harga) VALUES (?, ?, ?, ?)", 
        [nama_hp, merek, tipe_os, harga], (err) => {
            if(err) {
                return res.send(err)
            }

            req.flash("success", "Data berhasil di tambah")
            res.redirect("/")
    })
})

// edit
app.get("/handphone/edit/:id", (req, res) => {
    const id = req.params.id;

    db.query("SELECT * FROM handphone WHERE id=?", [id], (err, result) => {
        if (err) {
            return res.send(err);
        }

        const url = [
            {
                link: "/",
                nama: "Home"
            },
            {
                link: "/about",
                nama: "About"
            }
        ]

        const data = {
            judul: "Edit data " + result[0].nama_hp,
            url: url,
            data: result
        }

        res.render("edit", data)
    })
})
app.post("/handphone/edit/:id", (req, res) => {
    const id = req.params.id;

    const {
        nama_hp,
        merek,
        tipe_os,
        harga
    } = req.body

    db.query("UPDATE handphone SET nama_hp=?, merek=?, tipe_os=?, harga=? WHERE id=?", 
        [nama_hp, merek, tipe_os, harga, id], (err) => {
            if(err) {
                return res.send(err)
            }

            req.flash("success", "Data berhasil di edit")
            res.redirect("/")
    })
})

// delete
app.get("/handphone/delete/:id", (req, res) => {
    const id = req.params.id;

    db.query("DELETE FROM handphone WHERE id=?", [id], (err) => {
        if (err) {
            return res.send(err);
        }

        req.flash("success", "Data berhasil di hapus");
        res.redirect("/");
    })
})

// about
app.get("/about", (req, res) => {
    const url = [
        {
            link: "/",
            nama: "Home"
        },
        {
            link: "/about",
            nama: "About"
        }
    ]

    const data = {
        judul: "Halaman About",
        url: url
    }

    res.render("about", data)
});

app.use((req, res) => {
    res.send(`
        <p>Opps, halaman tidak ditemukan!
    `)
})

app.listen(8007, () => {
    console.log("Server berjalan...");
});