const ExpressError = require("../models/error.js");
const {
    sqlOperator, clmnNameToTblAbrev,
    sqlOperatorStrict, sqlCommandsObj,
    sqlCommandsModifsObj, orderByChron,
    orderByKeys,
    isNumbers, tablesJoinAbrv, joinTableNameAbrv,
    recipesOnData, savourTableNames
} = require("../config.js");

const {
    deleteObjProps, definePropsInObj,
    deletePropsNotInSet
} = require("../helpers/recipes.js");

/**
 * arrayConcat
 * Generates string from arr.
 * Arguments: arr
 * Returns string.
 * arrayConcat (["SELECT", "name", "from", "recipes"]) =>
 * "SELECT name FROM recipes";
 */
function arrayConcat (arr) {
    try {
        return arr.join(" ");
    } catch (err) {
        const errMsg = err.msg ? err.msg : "Error!";
        const statusCode = err.status ? err.status : 400;
        throw new ExpressError(statusCode, errMsg);
        // throw new ExpressError(400, `${err}`);
    }
}

/**
 * genJoinSql
 * Creates join query.
 * Arguments: table abreviation, join array, and join type
 * Returns string.
 * const joinArr = ["authors", "author_id", id];
 * genJoinSql("r", joinArr, "JOIN") => 
 * "JOIN authors a ON r.author_id = a.id";
 */
function genJoinSql (tableAbrev, joinArr, joinType = "JOIN") {
    try {
        if (!Array.isArray(joinArr)) throw new ExpressError(400, "joinArr must be an array!");
        const finalSql = [];
        joinArr.forEach(val => {
            const join = tablesJoinAbrv[val[0]];
            const joinOn1SqlArr = [];
            const joinOn2SqlArr = [];
            const joinOnTable1Abrv = tableAbrev;
            const joinOn1 = val[1];
            joinOn1SqlArr.push(joinOnTable1Abrv, joinOn1);
            const joinOnTable2Abrv = joinTableNameAbrv[val[0]];
            const joinOn2 = val[2];
            joinOn2SqlArr.push(joinOnTable2Abrv, joinOn2);
            const joinOn1Sql = joinOn1SqlArr.join("");
            const joinOn2Sql = joinOn2SqlArr.join("");
            finalSql.push(
                joinType, join, "ON", joinOn1Sql, "=", joinOn2Sql
            );
        });
        // console.log("GEN JOIN SQL FUNC", finalSql);
        return finalSql.join(" ");
    } catch (err) {
        const errMsg = err.msg ? err.msg : "Error!";
        const statusCode = err.status ? err.status : 400;
        throw new ExpressError(statusCode, errMsg);
        // throw new ExpressError(400, `${err}`);
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
        const qryCpy = JSON.parse(JSON.stringify(qry));
        const orderByCmnd =  [];
        const sqlObj = {
            columns: [],
            order: [],
            order2: [],
            chronOrder: []
        };
        const qryArray = Object.entries(qryCpy);
        qryArray.forEach(prop => {
            const keyNormlzd = prop[0].toLowerCase().trim();
            const valNormlzd = keyNormlzd !== "chronorder" ? prop[1] : prop[1].toLowerCase().trim();
            const orderByExists = keyNormlzd === "orderby";
            const orderBy2Exists = keyNormlzd === "orderby2";
            if (!orderByCmnd.length && orderByExists) orderByCmnd.push("ORDER BY");
            else if (!orderByCmnd.length && orderBy2Exists) orderByCmnd.push("ORDER BY");

            if (orderByKeys.has(keyNormlzd)) {
                const orderByLen = sqlObj.order.length;
                const orderBy2Len = sqlObj.order2.length;
                const isChron = valNormlzd === "asc" || valNormlzd === "desc";
                const tableCode = clmnNameToTblAbrev[valNormlzd];
                if (!isChron && !sqlObj.order.length) sqlObj.order.push(tableCode, valNormlzd);
                else if (!isChron && sqlObj.order.length) sqlObj.order2.push(tableCode, valNormlzd);
                else if (isChron && !orderByLen && !orderBy2Len) sqlObj.chronOrder.push("");
                else if (isChron) sqlObj.chronOrder.push(orderByChron[valNormlzd]);
            }
        });
        const orderBySql = orderByCmnd.length ? orderByCmnd.join("") : "";
        const finalOrder =  [orderBySql];
        if (!sqlObj.order2.length) finalOrder.push(sqlObj.order.join(""));
        // EDGE CASE PREVNT: if orderBy2 is queried without orderBy
        else if (!sqlObj.order.length && sqlObj.order2.length) finalOrder.push(sqlObj.order2.join(""));
        else {
            const order = sqlObj.order.join("");
            finalOrder.push(`${order},`, sqlObj.order2.join(""));
        };
        if (sqlObj.chronOrder.length) finalOrder.push(sqlObj.chronOrder.join(""));
        const finalQry = finalOrder.join(" ");
        return finalQry === " " ? "" : finalQry;
    } catch (err) {
        const errMsg = err.msg ? err.msg : "Error!";
        const statusCode = err.status ? err.status : 400;
        throw new ExpressError(statusCode, errMsg);
        // throw new ExpressError(400, `${err}`);
    }
}

