const ExpressError = require("../models/error.js");
// const jsonschema = require("jsonschema");
// const jwt = require("jsonwebtoken");
// const bcrypt = require("bcrypt");
const {
        columnNameCvrs, tableAbrv, sqlOperator,
        orderByChron, recipeQryFilterKeys,
        filterKeys, orderByKeys
    } = require("../config.js");
/**
 * deleteObjProps
 * Deletes properties from an object.
 * Arguments: props array and object
 * Returns new object.
 * const obj = { one: 1, two: 2 }
 * deleteObjProps(["one"], obj) => { two: 2 };
 */
function deleteObjProps (propsArr, obj) {
    try {
        propsArr.forEach(prop => {
            delete obj[prop];
        })
        return obj;
    } catch (err) {
        throw new ExpressError(400, `${err}`);
    }
}

/**
 * definePropsInObj
 * Defines properties in an object.
 * Arguments: props array and object
 * Returns new object.
 * const obj = { two: 2 }
 * definePropsInObj(["one", 1], obj) => { one: 1, two: 2 };
 */
function definePropsInObj (propsArr, obj) {
    try {
        const objCopy = JSON.parse(JSON.stringify(obj));
        propsArr.forEach(prop => {
            objCopy[prop[0]] = prop[1];
        });
        return objCopy;
    } catch (err) {
        throw new ExpressError(400, `${err}`);
    }
}

/**
 * deletePropsNotInSet
 * Deletes properties form an object if in set.
 * Arguments: props set and object
 * Returns new object.
 * const setProps = { "two" };
 * const obj = { one: 1, two: 2 }
 * deleteObjProps(["one"], obj) => { two: 2 };
 */
function deletePropsNotInSet (propsSet, obj) {
    try {
        const newObj = JSON.parse(JSON.stringify(obj))
        for (let prop in newObj) {
            if (!propsSet.has(prop)) delete newObj[prop];
        }
        return newObj;
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
 * genWhereSql
 * Creates WHERE or AND statement based off of array length.
 * Arguments: Array length, pg value sanitize level, sql expression
 * Returns sql.
 * genWhereSql(1, 1, "r.name ILIKE") => ["AND r.name ILIKE $1"];
 */
// function genWhereSql (whereArrLen, parametizer, sqlExpr) {
//     try {
//         const sql = whereArrLen < 1 ?
//             `WHERE ${sqlExpr} $${parametizer}`
//             : `AND ${sqlExpr} $${parametizer}`;
//         return sql;
//     } catch (err) {
//         throw new ExpressError(400, `${err}`);
//     }
// }

/**
 * isFilter
 * Verifies if qry object has permitted filters.
 * Arguments: qry object
 * Returns boolean.
 * isFilter({ name: "good" }) => true
 */
function isFilter (qry, filters = recipeQryFilterKeys) {
    try {
        const qryArray = Object.entries(qry);
        if (qryArray.length === 0) return false;
        const filterExists = qryArray.some(prop => {
            return filters.has(prop[0]);
        });
        return filterExists;
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
        const filtersParsed = deletePropsNotInSet(filterKeys, qry);
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


module.exports = {
    deleteObjProps, definePropsInObj,
    deletePropsNotInSet,
    selectJoinSql, QryObjToGenWhereSql, isFilter,
    qryObjToOrderBySql
};