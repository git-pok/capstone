const SECRET_KEY = require("../keys.js");
const ExpressError = require("../models/error.js");

const {
    validateSchema, hashPassword, generateToken,
    decodeToken, verifyPassword
} = require("../helpers/user.js");

/**
 * authenticateToken
 * Searches for a token.
 * Places token on response object.
 */
function authenticateToken(req, res, next) {
    try {
        const reqHeader = req.headers._token;
        const reqToken = reqHeader ? reqHeader.replace("Bearer ", "") : null;
        if (reqToken) {
            const payload = decodeToken(reqToken, SECRET_KEY)
            res.user = [ payload ];
            // console.log(res.user);
        }
        else res.user = [];
        return next();
    } catch(err) {
        throw new ExpressError(400, `${err}`);
    }
}

/**
 * authenticateToken
 * Searches for a token.
 * Places token on response object.
 */
function isLoggedIn(req, res, next) {
    try {
        const payload = res.user;
        // console.log(payload);
        if (!payload.length) {
            const error = new ExpressError(400, "Must be logged in");
            return next(error);
        }
        else return next();
    } catch(err) {
        throw new ExpressError(400, `${err}`);
    }
}

module.exports = { authenticateToken, isLoggedIn };