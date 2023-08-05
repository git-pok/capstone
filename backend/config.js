const { Client } = require("pg");

let BCRYPT_WORK_FACTOR = process.env.NODE_ENV === "test" ? 1 : 12;

let DB_URI;

DB_URI = process.env.NODE_ENV === "test"
    ? "postgresql:///savour_test" : "postgresql:///savour";

let db = new Client ({ 
    connectionString: DB_URI
});

db.connect();

const columnNameCvrs = {
    author: "full_name",
    name: "name",
    main_category: "main_category",
    sub_category: "sub_category",
    rating: "rating"
};

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

const allRecipesSelect = [
    "r.id,", "r.name,", "a.full_name AS author,", "rt.rating,",
    "rt.vote_count,", "r.url,", "r.image,", "r.description,",
    "r.serves,", "r.steps,", "r.prep_time,", "r.cook_time"
];

const orderByChron = {
    asc: "ASC",
    desc: "DESC"
};

const filterKeys = new Set();
        filterKeys.add("name").add("author").add("rating");

const orderByKeys = new Set();
        orderByKeys.add("orderby").add("orderby2").add("chronorder");

module.exports = {
    db, BCRYPT_WORK_FACTOR, columnNameCvrs,
    tableAbrv, sqlOperator,
    allRecipesSelect, orderByChron,
    filterKeys, orderByKeys
};