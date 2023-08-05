const ExpressError = require("../models/error.js");
// const jsonschema = require("jsonschema");
// const jwt = require("jsonwebtoken");
// const bcrypt = require("bcrypt");
const { tableAbrv, sqlOperator, filterKeys } = require("../config.js");
/**
 * deleteObjProps
 * Deletes properties form an object.
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
 * deletePropsNotInSet
 * Deletes properties form an object.
 * Arguments: props set and object
 * Returns new object.
 * const setProps = { "two" };
 * const obj = { one: 1, two: 2 }
 * deleteObjProps(["one"], obj) => { two: 2 };
 */
function deletePropsNotInSet (propsSet, obj) {
    try {
        for (let prop in obj) {
            if (!propsSet.has(prop)) delete obj[prop];
        }
        return obj;
    } catch (err) {
        throw new ExpressError(400, `${err}`);
    }
}

/**
 * selectJoinSql
 * Creates pg query for recipes.
 * Arguments: columns array, join tables and on columns, table
 * Returns string.
 * allRecipesJoin(["name,", "author"], [["authors", "n.id = r.id"]], "recipes") => 
 * "SELECT name, author FROM recipes JOIN authors ON n.id = r.id";
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
function genWhereSql (whereArrLen, parametizer, sqlExpr) {
    try {
        const sql = whereArrLen < 1 ?
            `WHERE ${sqlExpr} $${parametizer}`
            : `AND ${sqlExpr} $${parametizer}`;
        return sql;
    } catch (err) {
        throw new ExpressError(400, `${err}`);
    }
}

/**
 * isFilter
 * Verifies if qry object has permitted filters.
 * Arguments: qry object
 * Returns boolean.
 * isFilter({ name: "good" }) => true
 */
function isFilter (qry) {
    try {
        const qryArray = Object.entries(qry);
        if (qryArray.length === 0) return false;
        const filterKeys = new Set();
        filterKeys.add("name").add("author").add("rating").add("orderBy");
        const filterExists = qryArray.some(prop => {
            return filterKeys.has(prop[0]);
        });
        return filterExists;
    } catch (err) {
        throw new ExpressError(400, `${err}`);
    }
}

/**
 * filterSql
 * Creates WHERE sql and parametized values.
 * Arguments: qry object
 * Returns object with sql and value properites.
 * filterSql({ name: "good" }) => {
    sql: ["WHERE name ILIKIE $1"],
    values: ["good"]
 * }
 */
function filterSql (qry) {
    try {
        const sqlObj = {
            whereSql: [],
            values: []
        };
        let parametizer = 1;
        const filtersParsed = deletePropsNotInSet(filterKeys, qry);
        const qryArray = Object.entries(filtersParsed);
        qryArray.forEach((prop, idx) => {
            const keyNormlzd = prop[0].toLowerCase().trim() === "author" ? "full_name" : prop[0].toLowerCase().trim();
            if (keyNormlzd !== "orderby") {
                const valNormlzd = prop[1].toLowerCase().trim();
                const tableCode = tableAbrv[prop[0]];
                const queryOperator = sqlOperator[keyNormlzd];
                let sql = `${tableCode}${keyNormlzd} ${queryOperator} $${parametizer}`;
                const value = keyNormlzd !== "rating" ? `%${valNormlzd}%` : +valNormlzd;
                if (!sqlObj.whereSql.length) sql = `WHERE ${sql}`;
                else sql = `AND ${sql}`;
                sqlObj.whereSql.push(sql);
                sqlObj.values.push(value);
                parametizer++;
            }
        });
        return sqlObj;
    } catch (err) {
        throw new ExpressError(400, `${err}`);
    }
}

/**
 * orderBySql
 * Creates ORDER BY sql.
 * Arguments: qry object
 * Returns object with order by values.
 * orderBySql({ name: "good" }) => {
    sql: ["WHERE name ILIKIE $1"],
    values: ["good"]
 * }
 */
    function orderBySql (qry) {
        try {
            const sqlObj = {
                columns: [],
                order: []
            };
            const qryArray = Object.entries(qry);
            qryArray.forEach(prop => {
                const keyNormlzd = prop[0].toLowerCase().trim();
                const valNormlzd = prop[1].toLowerCase().trim();
                const tableCode = tableAbrv[prop[1]];
                if (keyNormlzd === "orderby") {
                    if (valNormlzd === "name" || valNormlzd === "author") {
                        const values = [];
                        values.push(tableCode, valNormlzd);
                        const joinedValues = values.join("");
                        sqlObj.columns.push(joinedValues);
                        sqlObj.order.push("ASC");
                    }
                    else if (valNormlzd === "rating") {
                        const values = [];
                        values.push(tableCode, valNormlzd);
                        const joinedValues = values.join("");
                        sqlObj.columns.push(joinedValues);
                        sqlObj.order.push("DESC, r.name");
                    }
                }
            });
            return sqlObj;
        } catch (err) {
            throw new ExpressError(400, `${err}`);
        }
    }

module.exports = {
    deleteObjProps, deletePropsNotInSet,
    selectJoinSql, genWhereSql, isFilter,
    filterSql, orderBySql
};