/**
 * genSql
 * Creates select, insert, or update sql query.
 * Arguments: qryType, tableName, data, strict, returning
 * Returns object with sql and values props.
 * select data argument: array of column names.
 * insert data argument: object with column name keys
        and their values as values.
 * update data argument: object with column name keys
        and their values as values.
 * const data = [ "first_name", "last_name" ];
 * const returning = [ first_name, last_name ];
 * genSql("select", "recipes", data, false, returning) =>
 * { sql: "SELECT first_name, last_name FROM recipes", values: [] }
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
        const prmttdQryTypes = new Set();
        prmttdQryTypes.add("select").add("insert").add("update");
        qryType = qryType.toLowerCase().trim();
        if (!prmttdQryTypes.has(qryType)) throw new ExpressError(400, "qryType not allowed!");
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
        // console.log("RETUNR STMNT", returnStmnt);
        // console.log("sqlArr", sqlArr);
        let sql = sqlArr.join(" ");
        if (!isSelect && !isUpdate) {
            sql = sql.replaceAll("( ", "(").replaceAll(" )", ")");
        }
        return {
            sql,
            values
        };
    } catch (err) {
        const errMsg = err.msg ? err.msg : "Error!";
        const statusCode = err.status ? err.status : 400;
        throw new ExpressError(statusCode, errMsg);
        // throw new ExpressError(400, `${err}`);
    }
}


/**
 * genWhereSqlArr
 * Creates WHERE sql and parametized values.
 * Arguments: column value array, parametizer, exactMatch, returnArray, table abreviations
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
function genWhereSqlArr (columnValObj, parametizer, exactMatch = false, returnArray = false, abrv = false, tableAbrevForColmn) {
    try {
        // console.log("GEN WHERE columnValObj", columnValObj);
        const sqlObj = {
            whereSql: [],
            values: []
        };
        const isStrict = exactMatch !== false;
        const isReturn = returnArray !== false;
        const qryArray = Object.entries(columnValObj);
        qryArray.forEach((prop, idx) => {
            const isValNumber = Number.isInteger(prop[1]);
            const keyNormlzd = prop[0];
            const valNormlzd = !isValNumber ? prop[1].toLowerCase().trim() : prop[1];
            // console.log("keyNormlzd", keyNormlzd);
            // console.log("PROP 0", prop[0]);
            const queryOperator = isStrict ? sqlOperatorStrict[keyNormlzd] : sqlOperator[keyNormlzd];
            const tableCode = abrv ? tableAbrevForColmn[prop[0]] : null;
            // console.log("tableCode", tableCode);
            const column = !abrv ? [keyNormlzd] : [tableCode, keyNormlzd];
            const columnJoin = column.join("");
            // console.log("columnJoin", columnJoin);
            const sql = [columnJoin, queryOperator, `$${parametizer}`];
            const cmndValue = isStrict ? `${valNormlzd}` : `%${valNormlzd}%`;
            const value = !isNumbers.has(keyNormlzd) ? cmndValue : +valNormlzd;
            // console.log("value", value);
            // console.log("sql", sql);
            if (!sqlObj.whereSql.length) sqlObj.whereSql.push("WHERE", sql.join(" "));
            else sqlObj.whereSql.push("AND", sql.join(" "));
            // console.log("sqlObj.whereSql", sqlObj.whereSql);
            sqlObj.values.push(value);
            parametizer++;
        });
        const returnStmnt = isReturn ? returnArray.join(", ") : "";
        const returnStr = isReturn ? sqlObj.whereSql.push(`RETURNING ${returnStmnt}`) : null;
        sqlObj.whereSql = sqlObj.whereSql.join(" ");
        // console.log("sqlObj", sqlObj);
        return sqlObj;
    } catch (err) {
        const errMsg = err.msg ? err.msg : "Error!";
        const statusCode = err.status ? err.status : 400;
        throw new ExpressError(statusCode, errMsg);
        // throw new ExpressError(400, `${err}`);
    }
}

function genSelectSql (selectColumnsArr, tableName, tableNameAbrev = false, clmnToTableCvrtObj) {
    try {
        if (!Array.isArray(selectColumnsArr)) throw new ExpressError("selectColumnsArr must be an array!");
        const finalSql = [];
        const columns = [];
        finalSql.push("SELECT");
        selectColumnsArr.forEach(clmnName => {
            if (tableNameAbrev) {
                const columnAbrev = [];
                columnAbrev.push(clmnToTableCvrtObj[clmnName]);
                columnAbrev.push(clmnName);
                const columnAbrevStr = columnAbrev.join("");
                columns.push(columnAbrevStr);
            }
            else columns.push(clmnName);
        })
        finalSql.push(columns.join(", "), "FROM");
        if (tableNameAbrev !== false) {
            const tableNameAndAbrev = tablesJoinAbrv[tableName];
            finalSql.push(tableNameAndAbrev);
        } else {
            finalSql.push(tableName);
        }
        return finalSql.join(" ");
    } catch (err) {
        const errMsg = err.msg ? err.msg : "Error!";
        const statusCode = err.status ? err.status : 400;
        throw new ExpressError(statusCode, errMsg);
    }
}


/**
 * genUpdateSqlObj
 * Creates update sql query object with parametized values.
 * Arguments: tableName, clmnsValsObj, exactMatch, returnArray
 * clmnsValsObj argument: object with column name keys
        and their values as values.
 * Returns object with sql and values props.
 * const data = [ "first_name", "last_name" ];
 * const returnArray = [ first_name, last_name ];
 * const clmnsValsObj = { first_name: "fvin2", last_name: "I2" };
 * genSql("users", clmnsValsObj, true, returnArray) =>
 * {
 *  sql: "UPDATE users SET first_name = $1, last_name = $2"
 *  values: ["fvin2", "I2"]
 * }
 */
