require("dotenv").config();
const { SQL_USER, SQL_PASSWORD } = process.env; // add a .env file next to the db.js file with your PostgreSQL credentials
const spicedPg = require("spiced-pg");
const db = spicedPg(`postgres:dolal:@localhost:5432/petition`);

/*
db.query(
    `INSERT INTO signatures (firstname, lastname, signature, created_at) VALUES ('test','123', 'blabla', current_timestamp) ;`
)
    .then((data) => {
        console.log(data.rows); // in rows property is the actual data
    })
    .catch((err) => {
        console.log("error appeared for query: ", err);
    });

db.query(`SELECT * FROM signatures;`)
    .then((data) => {
        console.log(data.rows); // in rows property is the actual data
    })
    .catch((err) => {
        console.log("error appeared for query: ", err);
    });

*/

// create the following functions:
//  - getAllSignatures - use db.query to get all signatures from table signatures
//  - addSignature - use db.query to insert a signature to table signatures
// Don't forget to export the functions with module.exports
// query is a Prom

//  - getAllSignatures - use db.query to get all signatures from table signatures
module.exports.getAllSignatures = () => {
    return db.query(`SELECT * FROM signatures`);
};

//  - addSignature - use db.query to insert a signature to table signatures
module.exports.addSignature = (first_name, last_name, sig) => {
    let sql = `INSERT INTO signatures (firstname, lastname, signature, ) VALUES ($1,$2,$3) RETURNING id`;

    return db.query(sql, [first_name, last_name, sig]);
};

//
module.exports.getCurrentSignature = (userId) => {
    let sql = `SELECT signature FROM signatures WHERE id =$1 `;
    return db.query(sql, [userId]);
};

//  - addRegistration - use db.query to insert new users to table users
module.exports.registerUser = (firstname, lastname, email, password) => {
    let sql = `INSERT INTO users (first, last, email, password) VALUES ($1,$2,$3,$4) RETURNING id`;

    return db.query(sql, [firstname, lastname, email, password]);
};

//  - addLogin - use db.query to insert new users to table users
module.exports.loginUser = (firstname, lastname) => {
    let sql = `INSERT INTO signatures (signature, user_id) VALUES ($1,$2) RETURNING id`;

    return db.query(sql, [firstname, lastname]);
};

// get email from users db. use this authentification if it exists
module.exports.getUserEmail = (userEmail) => {
    let sql = `SELECT email, password FROM users WHERE email =$1 `;
    return db.query(sql, [userEmail]);
};
