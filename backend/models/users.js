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
        genInsertSqlObj, rowExists
    } = require("../helpers/sql.js");
const {
        validateSchema, hashPassword, generateToken,
        decodeToken, verifyPassword
    } = require("../helpers/users.js");
const {
        definePropsPure, defineProps
    } = require("../helpers/all-purpose.js");
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
     * getFavRecipes
     * Retrives user's favorite recipes or favorite recipe.
     * Returns array of favorite recipes/recipe.
     * getFavRecipes(id) => [{ name: "chicken", ...}, ...]
     */
    static async getFavRecipes (userId, recipeId = false) {
        // Check if user exists.
        await rowExists("user", "id", "users", [["id", userId]]);
        
        const selectSqlStr = genSelectSql(recipesRelDataSelectColumns, "favorite_recipes", true);
        const joinSqlStr = genJoinSql(favRecipesjoinArr, "JOIN");
        const selectJoinSqlStr = arrayConcat([selectSqlStr, joinSqlStr]);
        // Creates object with where sql and values properties.
        const whereObj = recipeId === false ? { user_id: userId } : { user_id: userId, recipe_id: recipeId };
        const sqlWhereObj = genWhereSqlArr(whereObj, 1, true, false, true, favRecpesClmnToTblAbrev);
        const sql = arrayConcat([selectJoinSqlStr, sqlWhereObj.whereSql]);

        const favRecipes = await db.query(`
            ${sql} ORDER BY r.name, rt.rating
        `, sqlWhereObj.values);

        const favRecipeRows = JSON.parse(JSON.stringify(favRecipes.rows))

        if (recipeId !== false && favRecipeRows.length) {
            // Retrieves recipe likes user ids.
            const usrsRecipeLiks = await Recipe.getRecipeLikes(recipeId);
            // Retireves recipe dislikes user ids.
            const usrsRecipeDislikes = await Recipe.getRecipeDisLikes(recipeId);
            // Retrieves recipe's ingredients.
            const recipeIngredts = await Recipe.getRecipeIngrdts(recipeId);
            // Retrieves recipe's reviews.
            const recipeRvws = await Recipe.getRecipeReviews(recipeId);
            const recipeProps = [
                ["liked_user_ids", usrsRecipeLiks],
                ["disliked_user_ids", usrsRecipeDislikes],
                ["reviews", recipeRvws], ["ingredients", recipeIngredts]
            ]
            // Defines new liked/disliked recipe user ids and reviews props.
            const newObj = defineProps(recipeProps, favRecipeRows[0]);
        }
        return favRecipeRows;
    }

    /**
     * getSavedRecipes
     * Retrives user's saved recipes or saved recipe.
     * Returns array of saved recipes/recipe.
     * getSavedRecipes(id) => [{ name: "chicken", ...}, ...]
     */
    static async getSavedRecipes (userId, recipeId = false) {
        await rowExists("user", "id", "users", [["id", userId]]);
        const selectSqlStr = genSelectSql(recipesRelDataSelectColumns, "saved_recipes", true);
        const joinSqlStr = genJoinSql(savedRecipesjoinArr, "JOIN");
        const selectJoinSqlStr = arrayConcat([selectSqlStr, joinSqlStr]);
        // Creates object with where sql and values properties.
        const whereObj = recipeId === false ? { user_id: userId } : { user_id: userId, recipe_id: recipeId };
        const sqlWhereObj = genWhereSqlArr(whereObj, 1, true, false, true, savedRecpesClmnToTblAbrev);
        const sql = arrayConcat([selectJoinSqlStr, sqlWhereObj.whereSql]);

        const savedRecipes = await db.query(`
            ${sql} ORDER BY r.name, rt.rating
        `, sqlWhereObj.values);

        const savedRecipeRows = JSON.parse(JSON.stringify(savedRecipes.rows));

        if (recipeId !== false && savedRecipeRows.length) {
            // Retrieves recipe likes user ids.
            const usrsRecipeLiks = await Recipe.getRecipeLikes(recipeId);
            // Retireves recipe dislikes user ids.
            const usrsRecipeDislikes = await Recipe.getRecipeDisLikes(recipeId);
            // Retrieves recipe's ingredients.
            const recipeIngredts = await Recipe.getRecipeIngrdts(recipeId);
            // Retrieves recipe's reviews.
            const recipeRvws = await Recipe.getRecipeReviews(recipeId);
            const recipeProps = [
                ["liked_user_ids", usrsRecipeLiks],
                ["disliked_user_ids", usrsRecipeDislikes],
                ["reviews", recipeRvws], ["ingredients", recipeIngredts]
            ]
            // Defines new liked/disliked recipe user ids and reviews props.
            const newObj = defineProps(recipeProps, savedRecipeRows[0]);
        }
        return savedRecipeRows;
    }

    /**
     * getRecipeLists
     * Retrives user's recipelists or recipelist.
     * Returns array of recipelists/recipelist.
     * getRecipeLists(id) => [{ "weekly meal prep", ...}, ...]
     */
    static async getRecipeLists (userId, listId = false) {
        await rowExists("user", "id", "users", [["id", userId]]);
        const selectClmns = ["rl.id", "rl.list_name", "o.occasion"];
        const recipeListsSelStr = genSelectSql(selectClmns, "recipelists", true);
        const joinArr = [["occasions", "rl.occasion_id", "o.id"]];
        const joinSql = genJoinSql(joinArr, "JOIN");
        const abrevTable = { user_id: "rl.", id: "rl." };
        const whereVals = listId === false ? { user_id: userId } : { user_id: userId, id: listId };
        const whereSqlObj = genWhereSqlArr(whereVals, 1, true, false, true, abrevTable);
        const reqSqlArr = [recipeListsSelStr, joinSql, whereSqlObj.whereSql];
        const reqSql = reqSqlArr.join(" ");

        const req = await db.query(`
            ${reqSql} ORDER BY rl.list_name
        `, whereSqlObj.values);
        return req.rows;
    }

    /**
     * getListRecipes
     * Retrives a recipelist's recipes or a recipelist's recipe.
     * Returns array of recipes/recipe,
     * or a message if list doesn't have recipes.
     * getListRecipes(id) => [{ name: "chicken", ...}, ...]
     */
    static async getListRecipes (userId, listId, recipeId = false) {
        // Check if user exists.
        await rowExists("user", "id", "users", [["id", userId]]);
        // Check if list exists.
        await rowExists("list", "id", "recipelists", [["id", listId]]);
        // Define select sql for recipelist recipes.
        const recipeListSelStr = genSelectSql(recipesRelDataSelectColumns, "recipelists", true);
        // Define select sql for recipelist name.
        const listNameSelStr = "SELECT DISTINCT rl.list_name FROM recipelists_recipes rlr";
        const listNamejoinArr = [["recipelists", "rlr.list_id", "rl.id"]];
        // Define join sql for recipelist name.
        const listNameJoinSql = genJoinSql(listNamejoinArr, "JOIN");
        const joinArr = [["recipelists_recipes", "rl.id", "rlr.list_id"], ["recipes", "rlr.recipe_id", "r.id"]];
        // Define join sql for recipelist.
        const joinSql1 = genJoinSql(joinArr, "JOIN");
        // Define join sql for recipelist recipes.
        const joinSql2 = genJoinSql(recipesOnData, "JOIN");
        const joinSql = [joinSql1, joinSql2].join(" ");
        const abrevTable = recipeId === false ? { list_id: "rlr.", user_id: "rl." } : { list_id: "rlr.", user_id: "rl.", recipe_id: "rlr." };
        // const listNameClmnVals = { user_id: userId, list_id: listId };
        const listNameClmnVals = recipeId === false ? { user_id: userId, list_id: listId } : { user_id: userId, list_id: listId, recipe_id: recipeId };
        // Define where sql.
        const whereSqlObj = genWhereSqlArr(listNameClmnVals, 1, true, false, true, abrevTable);
        const reqSqlArr = [recipeListSelStr, joinSql, whereSqlObj.whereSql];
        const reqSql = reqSqlArr.join(" ");
        const listNameSql = arrayConcat([listNameSelStr, listNameJoinSql, whereSqlObj.whereSql]);
        // console.log("RECIPE LIST RECIPES FINAL SQL $#$#$#$#$#$#$", reqSql, whereSqlObj.values);
        // Make request for recipelist recipes.
        const req = await db.query(`
            ${reqSql} ORDER BY r.name, author
        `, whereSqlObj.values);
        // Make request for recipelist name.
        const listNameReq = await db.query(`
            ${listNameSql}
        `, whereSqlObj.values);

        const list_name = listNameReq.rows[0] ? listNameReq.rows[0].list_name : "";
        const recipeRows = req.rows;
        const finalReturn = recipeRows.length ? { list_name, recipes: recipeRows } : { message: "List does not have any recipes!" };
        return finalReturn;
    }

    /**
     * getShopLists
     * Retrives shopping lists or shopping list.
     * Returns array of shopping lists/list
     * getShopLists(id) => [{ name: "chicken recipe", ...}, ...]
     */
    static async getShopLists (userId, listId = false) {
        await rowExists("user", "id", "users", [["id", userId]]);
        const selectClmns = ["id", "list_name"];
        const listSelStr = genSelectSql(selectClmns, "shoppinglists");
        const whereVals = listId === false ? { user_id: userId } : { user_id: userId, id: listId };
        const whereSqlObj = genWhereSqlArr(whereVals, 1, true);
        const selectSql = arrayConcat([listSelStr, whereSqlObj.whereSql]);
        // console.log("selectSql RECIPES FINAL SQL $#$#$#$#$#$#$", selectSql, whereSqlObj.values);
        const req = await db.query(`
            ${selectSql}
        `, whereSqlObj.values);

        const recipeRows = req.rows;
        return recipeRows;
    }

    /**
     * shopListsItems
     * Retrives shopping list items.
     * Returns array of shopping list items.
     * getShopLists(id) => [{ id: 1, qty: 2, unit: "g", ...}, ...]
     */
    static async shopListsItems (userId, listId) {
        await rowExists("user", "id", "users", [["id", userId]]);
        await rowExists("list", "id", "shoppinglists", [["id", listId]]);
        const selectClmns = ["sli.id", "sli.qty", "u.unit", "ing.ingredient"];
        const listSelStr = genSelectSql(selectClmns, "shoppinglists_items", true);
        const lstNameSelStr = "SELECT DISTINCT sl.list_name FROM shoppinglists_items sli";
        const joinClmns = [
            ["units", "sli.unit_id", "u.id"],
            ["ingredients", "sli.ingredient_id", "ing.id"],
            ["shoppinglists", "sli.list_id", "sl.id"]
        ];
        const lstNameJoinClmns = [
            ["shoppinglists", "sli.list_id", "sl.id"]
        ];
        const joinSql = genJoinSql(joinClmns, "JOIN");
        const lstNameJoinSql = genJoinSql(lstNameJoinClmns, "JOIN");
        const whereSqlObj = genWhereSqlArr({ user_id: userId, list_id: listId }, 1, true, false, true, {user_id: "sl.", list_id: "sli."});
        const selectSql = arrayConcat([listSelStr, joinSql, whereSqlObj.whereSql]);
        const lstNameSelectSql = arrayConcat([lstNameSelStr, lstNameJoinSql, whereSqlObj.whereSql]);
        // console.log("selectSql RECIPES FINAL SQL $#$#$#$#$#$#$", selectSql, whereSqlObj.values);
        const req = await db.query(`
            ${selectSql}
        `, whereSqlObj.values);
        const lstNameReq = await db.query(`
            ${lstNameSelectSql}
        `, whereSqlObj.values);
        const { list_name = "" } = lstNameReq.rows[0] || lstNameReq.rows;
        const recipeRows = req.rows;
        return { list_name, items: recipeRows };
    }

    /**
     * recipes
     * Retrives user's recipelists or recipelist with recipes.
     * Returns array of recipelists/recipelist.
     * recipes(id) => [{ id: 2, recipe_name: "dump. tweak", ...}, ...]
     */
    static async userRecipes (userId, listId = false) {
        await rowExists("user", "id", "users", [["id", userId]]);
        const selectClmns = ["id", "recipe_name"];
        const listSelStr = genSelectSql(selectClmns, "user_recipes");
        const whereVals = listId === false ? { user_id: userId } : { user_id: userId, id: listId };
        const whereSqlObj = genWhereSqlArr(whereVals, 1, true);
        const selectSql = arrayConcat([listSelStr, whereSqlObj.whereSql]);
        console.log("selectSql RECIPES FINAL SQL $#$#$#$#$#$#$", selectSql, whereSqlObj.values);
        const req = await db.query(`
            ${selectSql}
        `, whereSqlObj.values);
        const recipeRows = req.rows;
        return recipeRows;
    }

    /**
     * recipeSteps
     * Retrives user's recipe steps.
     * Returns array of recipe steps.
     * recipes(id) => [{ step: "Trun bacon", ...} ...]
     */
    static async recipeSteps (userId, recipeId) {
        await rowExists("user", "id", "users", [["id", +userId]]);
        await rowExists("recipe", "id", "user_recipes", [["id", +recipeId]]);
        const selectClmns = ["urs.step"];
        const listSelStr = genSelectSql(selectClmns, "user_recipes_steps", true);
        const joinVals = [["user_recipes", "urs.user_recipe_id", "ur.id"]];
        const joinSql = genJoinSql(joinVals, "JOIN");
        const clmNvals = { user_recipe_id: recipeId, user_id: userId };
        const clmnAbrevConvrs = {user_id: "ur.", user_recipe_id: "urs."};
        const whereSqlObj = genWhereSqlArr(clmNvals, 1, true, false, true, clmnAbrevConvrs);
        const selectSql = arrayConcat([listSelStr, joinSql, whereSqlObj.whereSql]);
        // console.log("selectSql RECIPES STEPS FINAL SQL $#$#$#$#$#$#$", selectSql, whereSqlObj.values);
        const req = await db.query(`
            ${selectSql}
        `, whereSqlObj.values);
        console.log("Recipe Steps req.rows", req.rows);
        return req.rows;
    }

    /**
     * recipe
     * Retrives user's recipe.
     * Returns array of recipes.
     * recipes(id) => [{ id: 2, recipe_name: "dump. tweak", ...}, ...]
     */
    static async recipe (userId, recipeId) {
        await rowExists("user", "id", "users", [["id", +userId]]);
        await rowExists("recipe", "id", "user_recipes", [["id", +recipeId]]);
        // Generate recipe name select sql.
        const recpNameSelStr = "SELECT DISTINCT ur.recipe_name FROM user_recipes ur";
        // Generate select columns from recipe ingredients.
        const selectClmns = ["uri.id", "uri.qty", "u.unit", "ing.ingredient"];
        // Generate recipe ingredients select sql.
        const listSelStr = genSelectSql(selectClmns, "user_recipes", true);
        const joinClmns = [
            ["user_recipes_ingredients", "ur.id", "uri.user_recipe_id"],
            ["units", "uri.unit_id", "u.id"],
            ["ingredients", "uri.ingredient_id", "ing.id"]
        ];
        // JOIN sql for recipe ingredients.
        const joinSql = genJoinSql(joinClmns, "JOIN");
        // WHERE sql for recipe name.
        const rcpNameClmNvals = { user_id: userId, id: recipeId };
        const rcpNameClmnAbrevConvrs = {user_id: "ur.", id: "ur."};
        const rcpNameWhereSqlObj = genWhereSqlArr(rcpNameClmNvals, 1, true, false, true, rcpNameClmnAbrevConvrs);
        // WHERE sql for recipe ingredients.
        const clmNvals = { user_id: userId, user_recipe_id: recipeId };
        const clmnAbrevConvrs = {user_id: "ur.", user_recipe_id: "uri."};
        const whereSqlObj = genWhereSqlArr(clmNvals, 1, true, false, true, clmnAbrevConvrs);
        // Recipe ingredients sql concat.
        const selectSql = arrayConcat([listSelStr, joinSql, whereSqlObj.whereSql]);
        // Recipe name sql concat.
        const recpNameSelectSql = arrayConcat([recpNameSelStr, rcpNameWhereSqlObj.whereSql]);
        // Request recipe ingredients.
        // console.log("selectSql", selectSql);
        const req = await db.query(`
            ${selectSql} ORDER BY ing.ingredient
        `, whereSqlObj.values);
        // Request recipe name.
        const recpNameReq = await db.query(`
            ${recpNameSelectSql}
        `, rcpNameWhereSqlObj.values);
        // Destructure recipe_name if exists and empty array if not.
        const { recipe_name = "" } = recpNameReq.rows[0] || recpNameReq.rows;
        const steps = await User.recipeSteps(userId, recipeId);
        const recipeRows = JSON.parse(JSON.stringify(req.rows));
        return { recipe_name, ingredients: recipeRows, steps };
    }

    /**
     * deleteRow
     * Deletes a row.
     * Returns deleted message.
     * deleteUser(username) => { message: deleted username! }
     */
    static async deleteRow(tableName, clmnNameValObj, msg) {
        const whereSqlObj = genWhereSqlArr(clmnNameValObj, 1, true, false);
        console.log("whereSqlObj", whereSqlObj);
        console.log("SELECT", `SELECT * FROM ${tableName} ${whereSqlObj.whereSql}`);
        const rowExists = await db.query(`SELECT * FROM ${tableName} ${whereSqlObj.whereSql}`, whereSqlObj.values);
        console.log("rowExists", rowExists.rows);
        const rowExistsLength = rowExists.rows.length;
        if (rowExistsLength === 0) throw new ExpressError(404, "Row not found!");
        await db.query(`DELETE FROM ${tableName} ${whereSqlObj.whereSql}`, whereSqlObj.values);
        return { message: `${msg}` };
    }

    /**
     * insertRow
     * Insert a row to database.
     * Returns message object, return values, or undefined.
     * const data = {
		"recipeId": 1
	* }
    * insertRow(1, data) =>
    * insertRow(1, data, false) =>
    */
    static async insertRow (tableName, data, schema, returnArray = false, msg = false) {
        const isValid = validateSchema(data, schema);
        if (isValid.errors.length !== 0) {
            const jsonErrors = isValid.errors.map(error => error.message);
            throw new ExpressError(400, jsonErrors);
        }
        console.log("data", data);
        const insertSqlObj = returnArray === false
            ? genInsertSqlObj(tableName, data)
            : genInsertSqlObj(tableName, data, returnArray);
        console.log("insertSqlObj", insertSqlObj);
        const insertData = await db.query(`${insertSqlObj.sql}`, insertSqlObj.values);
        console.log("insertData", insertData);
        const message = msg !== false ? msg : [];
        return insertData.rows.length ? insertData : message;
    }
}

module.exports = User;