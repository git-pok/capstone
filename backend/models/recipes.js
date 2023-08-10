const {
        db, recipesRelDataSelectColumns,
        ingrdsRelDataSelectColumns,
        selectLikRecUsrId, selectDisRecUsrId,
        likRecipeJoinData,
        disRecipeJoinData, ingrdRecipesJoinData,
        recipeFilterKeys, recipesClmnToTblAbrev,
        recipesOnData, recipesIngrdsClmnToTblAbrev
    } = require("../config.js");
const {
        genWhereSqlArr,
        arrayConcat,
        genJoinSql,
        qryObjToOrderBySql,
        genSelectSql, genUpdateSqlObj,
        genInsertSqlObj
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
        // Creates object with sql and values properties.
        const selectSqlStr = genSelectSql(recipesRelDataSelectColumns, "recipes", true);
        const selectLikSqlStr = genSelectSql(selectLikRecUsrId, "recipes", true);
        const selectDisSqlStr = genSelectSql(selectDisRecUsrId, "recipes", true);
        // Creates a sql join query string
        const joinSqlStr = genJoinSql(recipesOnData, "JOIN");
        const joinLikSqlStr = genJoinSql(likRecipeJoinData, "FULL JOIN");
        const joinDisSqlStr = genJoinSql(disRecipeJoinData, "FULL JOIN");
        // Creates one string from array of sql strings
        const selectJoinSqlStr = arrayConcat([selectSqlStr, joinSqlStr]);
        const selectLikJoinSqlStr = arrayConcat([selectLikSqlStr, joinLikSqlStr]);
        const selectDisJoinSqlStr = arrayConcat([selectDisSqlStr, joinDisSqlStr]);
        // Creates object with where sql and values properties.
        const sqlWhereObj = genWhereSqlArr(whereObj, 1, true, false, true, recipesClmnToTblAbrev);
        // console.log("sqlWhereObj $#$#$#$#$#$#$#$", sqlWhereObj);
        // Creates query from select query string
        // and where query object.
        const selectQry = arrayConcat([selectJoinSqlStr, sqlWhereObj.whereSql]);
        const likQry = arrayConcat([selectLikJoinSqlStr, sqlWhereObj.whereSql]);
        const disQry = arrayConcat([selectDisJoinSqlStr, sqlWhereObj.whereSql]);
        console.log("likQry $#$#$#$#$#$", selectQry);
        console.log("selectQry $#$#$#$#$#$", likQry);
        console.log("disQry $#$#$#$#$#$", disQry);
        // Creates pg values.
        const pgValues = sqlWhereObj.values;
        // console.log("pgValues $#$#$#$#$#$", pgValues);
        // Makes request for recipe with query string.
        const selectRecipesReq = await db.query(
            `${selectQry}`, pgValues
        );
        // Makes request for liked recipes with query string.
        const likRecipesReq = await db.query(
            `${likQry}`, pgValues
        );
        // Makes request for disliked recipe with query string.
        const disRecipesReq = await db.query(
            `${disQry}`, pgValues
        );
        // Maps liked recipes user ids.
        const likUsrIds = likRecipesReq.rows.map(obj => obj.liked_user_id);
        // Maps disliked recipes user ids.
        const disUsrIds = disRecipesReq.rows.map(obj => obj.disliked_user_id);
        // Deletes null values from ids array.
        const noNullLikUsrIds = deleteNullInArrPure(likUsrIds);
        const noNullDisUrdIds = deleteNullInArrPure(disUsrIds);
        const recipeRow = selectRecipesReq.rows[0];
        // Deletes liked and disliked recipes properites.
        deleteObjProps(["liked_user_id", "disliked_user_id"], recipeRow);
        // Defines new liked and disliked recipes array properites.
        selectRecipesReq.rows[0]["liked_user_ids"] = noNullLikUsrIds;
        selectRecipesReq.rows[0]["disliked_user_ids"] = noNullDisUrdIds;
        
        // Create recipes_ingredients select string.
        const ingrSelectSqlStr = genSelectSql(ingrdsRelDataSelectColumns, "recipes_ingredients", true);
        // Create recipes_ingredients join string.
        const ingrJoinSqlStr = genJoinSql(ingrdRecipesJoinData, "JOIN");
        // Concat recipes_ingredients select and join strings.
        const ingrSelectJoinSqlStr = arrayConcat([ingrSelectSqlStr, ingrJoinSqlStr]);
        // Create object with column name and value to pass into genWhereSqlArr.
        const RecIngrdsObj = { recipe_id: dbRecipeRowsObj.id };
        // console.log("RecIngrdsObj", RecIngrdsObj);
        // Generate where sql object.
        const ingrdsWhereObj = genWhereSqlArr(RecIngrdsObj, 1, true, false, true, recipesIngrdsClmnToTblAbrev);
        // Concat select, join, and where sql.
        const ingrSelectQry = arrayConcat([ingrSelectJoinSqlStr, ingrdsWhereObj.whereSql]);
        console.log("ingrSelectQry$#$#$#$#$#$", ingrSelectQry, pgValues);
        // Makes request for recipes_ingredients with query string.
        const ingredsReq = await db.query(
            `${ingrSelectQry}`, pgValues
        );
        recipeRow.ingredients = ingredsReq.rows  
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
        console.log("selectJoinSqlStr $#$#$#$#$#$#$#$#$#$#$#$#$#$", selectJoinSqlStr);
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
        console.log("FINAL STRING $#$#$#$#$#$#", finalSqlQry, pgValuesQry);
        const recipesReq = await db.query(
            `${finalSqlQry}`, pgValuesQry
        );
        return recipesReq.rows;
    }
}

module.exports = Recipe;