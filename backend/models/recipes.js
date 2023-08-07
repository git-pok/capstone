const {
        db, recipesRelDataSelectColumns,
        selectLikRecUsrId, selectDisRecUsrId,
        likRecipeJoinData,
        disRecipeJoinData, recipeFilterKeys,
        recipesOnData
    } = require("../config.js");
const {
        genWhereSqlArr, genSqlStrFromExp,
        selectJoinSql,
        qryObjToOrderBySql, genSql
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
        const selectSql = selectJoinSql(recipesRelDataSelectColumns, "recipes r", "r.", recipesOnData);
        const likSelectSql = selectJoinSql(selectLikRecUsrId, "recipes r", "r.", likRecipeJoinData);
        const disSelectSql = selectJoinSql(selectDisRecUsrId, "recipes r", "r.", disRecipeJoinData);
        const sqlWhereObj = genWhereSqlArr (whereObj, 1, true, false, true);
        const selectQry = genSqlStrFromExp(selectSql, sqlWhereObj);
        const likQry = genSqlStrFromExp(likSelectSql, sqlWhereObj);
        const disQry = genSqlStrFromExp(disSelectSql, sqlWhereObj);
        const pgValues = sqlWhereObj.values;
        // console.log("%$%$%$%$%$selectQryMDL", selectQry, pgValues);
        const selectRecipesReq = await db.query(
            `${selectQry}`, pgValues
        );
        const likRecipesReq = await db.query(
            `${likQry}`, pgValues
        );
        const disRecipesReq = await db.query(
            `${disQry}`, pgValues
        );
        // console.log("ROW", selectRecipesReq);
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
        const selectSql = selectJoinSql(recipesRelDataSelectColumns, "recipes r", "r.", recipesOnData);
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
        let prmTzr = 1;
        const filtersParsed = deletePropsNotInSet(recipeFilterKeys, qryParams);
        const whereSqlObj = genWhereSqlArr(filtersParsed, prmTzr, false, false, true);
        const selectSql = selectJoinSql(recipesRelDataSelectColumns, "recipes r", "r.", recipesOnData);
        const selectWhereQry = genSqlStrFromExp(selectSql, whereSqlObj);
        const orderByStr = qryObjToOrderBySql(qryParams);
        const orderBy = orderByStr ? orderByStr : "";
        const pgValuesQry = whereSqlObj.values;
        finalSql.push(selectWhereQry, orderBy);
        const finalSqlQry = finalSql.join(" ");
        const recipesReq = await db.query(
            `${finalSqlQry}`, pgValuesQry
        );
        return recipesReq.rows;
    }
}

module.exports = Recipe;