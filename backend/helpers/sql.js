const ExpressError = require("../models/error.js");
const {
    columnNameCvrs, tableAbrv, sqlOperator,
    sqlOperatorStrict, sqlCommandsObj,
    sqlCommandsModifsObj, orderByChron,
    recipeFilterKeys, orderByKeys,
    selectRecipesColumns, isNumbers
} = require("../config.js");


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

/**
 * selectJoinSql
 * Creates pg select query for recipes.
 * Arguments: select sql array, table, and join and on values
 * Returns string.
 * allRecipesJoin(["r.name,", "a.full_name"], "recipes r", [["authors", "r.author_id = a.id "]]) => 
 * "SELECT r.name, a.full_name FROM recipes r JOIN authors a ON r.author_id = a.id";
 */
function selectJoinSql (selectSqlArr, table, joinArr = []) {
    try {
        const finalSql = ["SELECT"];
        const joinedSqlArr = selectSqlArr.join(" ");
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
 * QryObjToGenWhereSql
 * Creates WHERE sql and parametized values.
 * Arguments: qry object
 * Returns object of where sql.
 * QryObjToGenWhereSql({ name: "good" }) => {
    whereSql: ["WHERE name ILIKIE $1"],
    values: ["%good%"]
 * }
 */
function QryObjToGenWhereSql (qry) {
    try {
        const sqlObj = {
            whereSql: [],
            values: []
        };
        let parametizer = 1;
        const filtersParsed = deletePropsNotInSet(recipeFilterKeys, qry);
        const qryArray = Object.entries(filtersParsed);
        qryArray.forEach((prop, idx) => {
            const keyNormlzd = columnNameCvrs[prop[0].toLowerCase().trim()];
            const valNormlzd = prop[1].toLowerCase().trim();
            const tableCode = tableAbrv[prop[0]];
            const queryOperator = sqlOperator[keyNormlzd];
            const column = [tableCode, keyNormlzd];
            const columnJoin = column.join("");
            const sql = [columnJoin, queryOperator, `$${parametizer}`];
            const value = keyNormlzd !== "rating" ? `%${valNormlzd}%` : +valNormlzd;
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
 * qryObjToOrderBySql
 * Creates ORDER BY sql.
 * Arguments: qry object
 * Returns string with order by statement.
 * qryObjToOrderBySql({ orderBy: "name", chronOrder: "DESC" }) => "r.name DESC"
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
        const finalOrder = [];
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
function genWhereSqlArr (columnValObj, parametizer, strict = false, returning = false) {
    try {
        const sqlObj = {
            whereSql: [],
            values: []
        };
        // let parametizer = 1;
        const isStrict = strict !== false;
        const isReturn = returning !== false;
        const returnCommand = returning !== false ? ["RETURNING"] : [""];
        // const filtersParsed = deletePropsNotInSet(selectRecipesColumns, columnValObj);
        const qryArray = Object.entries(columnValObj);
        qryArray.forEach((prop, idx) => {
            const isValNumber = Number.isInteger(prop[1]);
            const keyNormlzd = columnNameCvrs[prop[0].toLowerCase().trim()];
            const valNormlzd = !isValNumber ? prop[1].toLowerCase().trim() : prop[1];
            const queryOperator = isStrict ? sqlOperatorStrict[keyNormlzd] : sqlOperator[keyNormlzd];
            const column = [keyNormlzd];
            const columnJoin = column.join("");
            const sql = [columnJoin, queryOperator, `$${parametizer}`];
            const cmndValue = isStrict ? `${valNormlzd}` : `%${valNormlzd}%`;
            const value = !isNumbers.has(keyNormlzd) ? cmndValue : +valNormlzd;
            if (!sqlObj.whereSql.length) sqlObj.whereSql.push("WHERE", ...sql);
            else sqlObj.whereSql.push("AND", ...sql);
            sqlObj.values.push(value);
            parametizer++;
        });
        // console.log("%#%#%#%#%#%#% IS RETURNING", returning);
        const returnStmnt = isReturn ? returning.join(", ") : "";
        // console.log("%#%#%#%#%#%#% returnStmnt", returnStmnt);
        const returnStr = isReturn ? sqlObj.whereSql.push(`RETURNING ${returnStmnt}`) : null;
        // console.log("%#%#%#%#%#%#% sqlArr", sqlObj.whereSql);
        return sqlObj;
    } catch (err) {
        throw new ExpressError(400, `${err}`);
    }
}

module.exports = {
    genUpdateSql, genWhereSql,
    genSqlStrFromExp, selectJoinSql,
    QryObjToGenWhereSql, qryObjToOrderBySql,
    genSql, genWhereSqlArr
};