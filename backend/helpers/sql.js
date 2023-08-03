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
        sql = !returning ? `${sql}` : `${sql} RETURNING ${returning.join(", ")}`;
        return {
            sql,
            values
        };
    } catch (err) {
        throw new ExpressError(400, `${err}`);
    }
}


function genUpdateSql (data) {
    try {
        const dataArray = Object.entries(data);
        const parametizedEdits = [];
        const values = [];
        dataArray.forEach((data, idx) => {
            const setUpdateValues = `${data[0]} = $${idx + 1}`;
            parametizedEdits.push(setUpdateValues);
            values.push(data[1]);
        })
        let sql = `${parametizedEdits.join(", ")}`;
        return {
            sql,
            values
        };
    } catch (err) {
        throw new ExpressError(400, `${err}`);
    }
}

module.exports = { genInsertSql, genUpdateSql };