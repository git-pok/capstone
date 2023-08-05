// const bcrypt = require("bcrypt");
const {
        db, allRecipesSelect, selectLikRecUsrId,
        selectDisRecUsrId,
        recipeJoinData, likRecipeJoinData,
        disRecipeJoinData
    } = require("../config.js");
const {
        genInsertSql, genUpdateSql,
        genWhereSql, genSqlStrFromExp,
        selectJoinSql, QryObjToGenWhereSql,
        qryObjToOrderBySql
    } = require("../helpers/sql.js");

const {
    deleteObjProps, definePropsInObj,
    deletePropsNotInSet
} = require("../helpers/recipes.js");
// const SECRET_KEY = require("../keys.js");
// const jsonschema = require("jsonschema");
const userSchema = require("../schemas/userRegister.json");
const loginSchema = require("../schemas/userLogin.json");
const userEditSchema = require("../schemas/userEdit.json");
const ExpressError = require("./error.js");


/**
 * Recipe
 * Smart Class
 * Logics for recipe routes.
 */
class Recipe {

    /**
     * getRecipe
     * Retrieves a recipe.
     * Arguments: recipe id
     * getRecipe(id) =>
     * recipe: {
		name: "Sausage ...",
        author: "Vin...",
        ...
	* }
     */
    static async getRecipe(id) {
        const dbRecipe = await db.query(`SELECT * FROM recipes WHERE id = $1`, [id]);
        const dbRecipeRows = JSON.parse(JSON.stringify(dbRecipe.rows));
        const dbRecipeRowsLength = dbRecipe.rows.length;
        if (dbRecipeRowsLength === 0) throw new ExpressError(400, "Recipe not found!");
        const dbRecipeRowsObj = JSON.parse(JSON.stringify(dbRecipeRows[0]));
        const whereObj = { id: dbRecipeRowsObj.id };
        const selectSql = selectJoinSql(allRecipesSelect, "recipes r", recipeJoinData);
        const likSelectSql = selectJoinSql(selectLikRecUsrId, "recipes r", likRecipeJoinData);
        const disSelectSql = selectJoinSql(selectDisRecUsrId, "recipes r", disRecipeJoinData);
        const sqlWhereObj = genWhereSql(whereObj);
        const selectQry = genSqlStrFromExp(selectSql, sqlWhereObj);
        const likQry = genSqlStrFromExp(likSelectSql, sqlWhereObj);
        const disQry = genSqlStrFromExp(disSelectSql, sqlWhereObj);
        const pgValues = sqlWhereObj.values;
        const selectRecipesReq = await db.query(
            `${selectQry}`, pgValues
        );
        const likRecipesReq = await db.query(
            `${likQry}`, pgValues
        );
        const disRecipesReq = await db.query(
            `${disQry}`, pgValues
        );
        const likUsrIds = likRecipesReq.rows.map(obj => obj.liked_user_id);
        const disUsrIds = disRecipesReq.rows.map(obj => obj.disliked_user_id);
        const propsAndVals = [["liked_user_ids", [...likUsrIds]], ["disliked_user_ids", [...disUsrIds]]];
        const recipeObject = definePropsInObj(propsAndVals, selectRecipesReq.rows[0]);
        return recipeObject;
    }

    /**
     * getRecipes
     * Retrieves all recipes.
     * Arguments: none
     * getRecipes() =>
     * recipes: {
		name: "Sausage ...",
        author: "Vin...",
        ...
	* },
    * {
		name: "Sausage ...",
        author: "Vin...",
        ...
	* }
     */
    static async getRecipes() {
        const selectSql = selectJoinSql(allRecipesSelect, "recipes r", recipeJoinData);
        // console.log("SELECT SQL", selectSql);
        const recipesReq = await db.query(
            `${selectSql} ORDER BY name ASC`
        );
        const recipeRows = recipesReq.rows;
        return recipeRows;
    }

