const ExpressError = require("../models/error.js");
const jsonschema = require("jsonschema");

function validateSchema (data, schema) {
    try {
        const result = jsonschema.validate(data, schema);
        return result;
    } catch (err) {
        throw new ExpressError(400, "Bad request!");
    }
}

module.exports = { validateSchema };