function genUpdateSqlObj (tableName, clmnsValsObj, returnArray = []) {
    try {
        if (!savourTableNames.has(tableName)) throw new ExpressError(400, `Table name ${tableName} dosen't exist!`);
        const returnLen = returnArray.length;
        // const isStrict = exactMatch !== false;
        const dataArray = Object.entries(clmnsValsObj);
        const sqlCommand = [sqlCommandsObj["update"]];
        const sqlCommandModifs = [sqlCommandsModifsObj["update"]];
        const columns = [];
        const values = [];
        const sqlArr = [];
        const parametizers = [];
        dataArray.forEach((data, idx) => {
            const operator = sqlOperatorStrict[data[0]];
            const updateSql = [data[0], operator, `$${idx + 1}`].join(" ");
            columns.push(updateSql);
            values.push(data[1]);
        });
        sqlArr.push(sqlCommand.join(" "), tableName, sqlCommandModifs.join(" "), columns.join(", "));
        const returnStmnt = returnLen ? returnArray.join(", ") : "";
        const returnStr = returnLen ? sqlArr.push(`RETURNING ${returnStmnt}`) : null;
        let sql = sqlArr.join(" ");
        return {
            sql,
            values
        };
    } catch (err) {
        const errMsg = err.msg ? err.msg : "Error!";
        const statusCode = err.status ? err.status : 400;
        throw new ExpressError(statusCode, errMsg);
    }
}

/**
 * genInsertSqlObj
 * Creates insert sql query object with parametized values.
 * Arguments: tableName, clmnsValsObj, exactMatch, returnArray
 * clmnsValsObj argument: object with column name keys
        and their values as values.
 * Returns object with sql and values props.
 * const data = [ "first_name", "last_name" ];
 * const returnArray = [ first_name, last_name ];
 * const clmnsValsObj = { first_name: "fvin2", last_name: "I2" };
 * genSql("users", clmnsValsObj, true, returnArray) =>
 * {
 *  sql: "INSERT INTO users (first_name, last_name) VALUES ($1, $2)"
 *  values: ["fvin2", "I2"]
 * }
 */
function genInsertSqlObj (tableName, clmnsValsObj, returnArray = []) {
    try {
        if (!savourTableNames.has(tableName)) throw new ExpressError(400, `Table name ${tableName} dosen't exist!`);
        const returnLen = returnArray.length;
        const dataArray = Object.entries(clmnsValsObj);
        const sqlCommand = [sqlCommandsObj["insert"]];
        const sqlCommandModifs = [sqlCommandsModifsObj["insert"]];
        const columns = [];
        const values = [];
        const sqlArr = [];
        const parametizers = [];
        dataArray.forEach((data, idx) => {
            columns.push(data[0]);
            values.push(data[1]);
            parametizers.push(`$${idx + 1}`);
        });
        sqlArr.push(sqlCommand.join(" "), tableName, "(", columns.join(", "), ")", sqlCommandModifs.join(" "), "(", parametizers.join(", "), ")");
        const returnStmnt = returnLen ? returnArray.join(", ") : "";
        const returnStr = returnLen ? sqlArr.push(`RETURNING ${returnStmnt}`) : null;
        let sql = sqlArr.join(" ");
        sql = sql.replaceAll("( ", "(").replaceAll(" )", ")");
        return {
            sql,
            values
        };
    } catch (err) {
        const errMsg = err.msg ? err.msg : "Error!";
        const statusCode = err.status ? err.status : 400;
        throw new ExpressError(statusCode, errMsg);
    }
}

module.exports = {
    arrayConcat,
    genJoinSql,
    qryObjToOrderBySql,
    genSql, genWhereSqlArr,
    genSelectSql, genUpdateSqlObj,
    genInsertSqlObj
};