    /**
     * recipesFilter
     * Filters recipes by name, author, or rating.
     * Arguments: query paramns object
     * recipesFilter(author) =>
     * recipes: {
		name: "Sausage ...",
        author: "Vin...",
        ...
	* },
    * {
		name: "Sausage ...",
        author: "Vin...",
        ...
	* }
     */
    static async recipesFilter(qryParams) {
        const finalSql = [];
        const selectSql = selectJoinSql(allRecipesSelect, "recipes r", recipeJoinData);
        const whereSqlObj = QryObjToGenWhereSql(qryParams);
        const orderByStr = qryObjToOrderBySql(qryParams);
        const whereSqlQry = whereSqlObj.whereSql.join(" ");
        const orderBy = orderByStr ? "ORDER BY" : "";
        const pgValuesQry = whereSqlObj.values;
        finalSql.push(selectSql, whereSqlQry, orderBy, orderByStr);
        const finalSqlQry = finalSql.join(" ");
        // console.log("FINAL SQL", finalSqlQry);
        const recipesReq = await db.query(
            `${finalSqlQry}`, pgValuesQry
        );
        return recipesReq.rows;
    }
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
    // static async register(data) {
    //     const isValid = validateSchema(data, userSchema);
    //     if (isValid.errors.length !== 0) {
    //         const jsonErrors = isValid.errors.map(error => error.message);
    //         throw new ExpressError(400, jsonErrors);
    //     }
    //     const { is_admin } = data;
    //     if (is_admin !== undefined) throw new ExpressError(400, "Cannot use is_admin property!");
    //     const { password, username } = data;
    //     const hashedPw = await hashPassword(password);
    //     data["password"] = hashedPw;
    //     const returnValues = Array.from(Object.keys(data));
    //     const sqlReturn = ["id", ...returnValues];
    //     const { sql, values } = genInsertSql("users", data, "INSERT INTO", sqlReturn);
    //     const duplicate = await db.query(`SELECT * FROM users WHERE username = $1`, [username]);
    //     const dupRowsLength = duplicate.rows.length;
    //     if (dupRowsLength !== 0) throw new ExpressError(400, "Username exists already!"); 
    //     const results = await db.query(sql, values);
    //     const resultsRow = JSON.parse(JSON.stringify(results.rows[0]));
    //     const { id } = resultsRow;
    //     delete resultsRow["password"];
    //     const token = generateToken({username, id}, SECRET_KEY);
    //     resultsRow["token"] = token;
    //     return resultsRow;
    // }

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
    // static async login(data) {
    //     const isValid = validateSchema(data, loginSchema);
    //     if (isValid.errors.length !== 0) {
    //         const jsonErrors = isValid.errors.map(error => error.message);
    //         throw new ExpressError(400, jsonErrors);
    //     }
    //     const { password, username } = data;
    //     const user = await db.query(`SELECT * FROM users WHERE username = $1`, [username]);
    //     const userRows = user.rows[0];
    //     const userRowsLength = user.rows.length;
    //     if (userRowsLength === 0) throw new ExpressError(400, "User doesn't exist!");
    //     const dbPw = userRows.password;
    //     const pwVerify = await verifyPassword(password, dbPw);
    //     if (!pwVerify) throw new ExpressError(400, "Invalid password!"); 
    //     const userId = userRows.id;
    //     const userUsername = userRows.username;
    //     const token = generateToken({userUsername, userId}, SECRET_KEY);
    //     return {
    //         id: userId,
    //         username: userUsername,
    //         token
    //     };
    // }

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
    // static async editUser(data, username) {
    //     const isValid = validateSchema(data, userEditSchema);
    //     if (isValid.errors.length !== 0) {
    //         const jsonErrors = isValid.errors.map(error => error.message);
    //         throw new ExpressError(400, jsonErrors);
    //     }
    //     const { is_admin } = data;
    //     if (is_admin !== undefined) throw new ExpressError(400, "Cannot edit is_admin!");
    //     const { password } = data;
    //     if (password !== undefined) data["password"] = await hashPassword(password);
    //     const dbUser = await db.query(`SELECT * FROM users WHERE username = $1`, [username]);
    //     const dbUserRows = dbUser.rows[0];
    //     const dbUserRowsLength = dbUser.rows.length;
    //     if (dbUserRowsLength === 0) throw new ExpressError(400, "User not found!");
    //     const { sql, values } = genUpdateSql(data);
    //     const valuesLength = values.length + 1;
    //     const parametizedId = `$${valuesLength}`;
    //     const user = await db.query(`
    //         UPDATE users SET ${sql}
    //         WHERE username = ${parametizedId} RETURNING
    //         id, username, first_name, last_name,
    //         email, phone, header_img, profile_img`,
    //         [...values, username]
    //     );
    //     const userUpdateRows = user.rows[0];
    //     return userUpdateRows;
    // }

    /**
     * deleteUser
     * Deletes a user.
     * Returns deleted message.
     * deleteUser(username) => { message: deleted username! }
     */
    // static async deleteUser(username) {
    //     const dbUser = await db.query(`SELECT * FROM users WHERE username = $1`, [username]);
    //     const dbUserRowsLength = dbUser.rows.length;
    //     if (dbUserRowsLength === 0) throw new ExpressError(400, "User not found!");
    //     await db.query(`DELETE FROM users WHERE username = $1`, [username]);
    // }
}

module.exports = Recipe;