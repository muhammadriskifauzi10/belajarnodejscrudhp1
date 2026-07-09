const express = require("express");
const path = require("path");
const db = require("./config/database");
const app = express();

const { body, validationResult } = require("express-validator");

// app engine
app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "resources", "views"))
app.use(express.static(path.join(__dirname, "public")))

// session
const session = require("express-session");
const flash = require("connect-flash");
const { render } = require("ejs");
const { errors } = require("undici-types");
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

function middlewareHome(req, res, next) {
    console.log("Ada request masuk...")
    next()
}

// home
app.get("/", middlewareHome, (req, res) => {
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
        errors: [],
        old: {}
    }

    res.render("tambah", data)
})
app.post("/handphone/tambah", 
    [
        body("nama_hp")
            .trim()
            .notEmpty()
            .withMessage("Nama HP wajib diisi")
            .bail()
            .isLength({ min: 3 })
            .withMessage("Nama HP minimal 3 karakter"),
        body("merek")
            .trim()
            .notEmpty()
            .withMessage("Merek wajib diisi"),
        body("tipe_os")
            .notEmpty()
            .withMessage("Tipe OS wajib dipilih"),
        body("harga")
            .notEmpty()
            .withMessage("Harga wajib diisi")
            .bail()
            .isNumeric()
            .withMessage("Harga harus berupa angka")
            .bail()
            .isFloat({ min: 1000 })
            .withMessage("Harga minimal Rp 1.000"),
    ],
    (req, res) => {

    const errors = validationResult(req);

    console.log(errors)

    if (!errors.isEmpty()) {
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
            errors: errors.array(),
            old: req.body
        }

        return res.render("tambah", data);
    }

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
        <p>Opps, halaman tidak ditemukan!</p>
    `)
})

app.listen(8007, () => {
    console.log("Server berjalan di http://localhost:8007...");
});