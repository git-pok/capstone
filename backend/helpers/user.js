const ExpressError = require("../models/error.js");
const jsonschema = require("jsonschema");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { BCRYPT_WORK_FACTOR } = require("../config.js");

function validateSchema (data, schema) {
    try {
        const result = jsonschema.validate(data, schema);
        return result;
    } catch (err) {
        throw new ExpressError(400, "Bad request!");
    }
}

async function hashPassword (password) {
    try {
        const hashedPW = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);
        return hashedPW;
    } catch (err) {
        throw new ExpressError(400, err);
    }
}

function generateToken (payload, SECRET_KEY) {
    try {
        const token = jwt.sign(payload, SECRET_KEY);
        return token;
    } catch (err) {
        throw new ExpressError(400, err);
    }
}

function decodeToken (token, SECRET_KEY) {
    try {
        const payload = jwt.verify(token, SECRET_KEY);
        return payload;
    } catch (err) {
        throw new ExpressError(400, err);
    }
}

module.exports = {
    validateSchema, hashPassword, generateToken, decodeToken
};