const express = require("express");
const ExpressError = require("../models/error.js");
const router = new express.Router();
const User = require("../models/users.js");
const Recipe = require("../models/recipes.js");
const { validateSchema, hashPassword } = require("../helpers/users.js");
const { rowExists } = require("../helpers/sql.js");
const { isLoggedIn } = require("../middleware/auth.js");

/**
 * "/register"
 * route type: POST
 * Authorization: none
 * Returns object of submitted data,
 * and token
 */
router.post("/register", async (req, res, next) => {
    try {
        const data = req.body;
        const user = await User.register(data);
        return res.status(201).json([
            user
        ]);
    } catch (err) {
        return next(err);
    }
});

/**
 * "/login"
 * route type: POST
 * Authorization: none
 * Returns token.
 */
router.post("/login", async (req, res, next) => {
    try {
        const data = req.body;
        const user = await User.login(data);
        return res.status(200).json([{ user }]);
    } catch (err) {
        return next(err);
    }
});

/**
 * "/:username"
 * route type: GET
 * Authorization: logged in
 * Returns user.
 */
router.get("/:username", isLoggedIn, async (req, res, next) => {
    try {
        const { username } = req.params;
        const user = await User.getUser(username);
        return res.status(200).json([{
            user
        }]);
    } catch (err) {
        return next(err);
    }
});

/**
 * "/username"
 * route type: PATCH
 * Authorization: logged in
 * Returns updated user data.
 */
router.patch("/:username", isLoggedIn, async (req, res, next) => {
    try {
        const { username } = req.params;
        const data = req.body;
        const user = await User.editUser(data, username);
        return res.status(200).json([
            {
                user
            }
        ]);
    } catch (err) {
        return next(err);
    }
});

/**
 * "/username"
 * route type: DELETE
 * Authorization: logged in
 * Returns deleted message.
 */
router.delete("/:username", isLoggedIn, async (req, res, next) => {
    try {
        const { username } = req.params;
        const user = await User.deleteUser(username);
        return res.status(200).json([{
            message: `Deleted ${username}!`
        }]);
    } catch (err) {
        return next(err);
    }
});

/**
 * "/:id/favorite-recipes"
 * route type: GET
 * Authorization: logged in
 * Returns favorited recipes.
 */
router.get("/:id/favorite-recipes", isLoggedIn, async (req, res, next) => {
    try {
        const { id } = req.params;
        const favRecipes = await User.getFavRecipes(id);
        return res.status(200).json(favRecipes);
    } catch (err) {
        return next(err);
    }
});

/**
 * "/:id/favorite-recipes"
 * route type: POST
 * Authorization: logged in
 * Returns message.
 */
router.post("/:id/favorite-recipes", isLoggedIn, async (req, res, next) => {
    try {
        const { id } = req.params;
        const qry = req.body;
        const favMsg = await User.favOrSavRecipe(id, qry);
        return res.status(200).json(favMsg);
    } catch (err) {
        return next(err);
    }
});

/**
 * "/:id/favorite-recipes/:recipe_id"
 * route type: GET
 * Authorization: logged in
 * Returns favorited recipe.
 */
router.get("/:id/favorite-recipes/:recipe_id", isLoggedIn, async (req, res, next) => {
    try {
        const { id, recipe_id } = req.params;
        const favRecipe = await User.getFavRecipes(id, recipe_id);
        return res.status(200).json(favRecipe);
    } catch (err) {
        return next(err);
    }
});

/**
 * "/:id/saved-recipes"
 * route type: GET
 * Authorization: logged in
 * Returns saved recipes.
 */
router.get("/:id/saved-recipes", isLoggedIn, async (req, res, next) => {
    try {
        const { id } = req.params;
        const savedRecipes = await User.getSavedRecipes(id);
        return res.status(200).json(savedRecipes);
    } catch (err) {
        return next(err);
    }
});

/**
 * "/:id/saved-recipes"
 * route type: POST
 * Authorization: logged in
 * Returns message.
 */
