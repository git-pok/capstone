const { Client } = require("pg");

let BCRYPT_WORK_FACTOR = process.env.NODE_ENV === "test" ? 1 : 12;

let DB_URI;

DB_URI = process.env.NODE_ENV === "test"
    ? "postgresql:///savour_test" : "postgresql:///savour";

let db = new Client ({ 
    connectionString: DB_URI
});

db.connect();

const tableAbrv = {
    author: "a.",
    full_name: "a.",
    name: "r.",
    main_category: "r.",
    sub_category: "r.",
    rating: "rt."
};

const sqlOperator = {
    full_name: "ILIKE",
    name: "ILIKE",
    main_category: "ILIKE",
    sub_category: "ILIKE",
    rating: "="
};

module.exports = {
    db, BCRYPT_WORK_FACTOR, tableAbrv, sqlOperator
};