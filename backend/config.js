const { Client } = require("pg");

let BCRYPT_WORK_FACTOR = process.env.NODE_ENV === "test" ? 1 : 12;

let DB_URI;

DB_URI = process.env.NODE_ENV === "test"
    ? "postgresql:///savour_test" : "postgresql:///savour";

let db = new Client ({ 
    connectionString: DB_URI
});

db.connect();

const recipesFltrKeyToClmnName = {
    author: "full_name",
    name: "name",
    maincategory: "main_cat_name",
    subcategory: "sub_cat_name",
    rating: "rating",
    id: "id",
    difficulty: "level"
};

/**
 * recipesFltrValToQryCode
 * Table abreviations for columns.
 */
// const recipesFltrValToQryCode = {
//     author: "a.",
//     full_name: "a.",
//     name: "r.",
//     maincategory: "m.",
//     subcategory: "s.",
//     rating: "rt.",
//     id: "r.",
//     difficulty: "d."
// };

/**
 * recipesColumnAbrv
 * Table abreviations for columns.
 */
const clmnNameToTblAbrev = {
    author: "a.",
    full_name: "a.",
    name: "r.",
    username: "usr.",
    main_cat_name: "m.",
    sub_cat_name: "s.",
    rating: "rt.",
    id: "r.",
    level: "d."
};

/**
 * tablesJoinAbrv
 * Table name and abreviation for table name.
 * JOIN authors a
 */
const tablesJoinAbrv = {
    authors: "authors a",
    units: "units u",
    ingredients: "ingredients in",
    main_category: "main_category m",
    sub_category: "sub_category s",
    difficulty: "difficulty d",
    recipes: "recipes r",
    recipes_ingredients: "recipes_ingredients ri",
    ratings: "ratings rt",
    users: "users usr",
    disliked_recipes: "disliked_recipes dis",
    liked_recipes: "liked_recipes lik",
    favorite_recipes: "favorite_recipes fr",
    view_later: "view_later vl",
    occasions: "occasions o",
    recipelists: "recipelists rl",
    recipelists_recipes: "recipelists_recipes rlr",
    tips: "tips t",
    reviews: "reviews rv",
    shoppinglists: "shoppinglists sl",
    shoppinglists_items: "shoppinglists_items sli",
    user_recipes: "user_recipes ur",
    user_recipes_ingredients: "user_recipes_ingredients uri"
};

/**
 * tablesJoinOnAbrv
 * Old name: tablesAndAbrv
 * Table abreviations for join equal to expressions.
 * r.author_id = a.id
 */
const tablesJoinOnAbrv = {
    authors: "a.",
    units: "u.",
    ingredients: "in.",
    main_category: "m.",
    sub_category: "s.",
    difficulty: "d.",
    recipes: "r.",
    recipes_ingredients: "ri.",
    ratings: "rt.",
    users: "usr.",
    disliked_recipes: "dis.",
    liked_recipes: "lik.",
    favorite_recipes: "fr.",
    view_later: "vl.",
    occasions: "o.",
    recipelists: "rl.",
    recipelists_recipes: "rlr.",
    tips: "t.",
    reviews: "rv.",
    shoppinglists: "sl.",
    shoppinglists_items: "sli.",
    user_recipes: "ur.",
    user_recipes_ingredients: "uri."
};

/**
 * sqlOperator
 * Sql operators for where query table columns
 * WHERE full_name ILIKE
 */
const sqlOperator = {
    full_name: "ILIKE",
    name: "ILIKE",
    main_cat_name: "ILIKE",
    sub_cat_name: "ILIKE",
    rating: "=",
    id: "=",
    username: "="
};

/**
 * sqlOperatorStrict
 * Strict sql operators for where query table columns
 * WHERE full_name =
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
    main_cat_name: "=",
    sub_cat_name: "=",
    rating: "=",
    id: "=",
    username: "="
};

/**
 * sqlCommandsObj
 * Sql commands for queries.
 * ex("select", ["name"]) => "SELECT name"
 */
const sqlCommandsObj = {
    select: "SELECT",
    insert: "INSERT INTO",
    update: "UPDATE"
};

/**
 * sqlCommandsModifsObj
 * Sql modifyer commands for queries.
 * ex("select", ["name"]) => "SELECT name FROM"
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
const recipesRelDataSelectColumns = [
    "r.id", "r.name", "a.full_name AS author", "rt.rating",
    "rt.vote_count", "r.url", "r.image", "r.description",
    "r.serves", "d.level", "m.main_cat_name", "s.sub_cat_name",
    "r.steps", "r.prep_time", "r.cook_time"
];

/**
 * selectLikRecUsrId
 * Select column names to query user id from liked_recipes table.
 */
const selectLikRecUsrId = [
    "lik.user_id AS liked_user_id"
];

/**
 * selectDisRecUsrId
 * Select column names to query user id from disliked_recipes table.
 */
const selectDisRecUsrId = [
    "dis.user_id AS disliked_user_id"
];

const orderByChron = {
    asc: "ASC",
    desc: "DESC"
};

const recipesOnData = [
    ["authors", "author_id", "id"],
    ["ratings", "id", "recipe_id"],
    ["difficulty", "difficulty_id", "id"],
    ["main_category", "main_category_id", "id"],
    ["sub_category", "sub_category_id", "id"]
];

const likRecipeJoinData = [
    ["liked_recipes", "id", "recipe_id"]
];

const disRecipeJoinData = [
    ["disliked_recipes", "id", "recipe_id"]
];

const recipeQryFilterKeys = new Set();
        recipeQryFilterKeys.add("name").add("author").add("rating")
        .add("orderBy").add("orderBy2").add("mainCategory").add("subCategory");

const recipeFilterKeys = new Set();
        recipeFilterKeys.add("name").add("author").add("rating")
        .add("mainCategory").add("subCategory");

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
    db, BCRYPT_WORK_FACTOR,
    recipesFltrKeyToClmnName,
    clmnNameToTblAbrev, sqlOperator, sqlOperatorStrict,
    sqlCommandsObj, sqlCommandsModifsObj,
    recipesRelDataSelectColumns, selectLikRecUsrId,
    selectDisRecUsrId,
    orderByChron, recipeQryFilterKeys,
    recipeFilterKeys, orderByKeys,
    isNumbers,
    likRecipeJoinData,
    disRecipeJoinData, userSqlReturnNoAbrv,
    tablesJoinAbrv, tablesJoinOnAbrv,
    recipesOnData
};