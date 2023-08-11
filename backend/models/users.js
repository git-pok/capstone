// const bcrypt = require("bcrypt");
const Recipe = require("./recipes.js");
const {
    db, userSqlReturnNoAbrv,
    recipesRelDataSelectColumns,
    recipesOnData,
    favRecipesjoinArr, favRecpesClmnToTblAbrev,
    savedRecipesjoinArr, savedRecpesClmnToTblAbrev
} = require("../config.js");
const {
        arrayConcat,
        genWhereSqlArr, genJoinSql,
        genSelectSql, genUpdateSqlObj,
        genInsertSqlObj, recipeUsrExists
    } = require("../helpers/sql.js");
const {
        validateSchema, hashPassword, generateToken,
        decodeToken, verifyPassword
    } = require("../helpers/users.js");
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
     * Returns the object of submitted data and a token.
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
        const insertSqlObj = genInsertSqlObj("users", data, sqlReturn);
        // console.log("insertSqlObj", insertSqlObj);
        const duplicate = await db.query(`SELECT * FROM users WHERE username = $1`, [username]);
        const dupRowsLength = duplicate.rows.length;
        if (dupRowsLength !== 0) throw new ExpressError(400, "Username exists already!");
        const results = await db.query(insertSqlObj.sql, insertSqlObj.values);
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
        const dbUserRowsLength = dbUser.rows.length;
        if (dbUserRowsLength === 0) throw new ExpressError(404, "User not found!");
        const dbUserRows = JSON.parse(JSON.stringify(dbUser.rows[0]));
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
        if (dbUserRowsLength === 0) throw new ExpressError(404, "User not found!");
        const sqlReturn = [...userSqlReturnNoAbrv];
        const sqlObj = genUpdateSqlObj("users", data);
        const prmTzr = sqlObj.values.length + 1;
        const whereSqlObj = genWhereSqlArr({ username }, prmTzr, true, [...userSqlReturnNoAbrv, "is_admin"]);
        const whereSqlCmds = whereSqlObj.whereSql;
        const pgVals = [...sqlObj.values, ...whereSqlObj.values];
        // console.log("FINAL SQL", `${sqlObj.sql} ${whereSqlCmds}`, pgVals);
        const user = await db.query(
            `${sqlObj.sql} ${whereSqlCmds}`,
            pgVals
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
        if (dbUserRowsLength === 0) throw new ExpressError(404, "User not found!");
        await db.query(`DELETE FROM users WHERE username = $1`, [username]);
    }

    /**
     * getFavRecipes
     * Retrives user's favorite recipes.
     * Returns array of favorite recipes.
     * getFavRecipes(id) => [{ name: "chicken", ...}, ...]
     */
    static async getFavRecipes (id) {
        // Check if user exists.
        await recipeUsrExists("user", "id", "users", id, "id");
        
        const selectSqlStr = genSelectSql(recipesRelDataSelectColumns, "favorite_recipes", true);
        const joinSqlStr = genJoinSql(favRecipesjoinArr, "JOIN");
        const selectJoinSqlStr = arrayConcat([selectSqlStr, joinSqlStr]);
        // Creates object with where sql and values properties.
        const whereObj = { user_id: id };
        const sqlWhereObj = genWhereSqlArr(whereObj, 1, true, false, true, favRecpesClmnToTblAbrev);
        const sql = arrayConcat([selectJoinSqlStr, sqlWhereObj.whereSql]);
        
        const favRecipes = await db.query(`
            ${sql} ORDER BY r.name, rt.rating
        `, sqlWhereObj.values);
        return favRecipes.rows;
    }

    /**
     * getSavedRecipes
     * Retrives user's saved recipes.
     * Returns array of saved recipes.
     * getSavedRecipes(id) => [{ name: "chicken", ...}, ...]
     */
    static async getSavedRecipes (id) {
        await recipeUsrExists("user", "id", "users", id, "id");
        const selectSqlStr = genSelectSql(recipesRelDataSelectColumns, "saved_recipes", true);
        const joinSqlStr = genJoinSql(savedRecipesjoinArr, "JOIN");
        const selectJoinSqlStr = arrayConcat([selectSqlStr, joinSqlStr]);
        // Creates object with where sql and values properties.
        const whereObj = { user_id: id };
        const sqlWhereObj = genWhereSqlArr(whereObj, 1, true, false, true, savedRecpesClmnToTblAbrev);
        const sql = arrayConcat([selectJoinSqlStr, sqlWhereObj.whereSql]);

        const savedRecipes = await db.query(`
            ${sql} ORDER BY r.name, rt.rating
        `, sqlWhereObj.values);
        return savedRecipes.rows;
    }

    /**
     * getRecipeLists
     * Retrives user's recipelists.
     * Returns array of recipelists.
     * getRecipeLists(id) => [{ "weekly meal prep", ...}, ...]
     */
    static async getRecipeLists (id) {
        await recipeUsrExists("user", "id", "users", id, "id");
        const recipeListsSelStr = genSelectSql(["rl.id", "rl.list_name"], "recipelists", true);
        const abrevTable = { user_id: "rl." };
        const whereSqlObj = genWhereSqlArr({ user_id: id }, 1, true, false, true, abrevTable);
        const reqSqlArr = [recipeListsSelStr, whereSqlObj.whereSql];
        const reqSql = reqSqlArr.join(" ");
        const req = await db.query(`
            ${reqSql}
        `, whereSqlObj.values);
        return req.rows;
    }

    /**
     * getListRecipes
     * Retrives a recipelists recipes.
     * Returns array of recipes
     * getListRecipes(id) => [{ name: "chicken", ...}, ...]
     */
    static async getListRecipes (id, listId) {
        await recipeUsrExists("user", "id", "users", id, "id");
        const recipeListSelStr = genSelectSql(recipesRelDataSelectColumns, "recipelists_recipes", true);
        const joinArr = [["recipes", "rlr.recipe_id", "r.id"]];
        const joinSql1 = genJoinSql(joinArr, "JOIN");
        const joinSql2 = genJoinSql(recipesOnData, "JOIN");
        const joinSql = [joinSql1, joinSql2].join(" ");
        const abrevTable = { list_id: "rlr." };
        const whereSqlObj = genWhereSqlArr({ list_id: listId }, 1, true, false, true, abrevTable);
        const reqSqlArr = [recipeListSelStr, joinSql, whereSqlObj.whereSql];
        const reqSql = reqSqlArr.join(" ");

        const req = await db.query(`
            ${reqSql}
        `, whereSqlObj.values);

        const recipeRows = req.rows;
        return recipeRows;
    }
}

module.exports = User;