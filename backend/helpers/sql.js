const ExpressError = require("../models/error.js");
const {
    columnNameCvrs, tableAbrv, sqlOperator,
    sqlOperatorStrict, sqlCommandsObj,
    sqlCommandsModifsObj, orderByChron,
    recipeFilterKeys, orderByKeys,
    isNumbers
} = require("../config.js");

const {
    deleteObjProps, definePropsInObj,
    deletePropsNotInSet
} = require("../helpers/recipes.js");


/**
 * genSqlStrFromExp
 * Works in conjunction with sql functions in this file.
 * Generates sql string from select and where expressions.
 * Arguments: select sql, where sql object, final sql arr
 * Returns string.
 * whereObj: created from genWhereSqlArr()
 * const whereObj = { whereSql: ["WHERE", "name=", "$1"] };
 * genSqlStrFromExp ("SELECT name FROM users", whereObj) =>
 * "SELECT name FROM users WHERE name=$1";
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

/**
 * selectJoinSql
 * Creates select query for recipes.
 * Arguments: select sql array, table, and join and on values
 * Returns string.
 * selectJoinSql(["r.name,", "a.full_name"], "recipes r", [["authors", "r.author_id = a.id "]]) => 
 * "SELECT r.name, a.full_name FROM recipes r JOIN authors a ON r.author_id = a.id";
 */
function selectJoinSql (selectSqlArr, table, joinArr = []) {
    try {
        const finalSql = ["SELECT"];
        const joinedSqlArr = selectSqlArr.join(", ");
        finalSql.push(joinedSqlArr, "FROM", table);
        if (!joinArr.length) return finalSql.join(" ");
        joinArr.forEach(val => {
            const joinVal = val[0];
            const onVal = val[1];
            finalSql.push("JOIN", joinVal, "ON", onVal);
        });
        return finalSql.join(" ");
    } catch (err) {
        throw new ExpressError(400, `${err}`);
    }
}

/**
 * qryObjToOrderBySql
 * Creates ORDER BY sql.
 * Arguments: qry object
 * Returns string with order by statement.
 * qryObjToOrderBySql({ orderBy: "name", chronOrder: "DESC" }) => "ORDER BY r.name DESC"
 */
function qryObjToOrderBySql (qry) {
    try {
        const sqlObj = {
            columns: [],
            order: [],
            order2: [],
            chronOrder: []
        };
        const qryArray = Object.entries(qry);
        qryArray.forEach(prop => {
            const keyNormlzd = prop[0].toLowerCase().trim();
            const valNormlzd = prop[1].toLowerCase().trim();
            if (orderByKeys.has(keyNormlzd)) {
                const isChron = valNormlzd === "asc" || valNormlzd === "desc";
                const tableCode = tableAbrv[valNormlzd];
                if (!isChron && !sqlObj.order.length) sqlObj.order.push(tableCode, valNormlzd);
                else if (!isChron && sqlObj.order.length) sqlObj.order2.push(tableCode, valNormlzd);
                else if (isChron) sqlObj.chronOrder.push(orderByChron[valNormlzd]);
            }
        });
        const finalOrder = ["ORDER BY"];
        if (!sqlObj.order2.length) finalOrder.push(sqlObj.order.join(""));
        // EDGE CASE PREVNT: if someone types orderBy2 without orderBy
        else if (!sqlObj.order.length && sqlObj.order2.length) finalOrder.push(sqlObj.order2.join(""));
        else {
            const order = sqlObj.order.join("");
            finalOrder.push(`${order},`, sqlObj.order2.join(""));
        };
        if (sqlObj.chronOrder.length) finalOrder.push(sqlObj.chronOrder.join(""));
        return finalOrder.join(" ");
    } catch (err) {
        throw new ExpressError(400, `${err}`);
    }
}

/**
 * genSql
 * Creates select, insert, or update sql query.
 * Arguments: qryType, tableName, data, strict, returning
 * Returns object with sql and values props.
 * const data = { first_name: "fvin", last_name: "I" };
 * const returning = [ first_name, last_name ];
 * genSql("select", "recipes", data, false, returning) =>
 * { sql:"SELECT first_name, last_name FROM recipes", values: [] }
 * const data2 = { first_name: "fvin2", last_name: "I2" };
 * const returning2 = [ first_name, last_name ];
 * genSql("update", "users", data2, true, returning2) =>
 * {
 *  sql: "UPDATE users SET first_name = $1, last_name = $2"
 *  values: ["fvin2", "I2"]
 * }
 */
