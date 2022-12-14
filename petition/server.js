//++++++++++++++ HANDLEBARS+++++++++++++++++
//create "views" folder and add all handlebars files
require("dotenv").config();
const http = require("http");
const fs = require("fs");
const path = require("path"); // use path.join() for concatenating paths
const express = require("express");
const app = express();
//const flash = require("express-flash");
//const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
//const session = require("express-session");
const cookieSession = require("cookie-session");

//there are different engines. Handlebars is just one of them
const { engine } = require("express-handlebars");
app.engine("handlebars", engine());
app.set("view engine", "handlebars");

app.use(express.static("./public"));
app.use(express.static("./img"));
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));
//app.use(cookieParser());

const { hashPass, compare } = require("./encrypt");

app.use(
    cookieSession({
        //secret: process.env.SESSION_SECRET,
        secret: "test123",
        maxAge: 1000 * 60 * 60 * 24 * 14,
    })
);

//citing https://www.tutsmake.com/node-js-express-insert-data-from-form-into-mysql-database/

//app.use(flash());

const db = require("./db");

//get all the people that have signed the petition
//let signersList = getAllSignatures();

//console.log("===========signersList============", signersList);

const contentTypes = {
    ".html": "text/html",
    ".css": "text/css",
    ".js": "text/javascript",
    ".json": "application/json",
    ".gif": "image/gif",
    ".jpg": "image/jpeg",
    ".png": "image/png",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon",
};

// middleware to serve static files from a specific folder
//const staticMiddleware = express.static(path.join(__dirname, "projects"));
//app.use(staticMiddleware);

//register
app.get("/register", (req, res) => {
    if (req.session.userID) {
        return res.redirect("/thanks");
    }

    res.render("register");
});

//login
app.get("/login", (req, res) => {
    /*if (req.session.userID) {
        return res.redirect("/thanks");
    }
    */
    res.render("login");
});

//register new users and add them to database

app.post("/register", (req, res) => {
    let first_name = req.body.firstname;

    let last_name = req.body.lastname;

    let email = req.body.email;

    let userPassword = req.body.password;

    //hash the password that the user inputs

    hashPass(userPassword).then((hashedPassword) => {
        console.log("this password is hashed", hashedPassword);
        //compares (actual passwd, hashed passwd)

        /*
        compare(userPassword, hashedPassword).then((boolean) => {
            console.log(`the password matches ${boolean}`);
        });*/
    });

    console.log("this is a test", req.body);
    db.registerUser(first_name, last_name, email, userPassword)
        .then(({ rows }) => {
            console.log("rows id", rows[0].id);
            req.session.userID = rows[0].id;

            console.log("record inserted");

            //res.redirect("/thanks");
        })
        .catch((err) => {
            console.log("error appeared for query: ", err);
            res.redirect("/register");
        });
});

app.post("/login", (req, res) => {
    //signature is stored as cookie in req.session.userID

    //get user email from the form
    let userEmail = req.body.email;

    //get user email from the form
    let userPassword = req.body.password;

    //let signature = req.session.userID;
    console.log("++++++email++++++", userEmail);
    console.log("++++++password++++++", userPassword);

    //1. get the user from database based on email
    db.getUserEmail(userEmail)
        .then(({ rows }) => {
            console.log("rows email", rows[0].email);
            console.log("rows password", rows[0].password);
            //console.log("email in users database", req.body.email);
            //2. check condition if user exists from 1
            if (userPassword === rows[0].password) {
                console.log("we have a password match");
                //3. if user exists check if password matches
            }
        })
        .catch((err) => {
            console.log("error appeared for query: ", err);
            res.redirect("/register");
        });

    //4. set session cookies

    //5.do we have a signature

    //get userid
    //let userid = req.body.lastname;
});

//encryptß
app.get("/hashing", (req, res) => {
    const str = "MintCohort";
    hashPass(str).then((hashedPassword) => {
        console.log(hashedPassword);
        //compares (actual passwd, hashed passwd)
        compare(str, hashedPassword).then((boolean) => {
            console.log(`the password matches ${boolean}`);
        });
    });
});

app.get("/", (req, res) => {
    res.redirect("/petition");
});

//petition route
//render petitions handlebar

app.get("/petition", (req, res) => {
    res.render("petition", {});
});

//thanks route
//render thanks handlebar
// declare empty global variable signatories to collect number of signatories
let signatories;
app.get("/thanks", (req, res) => {
    if (req.session.userID) {
        // get the user id which is stored in req.session.userID globally as cookie

        db.getCurrentSignature(req.session.userID).then((currentSignature) => {
            console.log(currentSignature);
            return res.render("thanks", {
                layout: "main",
                signatories: signatories,
                //currentSignature: currentSignature.rows[0].signature,
            });
        });
    } else {
        res.redirect("/petition");
    }
});

//signers route
//render signers handlebar
app.get("/signers", (req, res) => {
    db.getAllSignatures()
        .then(({ rows }) => {
            console.log("rows", rows); // in rows property is the actual data
            const records = rows;
            signatories = records.reduce((rows) => rows + 1, 0);

            console.log("signatories", signatories);

            res.render("signers", {
                layout: "main",
                records: records,
                signatories: signatories,
            });
        })
        .catch((err) => {
            console.log("error appeared for query: ", err);
        });
});

//post request

app.post("/petition", (req, res) => {
    let first_name = req.body.first_name;

    let last_name = req.body.last_name;

    console.log("this is a test", req.body);
    //EncodedSignature is the value set in the input with hidden value

    let signature = req.body.EncodedSignature;

    console.log("this is a test", req.body);

    db.addSignature(first_name, last_name, signature)
        .then(({ rows }) => {
            console.log("rows id", rows[0].id);
            req.session.userID = rows[0].id;

            console.log("record inserted");

            res.redirect("/thanks");
        })
        .catch((err) => {
            console.log("error appeared for query: ", err);
            res.redirect("/petition");
        });
});

//start the express server
app.listen(8081, () => {
    console.log("server listening on port localhost:8081");
});
