const ExpressError = require("../models/error.js");
const {
    columnNameCvrs, tableAbrv, sqlOperator,
    orderByChron, filterKeys, orderByKeys,
    selectRecipesColumns, isNumbers
} = require("../config.js");

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

/**
 * genWhereSql
 * Creates WHERE sql and parametized values.
 * Arguments: qry object
 * Returns object of where sql.
 * filterSql({ name: "good" }) => {
    whereSql: ["WHERE name ILIKIE $1"],
    values: ["%good%"]
 * }
 */
function genWhereSql (columnValObj) {
    try {
        const sqlObj = {
            whereSql: [],
            values: []
        };
        let parametizer = 1;

        // const filtersParsed = deletePropsNotInSet(selectRecipesColumns, columnValObj);
        const qryArray = Object.entries(columnValObj);
        qryArray.forEach((prop, idx) => {
            const isValNumber = Number.isInteger(prop[1]);
            const keyNormlzd = columnNameCvrs[prop[0].toLowerCase().trim()];
            const valNormlzd = !isValNumber ? prop[1].toLowerCase().trim() : prop[1];
            const tableCode = tableAbrv[prop[0]];
            const queryOperator = sqlOperator[keyNormlzd];
            const column = [tableCode, keyNormlzd];
            const columnJoin = column.join("");
            const sql = [columnJoin, queryOperator, `$${parametizer}`];
            const value = !isNumbers.has(keyNormlzd) ? `%${valNormlzd}%` : +valNormlzd;
            if (!sqlObj.whereSql.length) sqlObj.whereSql.push("WHERE", ...sql);
            else sqlObj.whereSql.push("AND", ...sql);
            sqlObj.values.push(value);
            parametizer++;  
        });
        return sqlObj;
    } catch (err) {
        throw new ExpressError(400, `${err}`);
    }
}

/**
 * genSqlStrFromExp
 * Generates sql string from expressions.
 * Arguments: select sql, where sql object, arr
 * Returns string.
 */
function genSqlStrFromExp (selectSql, whereObj, finalSqlArr = []) {
    try {
        const whereSqlQry = whereObj.whereSql.join(" ");
        finalSqlArr.push(selectSql, whereSqlQry);
        const finalSqlQry = finalSqlArr.join(" ");
        return finalSqlQry;
    } catch (err) {
        throw new ExpressError(400, `${err}`);
    }
}

module.exports = {
    genInsertSql, genUpdateSql, genWhereSql,
    genSqlStrFromExp
};