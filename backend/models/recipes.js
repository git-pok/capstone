const {
        db, recipesRelDataSelectColumns,
        favRecipesjoinArr, savedRecipesjoinArr,
        ingrdsRelDataSelectColumns,
        selectLikRecUsrId, selectDisRecUsrId,
        likRecipeJoinData,
        disRecipeJoinData, ingrdRecipesJoinData,
        recipeFilterKeys, recipesClmnToTblAbrev,
        favRecpesClmnToTblAbrev, savedRecpesClmnToTblAbrev,
        recipesOnData, recipesIngrdsClmnToTblAbrev
    } = require("../config.js");
const {
        genWhereSqlArr,
        arrayConcat,
        genJoinSql,
        qryObjToOrderBySql,
        genSelectSql, genUpdateSqlObj,
        genInsertSqlObj, recipeUsrExists
    } = require("../helpers/sql.js");

const {
    deleteObjProps, definePropsInObjPure,
    deleteNullInArrPure,
    deletePropsNotInSetPure,
    recipesFiltersToSqlClmns
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
     * getRecipeLikes
     * Retrieves liked usr ids for recipe.
     * Arguments: recipe id
     * getRecipeLikes(id) => [1, 2, 3]
     */
    static async getRecipeLikes(id) {
        await recipeUsrExists("recipe", "id", "recipes", id, "id");
        const dbRecipe = await db.query(`SELECT * FROM recipes WHERE id = $1`, [id]);
        const dbRecipeRows = JSON.parse(JSON.stringify(dbRecipe.rows));
        const dbRecipeRowsObj = JSON.parse(JSON.stringify(dbRecipeRows[0]));
        // Creates select sql strings.
        const selectLikSqlStr = genSelectSql(selectLikRecUsrId, "recipes", true);
        // Creates join sql strings.
        const joinLikSqlStr = genJoinSql(likRecipeJoinData, "FULL JOIN");
        // Creates one string from array of sql strings
        const selectLikJoinSqlStr = arrayConcat([selectLikSqlStr, joinLikSqlStr]);
        // Creates object with keys of where sql column names
        //  and their values as values.
        const whereObj = { id: dbRecipeRowsObj.id };
        // Generates where sql objects.
        const sqlWhereObj = genWhereSqlArr(whereObj, 1, true, false, true, recipesClmnToTblAbrev);
        // Creates query from select/join/where query strings.
        const likQry = arrayConcat([selectLikJoinSqlStr, sqlWhereObj.whereSql]);
        // Creates pg values.
        const pgValues = sqlWhereObj.values;
        // Makes request with query string.
        const likRecipesReq = await db.query(
            `${likQry}`, pgValues
        );
        // Maps liked recipes user ids.
        const likUsrIds = likRecipesReq.rows.map(obj => obj.liked_user_id);
        // Deletes null values from usr ids arrays.
        const noNullLikUsrIds = deleteNullInArrPure(likUsrIds);
        return noNullLikUsrIds;
    }

    /**
     * getRecipeDisLikes
     * Retrieves disliked usr ids for recipe.
     * Arguments: recipe id
     * getRecipeDisLikes(id) => [1, 2, 3]
     */
    static async getRecipeDisLikes(id) {
        await recipeUsrExists("recipe", "id", "recipes", id, "id");
        const dbRecipe = await db.query(`SELECT * FROM recipes WHERE id = $1`, [id]);
        const dbRecipeRows = JSON.parse(JSON.stringify(dbRecipe.rows));
        const dbRecipeRowsObj = JSON.parse(JSON.stringify(dbRecipeRows[0]));
        // Creates select sql string.
        const selectDisSqlStr = genSelectSql(selectDisRecUsrId, "recipes", true);
        // Creates join sql string.
        const joinDisSqlStr = genJoinSql(disRecipeJoinData, "FULL JOIN");
        // Creates one string from array of sql strings.
        const selectDisJoinSqlStr = arrayConcat([selectDisSqlStr, joinDisSqlStr]);
        // Creates object with keys of where sql column names
        //  and their values as values.
        const whereObj = { id: dbRecipeRowsObj.id };
        // Generates where sql objects.
        const sqlWhereObj = genWhereSqlArr(whereObj, 1, true, false, true, recipesClmnToTblAbrev);
        // Creates query from select/join/where query strings.
        const disQry = arrayConcat([selectDisJoinSqlStr, sqlWhereObj.whereSql]);
        // Creates pg values.
        const pgValues = sqlWhereObj.values;
        // Makes request with query string.
        const disRecipesReq = await db.query(
            `${disQry}`, pgValues
        );
        // Maps disliked recipes user ids.
        const disUsrIds = disRecipesReq.rows.map(obj => obj.disliked_user_id);
        // Deletes null values from usr ids arrays.
        const noNullDisUrdIds = deleteNullInArrPure(disUsrIds);  
        return noNullDisUrdIds;
    }

    /**
     * getRecipeIngrdts
     * Retrieves a recipes ingredients.
     * Arguments: recipe id
     * getRecipeIngrdts(id) =>
     * {
		"qty": "410",
		"unit": "g",
		"ingredient": "can  peach halves"
     * },...  
     */
    static async getRecipeIngrdts(id) {
        // Check if recipe exists.
        await recipeUsrExists("recipe", "id", "recipes", id, "id");
        const dbRecipe = await db.query(`SELECT * FROM recipes WHERE id = $1`, [id]);
        const dbRecipeRows = JSON.parse(JSON.stringify(dbRecipe.rows));
        const dbRecipeRowsObj = JSON.parse(JSON.stringify(dbRecipeRows[0]));
        // Creates select sql string.
        const ingrSelectSqlStr = genSelectSql(ingrdsRelDataSelectColumns, "recipes_ingredients", true);
        // Creates join sql string.
        const ingrJoinSqlStr = genJoinSql(ingrdRecipesJoinData, "JOIN");
        // Creates one string from array of sql strings
        const ingrSelectJoinSqlStr = arrayConcat([ingrSelectSqlStr, ingrJoinSqlStr]);
        // Creates object with keys of where sql column names
        //  and their values as values.
        const RecIngrdsObj = { recipe_id: dbRecipeRowsObj.id };
        // Generates where sql objects.
        const ingrdsWhereObj = genWhereSqlArr(RecIngrdsObj, 1, true, false, true, recipesIngrdsClmnToTblAbrev);
        // Creates query from select/join/where query strings.
        const ingrSelectQry = arrayConcat([ingrSelectJoinSqlStr, ingrdsWhereObj.whereSql]);
        // Creates pg values.
        const pgValues = ingrdsWhereObj.values;
        // Makes request with query string.
        const ingredsReq = await db.query(
            `${ingrSelectQry}`, pgValues
        );
        return ingredsReq.rows;
    }

    /**
     * getRecipeReviews
     * Retrieves recipe reviews.
     * Arguments: recipe id
     * getRecipeReviews(id) =>
     * {
		"stars": 5,
		"review": "Good!",
		"user_id": 11
	 * },...
     */
    static async getRecipeReviews(id) {
        // Check if recipe exists.
        await recipeUsrExists("recipe", "id", "recipes", id, "id");
        const dbRecipe = await db.query(`SELECT * FROM recipes WHERE id = $1`, [id]);
        const dbRecipeRows = JSON.parse(JSON.stringify(dbRecipe.rows));
        const dbRecipeRowsObj = JSON.parse(JSON.stringify(dbRecipeRows[0]));
        // Creates select sql string.
        const selectRvwsSqlStr = genSelectSql(["rv.stars", "rv.review", "rv.user_id"], "reviews", true);
        // Creates join sql string.
        const rvwJoinEqts = [ ["recipes", "rv.recipe_id", "r.id"] ];
        const joinRvwSqlStr = genJoinSql(rvwJoinEqts, "JOIN");
        // Creates one string from array of sql strings
        const selectRvwJoinSqlStr = arrayConcat([selectRvwsSqlStr, joinRvwSqlStr]);
        // Creates object with keys of where sql column names
        //  and their values as values.
        const whereObj = { id: dbRecipeRowsObj.id };
        // Generates where sql objects.
        const sqlWhereObj = genWhereSqlArr(whereObj, 1, true, false, true, recipesClmnToTblAbrev);
        // Creates query from select/join/where query strings.
        const rvwQry = arrayConcat([selectRvwJoinSqlStr, sqlWhereObj.whereSql]);
        // Creates pg values.
        const pgValues = sqlWhereObj.values;
        // Makes request with query string.
        const rvwRecipesReq = await db.query(
            `${rvwQry}`, pgValues
        );
        // Debug query.
        // const rvwRecipesReq = await db.query(
        //     `SELECT rv.stars, rv.review, rv.user_id FROM reviews rv JOIN recipes r ON rv.recipe_id = r.id WHERE r.id = $1`, pgValues
        // );
        return rvwRecipesReq.rows;
    }

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
        // Check if recipe exists.
        await recipeUsrExists("recipe", "id", "recipes", id, "id");
        const dbRecipe = await db.query(`SELECT * FROM recipes WHERE id = $1`, [id]);
        const dbRecipeRows = JSON.parse(JSON.stringify(dbRecipe.rows));
        const dbRecipeRowsObj = JSON.parse(JSON.stringify(dbRecipeRows[0]));
        // Creates select sql strings.
        const selectSqlStr = genSelectSql(recipesRelDataSelectColumns, "recipes", true);
        // Creates join sql strings.
        const joinSqlStr = genJoinSql(recipesOnData, "JOIN");
        // console.log("joinRvwSqlStr $#$#$#$$#$#$#", joinRvwSqlStr);
        // Creates one string from array of sql strings
        const selectJoinSqlStr = arrayConcat([selectSqlStr, joinSqlStr]);
        // Creates object with keys of where sql column names
        //  and their values as values.
        const whereObj = { id: dbRecipeRowsObj.id };
        // Generates where sql objects.
        const sqlWhereObj = genWhereSqlArr(whereObj, 1, true, false, true, recipesClmnToTblAbrev);
        // Creates query from select/join/where query strings.
        const selectQry = arrayConcat([selectJoinSqlStr, sqlWhereObj.whereSql]);
        // Creates pg values.
        const pgValues = sqlWhereObj.values;
        // Makes request for recipe with query string.
        const selectRecipesReq = await db.query(
            `${selectQry}`, pgValues
        );
        const recipeRow = selectRecipesReq.rows[0];
        // Deletes liked and disliked recipes properites.
        deleteObjProps(["liked_user_id", "disliked_user_id"], recipeRow);
        // Retrieves recipe likes user ids.
        const usrsRecipeLiks = await Recipe.getRecipeLikes(id);
        // Retireves recipe dislikes user ids.
        const usrsRecipeDislikes = await Recipe.getRecipeDisLikes(id);
        // Retrieves recipe's ingredients.
        const recipeIngredts = await Recipe.getRecipeIngrdts(id);
        // Retrieves recipe's reviews.
        const recipeRvws = await Recipe.getRecipeReviews(id);
        // Defines new liked/disliked recipe user ids and reviews props.
        selectRecipesReq.rows[0]["liked_user_ids"] = usrsRecipeLiks;
        selectRecipesReq.rows[0]["disliked_user_ids"] = usrsRecipeDislikes;
        selectRecipesReq.rows[0]["reviews"] = recipeRvws;
        recipeRow.ingredients = recipeIngredts;
        return recipeRow;
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
        // Creates a sql join query string
        const selectSqlStr = genSelectSql(recipesRelDataSelectColumns, "recipes", true);
        const joinSqlStr = genJoinSql(recipesOnData, "JOIN");
        const selectJoinSqlStr = arrayConcat([selectSqlStr, joinSqlStr]);
        // console.log("selectJoinSqlStr $#$#$#$#$#$#$#$#$#$#$#$#$#$", selectJoinSqlStr);
        const recipesReq = await db.query(
            `${selectJoinSqlStr} ORDER BY name ASC`
        );
        const recipeRows = recipesReq.rows;
        return recipeRows;
    }

    /**
     * recipesFilter
     * Filters recipes by name, author, or rating.
     * Arguments: query params object
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
        // Create parametizer for qry values.
        let prmTzr = 1;
        // Parse out qry object keys that aren't permitted filters.
        const filtersParsed = deletePropsNotInSetPure(recipeFilterKeys, qryParams);
        // Convert qry object keys to sql table column names.
        const filtersConverted = recipesFiltersToSqlClmns(filtersParsed);
        // Create where sql object.
        // console.log("filtersConverted $#$#$#$#$#$#$", filtersConverted)
        const whereSqlObj = genWhereSqlArr(filtersConverted, prmTzr, false, false, true, recipesClmnToTblAbrev);
        // Create sql select qry.
        const selectSqlStr = genSelectSql(recipesRelDataSelectColumns, "recipes", true);
        // Create sql join query.
        const joinSqlStr = genJoinSql(recipesOnData, "JOIN");
        // Concat select and join queries.
        const selectJoinSqlStr = arrayConcat([selectSqlStr, joinSqlStr]);
        // Concat the select/join query and where query.
        const selectWhereQry = arrayConcat([selectJoinSqlStr, whereSqlObj.whereSql]);
        // Create order by query with qry onject.
        const orderByStr = qryObjToOrderBySql(qryParams);
        const orderBy = orderByStr ? orderByStr : "";
        const pgValuesQry = whereSqlObj.values;
        finalSql.push(selectWhereQry, orderBy);
        const finalSqlQry = finalSql.join(" ");
        // console.log("FINAL STRING $#$#$#$#$#$#", finalSqlQry, pgValuesQry);
        const recipesReq = await db.query(
            `${finalSqlQry}`, pgValuesQry
        );
        return recipesReq.rows;
    }

    static async getFavRecipes (userId) {
        // Check if user exists.
        await recipeUsrExists("user", "id", "users", userId, "id");
        
        const selectSqlStr = genSelectSql(recipesRelDataSelectColumns, "favorite_recipes", true);
        const joinSqlStr = genJoinSql(favRecipesjoinArr, "JOIN");
        const selectJoinSqlStr = arrayConcat([selectSqlStr, joinSqlStr]);
        // Creates object with where sql and values properties.
        const whereObj = { user_id: userId };
        const sqlWhereObj = genWhereSqlArr(whereObj, 1, true, false, true, favRecpesClmnToTblAbrev);
        const sql = arrayConcat([selectJoinSqlStr, sqlWhereObj.whereSql]);
        
        const favRecipes = await db.query(`
            ${sql} ORDER BY r.name, rt.rating
        `, sqlWhereObj.values);
        return favRecipes.rows;
    }

    static async getSavedRecipes (userId) {
        await recipeUsrExists("user", "id", "users", userId, "id");
        const selectSqlStr = genSelectSql(recipesRelDataSelectColumns, "saved_recipes", true);
        const joinSqlStr = genJoinSql(savedRecipesjoinArr, "JOIN");
        const selectJoinSqlStr = arrayConcat([selectSqlStr, joinSqlStr]);
        // Creates object with where sql and values properties.
        const whereObj = { user_id: userId };
        const sqlWhereObj = genWhereSqlArr(whereObj, 1, true, false, true, savedRecpesClmnToTblAbrev);
        const sql = arrayConcat([selectJoinSqlStr, sqlWhereObj.whereSql]);

        const savedRecipes = await db.query(`
            ${sql} ORDER BY r.name, rt.rating
        `, sqlWhereObj.values);
        return savedRecipes.rows;
    }
}

module.exports = Recipe;