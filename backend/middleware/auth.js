const SECRET_KEY = require("../keys.js");
const ExpressError = require("../models/error.js");

const {
    validateSchema, hashPassword, generateToken,
    decodeToken, verifyPassword
} = require("../helpers/users.js");

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
 * isLoggedIn
 * Searches for the user object,
 * if found, authorizes user.
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

/**
 * isCurrUser
 * Searches for user object,
 * if user matches current user,
 * authorizes.
 */
function isCurrUser(req, res, next) {
    try {
        const payload = res.user[0] || [];
        const { userUsername: user = false, userId = false } = payload;
        const { username = false, id = false } = req.params;
        // console.log("payload", payload);
        if (user) if (user === username) return next();
        if (userId) if (userId === +id) return next();
        const error = new ExpressError(400, "Must be current user!");
        return next(error);
    } catch(err) {
        throw new ExpressError(400, `${err}`);
    }
}

module.exports = {
    authenticateToken, isLoggedIn,
    isCurrUser
};