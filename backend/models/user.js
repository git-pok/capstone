const bcrypt = require("bcrypt");
const { validateSchema } = require("../helpers/user.js");
// const jsonschema = require("jsonschema");
const userSchema = require("../schemas/userRegister.json");
const ExpressError = require("./error.js");

class User {
    static register(data) {
        const isValid = validateSchema(data, userSchema);
        if (isValid.errors.length !== 0) {
            const jsonErrors = isValid.errors.map(error => error.message);
            throw new ExpressError(400, jsonErrors);
        }
        
        // else return true;
    }
}

module.exports = User;