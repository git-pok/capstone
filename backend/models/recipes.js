const {
        db, recipesRelDataSelectColumns,
        selectLikRecUsrId, selectDisRecUsrId,
        likRecipeJoinData,
        disRecipeJoinData, recipeFilterKeys,
        recipesOnData
    } = require("../config.js");
const {
        genWhereSqlArr,
        arrayConcat,
        genJoinSql,
        qryObjToOrderBySql, genSql
    } = require("../helpers/sql.js");

const {
    deleteObjProps, definePropsInObj,
    deleteNullInArr,
    deletePropsNotInSet,
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
        const selectSqlArr = genSql ("select", "recipes r", recipesRelDataSelectColumns);
        const selectLikSqlArr = genSql ("select", "recipes r", selectLikRecUsrId);
        const selectDisSqlArr = genSql ("select", "recipes r", selectDisRecUsrId);
        // Creates a sql join query string
        const joinSqlStr = genJoinSql("r.", recipesOnData, "JOIN");
        const joinLikSqlStr = genJoinSql("r.", likRecipeJoinData, "FULL JOIN");
        const joinDisSqlStr = genJoinSql("r.", disRecipeJoinData, "FULL JOIN");
        // Creates one string from array of sql strings
        const selectJoinSqlStr = arrayConcat([selectSqlArr.sql, joinSqlStr]);
        const selectLikJoinSqlStr = arrayConcat([selectLikSqlArr.sql, joinLikSqlStr]);
        const selectDisJoinSqlStr = arrayConcat([selectDisSqlArr.sql, joinDisSqlStr]);
        // Creates object with where sql and values properties.
        const sqlWhereObj = genWhereSqlArr (whereObj, 1, true, false, true);
        // Creates query from select query string
        // and where query object.
        const selectQry = arrayConcat([selectJoinSqlStr, ...sqlWhereObj.whereSql]);
        const likQry = arrayConcat([selectLikJoinSqlStr, ...sqlWhereObj.whereSql]);
        const disQry = arrayConcat([selectDisJoinSqlStr, ...sqlWhereObj.whereSql]);
        // Creates pg values.
        const pgValues = sqlWhereObj.values;
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
        const noNullLikUsrIds = deleteNullInArr(likUsrIds);
        const noNullDisUrdIds = deleteNullInArr(disUsrIds);
        const recipeRow = selectRecipesReq.rows[0];
        // Deletes liked and disliked recipes properites.
        deleteObjProps (["liked_user_id", "disliked_user_id"], recipeRow);
        // Defines new liked and disliked recipes array properites.
        selectRecipesReq.rows[0]["liked_user_ids"] = noNullLikUsrIds;
        selectRecipesReq.rows[0]["disliked_user_ids"] = noNullDisUrdIds;
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
        const selectSqlArr = genSql ("select", "recipes r", recipesRelDataSelectColumns);
        const joinSqlStr = genJoinSql("r.", recipesOnData, "JOIN");
        const selectJoinSqlStr = arrayConcat([selectSqlArr.sql, joinSqlStr]);
        const recipesReq = await db.query(
            `${selectJoinSqlStr} ORDER BY name ASC`
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
        // Create parametizer for qry values.
        let prmTzr = 1;
        // Parse out qry object keys that aren't permitted filters.
        const filtersParsed = deletePropsNotInSet(recipeFilterKeys, qryParams);
        // Convert qry object keys to sql table column names.
        const filtersConverted = recipesFiltersToSqlClmns(filtersParsed);
        // Create where sql object.
        const whereSqlObj = genWhereSqlArr(filtersConverted, prmTzr, false, false, true);
        // Create sql select qry.
        const selectSqlArr = genSql ("select", "recipes r", recipesRelDataSelectColumns);
        // Create sql join query.
        const joinSqlStr = genJoinSql("r.", recipesOnData, "JOIN");
        // Concat select and join queries.
        const selectJoinSqlStr = arrayConcat([selectSqlArr.sql, joinSqlStr]);
        // Concat the select/join query and where query.
        const selectWhereQry = arrayConcat([selectJoinSqlStr, ...whereSqlObj.whereSql]);
        // Create order by query with qry onject.
        const orderByStr = qryObjToOrderBySql(qryParams);
        const orderBy = orderByStr ? orderByStr : "";
        const pgValuesQry = whereSqlObj.values;
        finalSql.push(selectWhereQry, orderBy);
        const finalSqlQry = finalSql.join(" ");
        console.log("FINAL STRING $#$#$#$#$#$#", finalSqlQry);
        const recipesReq = await db.query(
            `${finalSqlQry}`, pgValuesQry
        );
        return recipesReq.rows;
    }
}

module.exports = Recipe;