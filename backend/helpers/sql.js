const ExpressError = require("../models/error.js");

function makeSqlNoSanitize (table, data, sqlExp) {
    try {
        let sql = `${sqlExp} ${table}`;
        const columns = [];
        const values = [];
        for (let prop in data) {
            columns.push(prop);
            values.push(data[prop]);
        }
        sql = `${sql} (${columns}) VALUES (${values})`;
        return sql;
    } catch (err) {
        throw new ExpressError(400, "Bad request!");
    }
}

module.exports = { makeSqlNoSanitize };