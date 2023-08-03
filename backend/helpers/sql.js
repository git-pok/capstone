const ExpressError = require("../models/error.js");

function genInsertSql (table, data, sqlExp, returning = false) {
    try {
        const dataArray = Object.entries(data);
        const sqlQryEx = [sqlExp, table];
        const columns = [];
        const values = [];
        const parametizers = [];
        dataArray.forEach((data, idx) => {
            columns.push(data[0]);
            values.push(data[1]);
            parametizers.push(`$${idx + 1}`);
        })
        let sql = `${sqlQryEx.join(" ")} (${columns.join(", ")}) VALUES (${parametizers.join(", ")})`;
        sql = !returning ? `${sql},` : `${sql} RETURNING ${returning.join(", ")}`;
        return {
            sql,
            values
        };
    } catch (err) {
        throw new ExpressError(400, "Bad request!");
    }
}

module.exports = { genInsertSql };