// const bcrypt = require("bcrypt");
const { db } = require("../config.js");
const { genInsertSql, genUpdateSql } = require("../helpers/sql.js");
const {
        validateSchema, hashPassword, generateToken,
        decodeToken, verifyPassword
    } = require("../helpers/user.js");
const SECRET_KEY = require("../keys.js");
// const jsonschema = require("jsonschema");
const userSchema = require("../schemas/userRegister.json");
const loginSchema = require("../schemas/userLogin.json");
const userEditSchema = require("../schemas/userEdit.json");
const ExpressError = require("./error.js");


/**
 * User
 * Smart Class
 * Logics for user routes.
 */
class User {
    /**
     * register
     * Registers a user.
     * Returns the submitted data and a token.
     * const data = {
		"username": "fin",
		"first_name": "Vin",
		"last_name": "I",
		"email": "bank@g.com",
		"phone": "813 507 4490",
		"header_img": "testHeaderImage",
		"profile_img": "testProfileImage",
        password: "password"
	* }
     * register(data) =>
     * user: {
        id: 1,
		username: "fin",
		first_name: "Vin",
		last_name: "I",
		email: "bank@g.com",
		phone: "813 507 4490",
		header_img: "testHeaderImage",
		profile_img: "testProfileImage",
		token: "eyJhbGciOiJIUzI1N"
	* }
     */
    static async register(data) {
        const isValid = validateSchema(data, userSchema);
        if (isValid.errors.length !== 0) {
            const jsonErrors = isValid.errors.map(error => error.message);
            throw new ExpressError(400, jsonErrors);
        }
        const { is_admin } = data;
        if (is_admin !== undefined) throw new ExpressError(400, "Cannot use is_admin property!");
        const { password, username } = data;
        const hashedPw = await hashPassword(password);
        data["password"] = hashedPw;
        const returnValues = Array.from(Object.keys(data));
        const sqlReturn = ["id", ...returnValues];
        const { sql, values } = genInsertSql("users", data, "INSERT INTO", sqlReturn);
        const duplicate = await db.query(`SELECT * FROM users WHERE username = $1`, [username]);
        const dupRowsLength = duplicate.rows.length;
        if (dupRowsLength !== 0) throw new ExpressError(400, "Username exists already!"); 
        const results = await db.query(sql, values);
        const resultsRow = JSON.parse(JSON.stringify(results.rows[0]));
        const { id } = resultsRow;
        delete resultsRow["password"];
        const token = generateToken({username, id}, SECRET_KEY);
        resultsRow["token"] = token;
        return resultsRow;
    }

    /**
     * login
     * Returns a token.
     * const data = {
		username: "fin",
        password: "password"
	* }
     * login(data) =>
     * user: {
        id: 1
		username: "fin",
		token: "eyJhbGciOiJIUzI1N"
	* }
     */
    static async login(data) {
        const isValid = validateSchema(data, loginSchema);
        if (isValid.errors.length !== 0) {
            const jsonErrors = isValid.errors.map(error => error.message);
            throw new ExpressError(400, jsonErrors);
        }
        const { password, username } = data;
        const user = await db.query(`SELECT * FROM users WHERE username = $1`, [username]);
        const userRows = user.rows[0];
        const userRowsLength = user.rows.length;
        if (userRowsLength === 0) throw new ExpressError(400, "User doesn't exist!");
        const dbPw = userRows.password;
        const pwVerify = await verifyPassword(password, dbPw);
        if (!pwVerify) throw new ExpressError(400, "Invalid password!"); 
        const userId = userRows.id;
        const userUsername = userRows.username;
        const token = generateToken({userUsername, userId}, SECRET_KEY);
        return {
            id: userId,
            username: userUsername,
            token
        };
    }

    /**
     * getUser
     * Retrieves a user.
     * Returns user with data.
     * getUser(id) =>
     * user: {
		username: "fin2",
        first_name: "fin",
        ...
	* }
     */
    static async getUser(username) {
        const dbUser = await db.query(`SELECT * FROM users WHERE username = $1`, [username]);
        const dbUserRows = JSON.parse(JSON.stringify(dbUser.rows[0]));
        const dbUserRowsLength = dbUser.rows.length;
        if (dbUserRowsLength === 0) throw new ExpressError(400, "User not found!");
        delete dbUserRows["password"];
        return dbUserRows;
    }

    /**
     * editUser
     * Edits a user.
     * Returns user with updated data.
     * const data = {
		username: "fin2",
        password: "password"
	* }
     * editUser(data) =>
     * user: {
		username: "fin2",
        first_name: "fin",
        ...
	* }
     */
    static async editUser(data, username) {
        const isValid = validateSchema(data, userEditSchema);
        if (isValid.errors.length !== 0) {
            const jsonErrors = isValid.errors.map(error => error.message);
            throw new ExpressError(400, jsonErrors);
        }
        const { is_admin } = data;
        if (is_admin !== undefined) throw new ExpressError(400, "Cannot edit is_admin!");
        const { password } = data;
        if (password !== undefined) data["password"] = await hashPassword(password);
        const dbUser = await db.query(`SELECT * FROM users WHERE username = $1`, [username]);
        const dbUserRows = dbUser.rows[0];
        const dbUserRowsLength = dbUser.rows.length;
        if (dbUserRowsLength === 0) throw new ExpressError(400, "User not found!");
        const { sql, values } = genUpdateSql(data);
        const valuesLength = values.length + 1;
        const parametizedId = `$${valuesLength}`;
        const user = await db.query(`
            UPDATE users SET ${sql}
            WHERE username = ${parametizedId} RETURNING
            id, username, first_name, last_name,
            email, phone, header_img, profile_img`,
            [...values, username]
        );
        const userUpdateRows = user.rows[0];
        return userUpdateRows;
    }

    /**
     * deleteUser
     * Deletes a user.
     * Returns deleted message.
     * deleteUser(username) => { message: deleted username! }
     */
    static async deleteUser(username) {
        const dbUser = await db.query(`SELECT * FROM users WHERE username = $1`, [username]);
        const dbUserRowsLength = dbUser.rows.length;
        if (dbUserRowsLength === 0) throw new ExpressError(400, "User not found!");
        await db.query(`DELETE FROM users WHERE username = $1`, [username]);
    }
}

module.exports = User;