// const bcrypt = require("bcrypt");
const { db } = require("../config.js");
const { genInsertSql, genUpdateSql } = require("../helpers/sql.js");
const {
    allRecipesJoin, genWhereSql,
    filterSql, orderBySql
} = require("../helpers/recipes.js");
const {
        deleteObjProps
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
        const joinData = await db.query(`
            SELECT full_name, level, main_cat_name,
            sub_cat_name FROM recipes r
            JOIN authors a ON r.author_id = a.id
            JOIN difficulty d ON r.difficulty_id = d.id
            JOIN main_category m ON r.main_category_id = m.id
            JOIN sub_category s ON r.sub_category_id = s.id
            WHERE r.id = $1`, [dbRecipeRowsObj.id]
        );
        const recipeJoinRows = joinData.rows;
        const { full_name, level, main_cat_name, sub_cat_name } = recipeJoinRows[0];
        const propsToDelete = ["author_id", "difficulty_id", "main_category_id", "sub_category_id"];
        const newObj = deleteObjProps(propsToDelete, dbRecipeRowsObj);
        newObj.author = full_name
        newObj.difficulty = level
        newObj.main_category = main_cat_name
        newObj.sub_category = sub_cat_name
        return newObj;
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
        const selectSql = allRecipesJoin();
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
        // const qryEntries = Object.entries(qryParams);
        const selectSql = allRecipesJoin();
        // const whereSql = [];
        // const pgValues = [];
        // const orderBySql = ["ORDER BY"];
        // let parametizer = 1;

        // qryEntries.forEach(qryData => {
        //     const whereSqlLength = whereSql.length;
        //     const qryKeyNrmlzd = qryData[0].toLowerCase().trim();
        //     const qryValNrmlzd = qryData[1].toLowerCase().trim();
        //     let sql;
        //     if (qryKeyNrmlzd === "author") sql = genWhereSql(whereSqlLength, parametizer, "a.full_name ILIKE");
        //     else if (qryKeyNrmlzd === "name") sql = genWhereSql(whereSqlLength, parametizer, "r.name ILIKE");    
        //     else if (qryKeyNrmlzd === "rating") sql = genWhereSql(whereSqlLength, parametizer, "rt.rating =");
        //     whereSql.push(sql);
        //     parametizer++;
        //     if (qryKeyNrmlzd === "rating") pgValues.push(+qryValNrmlzd)  
        //     else if (qryKeyNrmlzd !== "orderby") pgValues.push(`%${qryValNrmlzd}%`);
            
        //     if (qryKeyNrmlzd === "orderby") {
        //         if (qryValNrmlzd === "name") orderBySql.push(`r.${qryValNrmlzd} ASC`);
        //         else if (qryValNrmlzd === "author") orderBySql.push(`${qryValNrmlzd} ASC`);
        //         else if (qryValNrmlzd === "rating") orderBySql.push(`rt.${qryValNrmlzd} DESC, r.name`);
        //         else null;
        //     }
        // });

        // const whereQry = whereSql.length === 0 ? [] : [...whereSql];
        // const orderBySqlQry = orderBySql.length === 1 ? [] : [...orderBySql];
        // const pgValuesQry = pgValues.length ? [...pgValues] : [];
        // console.log(`${selectSql.join(" ")} ${whereQry.join(" ")} ${orderBySqlQry.join(" ")}`, pgValuesQry)
        // const recipesReq = await db.query(
        //     `${selectSql.join(" ")} ${whereQry.join(" ")} ${orderBySqlQry.join(" ")}`,
        //     pgValuesQry
        // );
        const whereSqlObj = filterSql(qryParams);
        const orderByObj = orderBySql(qryParams);
        const orderColumn = orderByObj.columns.join(" ");
        const order = orderByObj.order.join(" ");
        const whereSqlQry = [whereSqlObj.whereSql.join(" ")];
        const pgValuesQry = whereSqlObj.values;
        // console.log("whereSqlQry", whereSqlQry);
        // console.log("orderColumn", orderColumn);
        // console.log("order", order);
        console.log(`${selectSql.join(" ")} ${whereSqlQry[0]} ORDER BY ${orderColumn} ${order}`, pgValuesQry);
        // console.log(orderByObj);
        const recipesReq = await db.query(
            `${selectSql.join(" ")} ${whereSqlQry[0]} ORDER BY ${orderColumn} ${order}`,
            pgValuesQry
        );
        // console.log(selectSql.join(" "));
        // console.log(whereSqlObj);
        // console.log(orderByObj);
        // console.log(orderByColumns);
        return recipesReq;
        // return recipesReq.rows;
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