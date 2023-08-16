const ExpressError = require("../models/error.js");
const {
        recipesFltrKeyToClmnName,
        recipeQryFilterKeys
    } = require("../config.js");

/**
 * definePropsPure
 * Defines properties in an object.
 * Arguments: props array and object
 * Returns new object.
 * const obj = { two: 2 }
 * definePropsPure([["one", 1]], obj) => { one: 1, two: 2 };
 */
function definePropsPure (propsArr, obj) {
    try {
        if (!Array.isArray(propsArr)) throw new ExpressError(400, "Invalid data type for propsArr!");
        const objCopy = JSON.parse(JSON.stringify(obj));
        propsArr.forEach(prop => {
            objCopy[prop[0]] = prop[1];
        });
        return objCopy;
    } catch (err) {
        const errMsg = err.msg ? err.msg : `${err}`;
        const statusCode = err.status ? err.status : 400;
        throw new ExpressError(statusCode, errMsg);
    }
}

/**
 * defineProps
 * Defines properties in an object.
 * Arguments: props array and object
 * Returns undefined.
 * const obj = { two: 2 }
 * defineProps([["one", 1]], obj) => { one: 1, two: 2 };
 */
function defineProps (propsArr, obj) {
    try {
        if (!Array.isArray(propsArr)) throw new ExpressError(400, "Invalid data type for propsArr!");
        propsArr.forEach(prop => {
            obj[prop[0]] = prop[1];
        });
    } catch (err) {
        const errMsg = err.msg ? err.msg : `${err}`;
        const statusCode = err.status ? err.status : 400;
        throw new ExpressError(statusCode, errMsg);
    }
}


module.exports = {
    definePropsPure, defineProps
};