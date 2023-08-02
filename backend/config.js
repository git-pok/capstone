const { Client } = require("pg");

let workFactor = process.env.NODE_ENV === "test" ? 1 : 12;

let DB_URI;

DB_URI = process.env.NODE_ENV === "test"
    ? "postgresql:///savour_test" : "postgresql:///savour";

let db = new Client ({ 
    connectionString: DB_URI
});

db.connect();

module.exports = { db, workFactor };