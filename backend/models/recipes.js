const {
        db, recipesRelDataSelectColumns,
        selectLikRecUsrId, selectDisRecUsrId,
        likRecipeJoinData,
        disRecipeJoinData, recipeFilterKeys,
        recipesOnData
    } = require("../config.js");
const {
        genWhereSqlArr, genSqlStrFromExp,
        genStrFromArr,
        genJoinSql,
        qryObjToOrderBySql, genSql
    } = require("../helpers/sql.js");

const {
    deleteObjProps, definePropsInObj,
    deleteNullInArr,
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
        // Creates object with sql and values properties.
        const selectSqlArr = genSql ("select", "recipes r", recipesRelDataSelectColumns);
        const selectLikSqlArr = genSql ("select", "recipes r", selectLikRecUsrId);
        const selectDisSqlArr = genSql ("select", "recipes r", selectDisRecUsrId);
        // Creates a sql join query string
        const joinSqlStr = genJoinSql("r.", recipesOnData, "JOIN");
        const joinLikSqlStr = genJoinSql("r.", likRecipeJoinData, "FULL JOIN");
        const joinDisSqlStr = genJoinSql("r.", disRecipeJoinData, "FULL JOIN");
        // Creates one string from array of sql strings
        const selectJoinSqlStr = genStrFromArr([selectSqlArr.sql, joinSqlStr]);
        const selectLikJoinSqlStr = genStrFromArr([selectLikSqlArr.sql, joinLikSqlStr]);
        const selectDisJoinSqlStr = genStrFromArr([selectDisSqlArr.sql, joinDisSqlStr]);
        // Creates object with where sql and values properties.
        const sqlWhereObj = genWhereSqlArr (whereObj, 1, true, false, true);
        // Creates query from select query string
        // and where query object.
        const selectQry = genSqlStrFromExp(selectJoinSqlStr, sqlWhereObj);
        const likQry = genSqlStrFromExp(selectLikJoinSqlStr, sqlWhereObj);
        const disQry = genSqlStrFromExp(selectDisJoinSqlStr, sqlWhereObj);
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
        const selectJoinSqlStr = genStrFromArr([selectSqlArr.sql, joinSqlStr]);
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
        let prmTzr = 1;
        const filtersParsed = deletePropsNotInSet(recipeFilterKeys, qryParams);
        const whereSqlObj = genWhereSqlArr(filtersParsed, prmTzr, false, false, true);
        const selectSqlArr = genSql ("select", "recipes r", recipesRelDataSelectColumns);
        const joinSqlStr = genJoinSql("r.", recipesOnData, "JOIN");
        const selectJoinSqlStr = genStrFromArr([selectSqlArr.sql, joinSqlStr]);
        const selectWhereQry = genSqlStrFromExp(selectJoinSqlStr, whereSqlObj);
        const orderByStr = qryObjToOrderBySql(qryParams);
        const orderBy = orderByStr ? orderByStr : "";
        const pgValuesQry = whereSqlObj.values;
        finalSql.push(selectWhereQry, orderBy);
        const finalSqlQry = finalSql.join(" ");
        // console.log("FINAL STRING $#$#$#$#$#$#", finalSqlQry);
        const recipesReq = await db.query(
            `${finalSqlQry}`, pgValuesQry
        );
        return recipesReq.rows;
    }
}

module.exports = Recipe;