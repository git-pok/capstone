const { Client } = require("pg");

let BCRYPT_WORK_FACTOR = process.env.NODE_ENV === "test" ? 1 : 12;

let DB_URI;

DB_URI = process.env.NODE_ENV === "test"
    ? "postgresql:///savour_test" : "postgresql:///savour";

let db = new Client ({ 
    connectionString: DB_URI
});

db.connect();


const columnNameCvrs = {
    author: "full_name",
    username: "username",
    name: "name",
    main_category: "main_category",
    sub_category: "sub_category",
    rating: "rating",
    id: "id",
    difficulty: "difficulty",
    disliked_recipes: "disliked_recipes",
    liked_recipes: "liked_recipes",
    dis_recipe_id: "recipe_id",
    dis_user_id: "user_id",
    lik_recipe_id: "recipe_id",
    lik_user_id: "user_id"
};

/**
 * tableAbrv
 * Table abreviations for columns and tables.
 */
const tableAbrv = {
    author: "a.",
    full_name: "a.",
    name: "r.",
    username: "u.",
    main_category: "m.",
    sub_category: "s.",
    rating: "rt.",
    id: "r.",
    difficulty: "d.",
    disliked_recipes: "dis.",
    liked_recipes: "lik."
};

/**
 * sqlOperator
 * Sql operators for where query table columns
 */
const sqlOperator = {
    full_name: "ILIKE",
    name: "ILIKE",
    main_category: "ILIKE",
    sub_category: "ILIKE",
    rating: "=",
    id: "=",
    username: "="
};

/**
 * sqlOperatorStrict
 * Strict sql operators for where query table columns
 */
const sqlOperatorStrict = {
    full_name: "=",
    first_name: "=",
    last_name: "=",
    email: "=",
	phone: "=",
	header_img: "=",
	profile_img: "=",
	password: "=",
    name: "=",
    main_category: "=",
    sub_category: "=",
    rating: "=",
    id: "=",
    username: "="
};

/**
 * sqlCommandsObj
 * Sql commands for queries.
 */
const sqlCommandsObj = {
    select: "SELECT",
    insert: "INSERT INTO",
    update: "UPDATE"
};

/**
 * sqlCommandsModifsObj
 * Sql modifyer commands for queries.
 */
const sqlCommandsModifsObj = {
    select: "FROM",
    insert: "VALUES",
    update: "SET"
};

/**
 * recipesRelDataSelectColumns
 * Select column names to query all relational data for recipes table.
 */
// No comma on last value, it will cause a query error.
const recipesRelDataSelectColumns = [
    "r.id", "r.name", "a.full_name AS author", "rt.rating",
    "rt.vote_count", "r.url", "r.image", "r.description",
    "r.serves", "d.level", "m.main_cat_name", "s.sub_cat_name",
    "r.steps", "r.prep_time", "r.cook_time"
];
// No comma on last value, it will cause a query error.
const selectLikRecUsrId = [
    "lik.user_id AS liked_user_id"
];

const selectDisRecUsrId = [
    "dis.user_id AS disliked_user_id"
];

const orderByChron = {
    asc: "ASC",
    desc: "DESC"
};

const recipeRelJoinData = [
    ["authors a", "r.author_id = a.id"],
    ["ratings rt", "r.id = rt.recipe_id"],
    ["difficulty d", "r.difficulty_id = d.id"],
    ["main_category m", "r.main_category_id = m.id"],
    ["sub_category s", "r.sub_category_id = s.id"]
];

const likRecipeJoinData = [
    ["liked_recipes lik", "r.id = lik.recipe_id"]
];

const disRecipeJoinData = [
    ["disliked_recipes dis", "r.id = dis.recipe_id"]
];

const recipeQryFilterKeys = new Set();
        recipeQryFilterKeys.add("name").add("author").add("rating")
        .add("orderBy").add("orderBy2");

const recipeFilterKeys = new Set();
        recipeFilterKeys.add("name").add("author").add("rating");

const orderByKeys = new Set();
        orderByKeys.add("orderby").add("orderby2").add("chronorder");

const isNumbers = new Set();
        isNumbers.add("recipe_id").add("user_id").add("rating")
        .add("id").add("vote_count");

const userSqlReturnNoAbrv = [
    "id", "username", "first_name", "last_name",
    "email", "phone", "header_img", "profile_img"
];

module.exports = {
    db, BCRYPT_WORK_FACTOR, columnNameCvrs,
    tableAbrv, sqlOperator, sqlOperatorStrict,
    sqlCommandsObj, sqlCommandsModifsObj,
    recipesRelDataSelectColumns, selectLikRecUsrId,
    selectDisRecUsrId,
    orderByChron, recipeQryFilterKeys,
    recipeFilterKeys, orderByKeys,
    isNumbers,
    recipeRelJoinData, likRecipeJoinData,
    disRecipeJoinData, userSqlReturnNoAbrv
};