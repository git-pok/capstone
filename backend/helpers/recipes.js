const ExpressError = require("../models/error.js");
// const jsonschema = require("jsonschema");
// const jwt = require("jsonwebtoken");
// const bcrypt = require("bcrypt");
// const { BCRYPT_WORK_FACTOR } = require("../config.js");

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
 * allRecipesJoin
 * Creates pg query for all recipes.
 * Arguments: empty sql array
 * Returns sql array.
 * allRecipesJoin() => ["SELECT r.id, r.name..."];
 */
function allRecipesJoin (selectSql = []) {
    try {
        selectSql.push(`
            SELECT r.id, r.name, a.full_name AS author, rt.rating,
            rt.vote_count, r.url, r.image, r.description,
            r.serves, r.steps, r.prep_time, r.cook_time FROM recipes r
            JOIN authors a ON r.author_id = a.id
            JOIN ratings rt ON r.id = rt.recipe_id
        `);
        return selectSql;
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
        // parametizer++;
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

module.exports = {
    deleteObjProps, allRecipesJoin,
    genWhereSql, isFilter
};