function genSql (qryType, table, data, strict = false, returning = []) {
    try {
        const isSelect = qryType === "select";
        const isUpdate = qryType === "update";
        const returnLen = returning.length;
        const isStrict = strict !== false;
        const dataArray = !isSelect ? Object.entries(data) : [...data];
        const sqlCommand = [sqlCommandsObj[qryType]];
        const sqlCommandModifs = [sqlCommandsModifsObj[qryType]];
        const columns = [];
        const values = [];
        const sqlArr = [];
        const parametizers = [];
        // const returnCommand = isReturn ? ["RETURNING"] : [""];
        dataArray.forEach((data, idx) => {
            if (!isSelect && !isUpdate) {
                columns.push(data[0]);
                values.push(data[1]);
                parametizers.push(`$${idx + 1}`);
            } else if (isUpdate) {
                const operator = isStrict ? sqlOperatorStrict[data[0]] : sqlOperator[data[0]];
                const updateSql = [data[0], operator, `$${idx + 1}`].join(" ");
                columns.push(updateSql);
                values.push(data[1]);
            } else {
                columns.push(data);
            }
        })
        if (!isSelect && !isUpdate) {
            sqlArr.push(sqlCommand.join(" "), table, "(", columns.join(", "), ")", sqlCommandModifs.join(" "), "(", parametizers.join(", "), ")");
        } else if (qryType === "select") {
            sqlArr.push(sqlCommand.join(" "), columns.join(", "), sqlCommandModifs.join(" "), table);
        } else if (isUpdate) {
            sqlArr.push(sqlCommand.join(" "), table, sqlCommandModifs.join(" "), columns.join(", "));
        }
        const returnStmnt = returnLen ? returning.join(", ") : "";
        const returnStr = returnLen ? sqlArr.push(`RETURNING ${returnStmnt}`) : null;
        console.log("RETUNR STMNT", returnStmnt);
        console.log("sqlArr", sqlArr);
        let sql = sqlArr.join(" ");
        console.log("FINAL SQL OBJ", { sql, values });
        return {
            sql,
            values
        };
    } catch (err) {
        throw new ExpressError(400, `${err}`);
    }
}


/**
 * genWhereSqlArr
 * Creates WHERE sql and parametized values.
 * Arguments: column value array, parametizer, strict, returning, table abreviations
 * Returns object of where sql and values.
 * genWhereSqlArr({ name: "good" }, 1, true) => {
    whereSql: ["WHERE name = $1"],
    values: ["good"]
 * }
 *  genWhereSqlArr({ name: "good" }, 1) => {
    whereSql: ["WHERE name ILIKE $1"],
    values: ["%good%"]
 * }
 *  genWhereSqlArr({ name: "good" }, 1, false, false, true) => {
    whereSql: ["WHERE r.name ILIKE $1"],
    values: ["%good%"]
 * 
 */
function genWhereSqlArr (columnValObj, parametizer, strict = false, returning = false, abrv = false) {
    try {
        const sqlObj = {
            whereSql: [],
            values: []
        };
        const isStrict = strict !== false;
        const isReturn = returning !== false;
        const returnCommand = returning !== false ? ["RETURNING"] : [""];
        const qryArray = Object.entries(columnValObj);
        qryArray.forEach((prop, idx) => {
            const isValNumber = Number.isInteger(prop[1]);
            const keyNormlzd = columnNameCvrs[prop[0].toLowerCase().trim()];
            const valNormlzd = !isValNumber ? prop[1].toLowerCase().trim() : prop[1];
            const queryOperator = isStrict ? sqlOperatorStrict[keyNormlzd] : sqlOperator[keyNormlzd];
            const tableCode = tableAbrv[prop[0]];
            const column = !abrv ? [keyNormlzd] : [tableCode, keyNormlzd];
            const columnJoin = column.join("");
            const sql = [columnJoin, queryOperator, `$${parametizer}`];
            const cmndValue = isStrict ? `${valNormlzd}` : `%${valNormlzd}%`;
            const value = !isNumbers.has(keyNormlzd) ? cmndValue : +valNormlzd;
            if (!sqlObj.whereSql.length) sqlObj.whereSql.push("WHERE", ...sql);
            else sqlObj.whereSql.push("AND", ...sql);
            sqlObj.values.push(value);
            parametizer++;
        });
        const returnStmnt = isReturn ? returning.join(", ") : "";
        const returnStr = isReturn ? sqlObj.whereSql.push(`RETURNING ${returnStmnt}`) : null;
        return sqlObj;
    } catch (err) {
        throw new ExpressError(400, `${err}`);
    }
}

module.exports = {
    genSqlStrFromExp,
    selectJoinSql,
    qryObjToOrderBySql,
    genSql, genWhereSqlArr
};