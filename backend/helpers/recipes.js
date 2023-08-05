const ExpressError = require("../models/error.js");
// const jsonschema = require("jsonschema");
// const jwt = require("jsonwebtoken");
// const bcrypt = require("bcrypt");
const {
        columnNameCvrs, tableAbrv, sqlOperator,
        orderByChron, recipeQryFilterKeys,
        recipeFilterKeys, orderByKeys
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


module.exports = {
    deleteObjProps, definePropsInObj,
    deletePropsNotInSet,
    isFilter
};