router.post("/:id/saved-recipes", isLoggedIn, async (req, res, next) => {
    try {
        const { id } = req.params;
        const qry = req.body;
        const savMsg = await User.favOrSavRecipe(id, qry, false);
        return res.status(200).json(savMsg);
    } catch (err) {
        return next(err);
    }
});

/**
 * "/:id/saved-recipes/:recipe_id"
 * route type: GET
 * Authorization: logged in
 * Returns saved recipes.
 */
router.get("/:id/saved-recipes/:recipe_id", isLoggedIn, async (req, res, next) => {
    try {
        const { id, recipe_id } = req.params;
        const savedRecipe = await User.getSavedRecipes(id, recipe_id);
        return res.status(200).json(savedRecipe);
    } catch (err) {
        return next(err);
    }
});

/**
 * "/:id/recipelists"
 * route type: GET
 * Authorization: logged in
 * Returns recipelists.
 */
router.get("/:id/recipelists", isLoggedIn, async (req, res, next) => {
    try {
        const { id } = req.params;
        const recipeLists = await User.getRecipeLists(id);
        return res.status(200).json(recipeLists);
    } catch(err) {
        return next(err);
    }
});

/**
 * "/:id/recipelists/:list_id"
 * route type: GET
 * Authorization: logged in
 * Returns recipelist recipes.
 */
router.get("/:id/recipelists/:list_id", isLoggedIn, async (req, res, next) => {
    try {
        const { id, list_id } = req.params;
        const recipes = await User.getListRecipes(id, list_id);
        return res.status(200).json(recipes);
    } catch(err) {
        return next(err);
    }
});

/**
 * "/:id/recipelists/:list_id/:recipe_id"
 * route type: GET
 * Authorization: logged in
 * Returns recipe from recipelist recipes.
 */
router.get("/:id/recipelists/:list_id/:recipe_id", isLoggedIn, async (req, res, next) => {
    try {
        const { id, list_id, recipe_id } = req.params;
        await rowExists("user", "id", "users", [["id", +id]]);
        await rowExists("list", "id", "recipelists", [["id", +list_id]]);
        const clmnsNvals = [["list_id", +list_id], ["recipe_id", +recipe_id]];
        const tableName = "recipelists_recipes";
        await rowExists("recipe", "id", tableName, clmnsNvals);
        const recipe = await Recipe.getRecipe(recipe_id);
        return res.status(200).json([recipe]);
    } catch(err) {
        return next(err);
    }
});

/**
 * "/:id/shoppinglists"
 * route type: GET
 * Authorization: logged in
 * Returns shoppinglists.
 */
router.get("/:id/shoppinglists", isLoggedIn, async (req, res, next) => {
    try {
        const { id } = req.params;
        const lists = await User.getShopLists(id);
        return res.status(200).json(lists);
    } catch(err) {
        return next(err);
    }
});

/**
 * "/:id/shoppinglists/:list_id"
 * route type: GET
 * Authorization: logged in
 * Returns shoppinglist items.
 */
router.get("/:id/shoppinglists/:list_id", isLoggedIn, async (req, res, next) => {
    try {
        const { id, list_id } = req.params;
        const lists = await User.shopListsItems(id, list_id);
        return res.status(200).json(lists);
    } catch(err) {
        return next(err);
    }
});

/**
 * "/:id/recipes"
 * route type: GET
 * Authorization: logged in
 * Returns users recipes.
 */
router.get("/:id/recipes", isLoggedIn, async (req, res, next) => {
    try {
        const { id } = req.params;
        const lists = await User.recipes(id);
        return res.status(200).json(lists);
    } catch(err) {
        return next(err);
    }
});

/**
 * "/:user_id/recipes/:id"
 * route type: GET
 * Authorization: logged in
 * Returns user's recipe.
 */
router.get("/:user_id/recipes/:id", isLoggedIn, async (req, res, next) => {
    try {
        const { user_id, id } = req.params;
        const lists = await User.recipe(user_id, id);
        return res.status(200).json(lists);
    } catch(err) {
        return next(err);
    }
});


module.exports = router;