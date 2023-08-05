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

const tableAbrv = {
    author: "a.",
    full_name: "a.",
    name: "r.",
    main_category: "m.",
    sub_category: "s.",
    rating: "rt.",
    id: "r.",
    difficulty: "d.",
    disliked_recipes: "dis.",
    liked_recipes: "lik."
};

const sqlOperator = {
    full_name: "ILIKE",
    name: "ILIKE",
    main_category: "ILIKE",
    sub_category: "ILIKE",
    rating: "=",
    id: "="
};
// No comma on last value, it will cause a query error.
const allRecipesSelect = [
    "r.id,", "r.name,", "a.full_name AS author,", "rt.rating,",
    "rt.vote_count,", "r.url,", "r.image,", "r.description,",
    "r.serves,", "d.level,", "m.main_cat_name,", "s.sub_cat_name,",
    "r.steps,", "r.prep_time,", "r.cook_time"
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

const recipeJoinData = [
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

const filterKeys = new Set();
        filterKeys.add("name").add("author").add("rating");

const orderByKeys = new Set();
        orderByKeys.add("orderby").add("orderby2").add("chronorder");

const selectRecipesColumns = new Set();
        selectRecipesColumns.add("name").add("author").add("rating").add("id");

const isNumbers = new Set();
        isNumbers.add("recipe_id").add("user_id").add("rating")
        .add("id").add("vote_count");

module.exports = {
    db, BCRYPT_WORK_FACTOR, columnNameCvrs,
    tableAbrv, sqlOperator,
    allRecipesSelect, selectLikRecUsrId,
    selectDisRecUsrId,
    orderByChron, recipeQryFilterKeys,
    filterKeys, orderByKeys,
    selectRecipesColumns, isNumbers,
    recipeJoinData, likRecipeJoinData,
    disRecipeJoinData
};