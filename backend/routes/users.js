const express = require("express");
const ExpressError = require("../models/error.js");
const router = new express.Router();
const User = require("../models/users.js");
const Recipe = require("../models/recipes.js");
const { validateSchema, hashPassword } = require("../helpers/users.js");
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
 * "/:id/recipelists"
 * route type: GET
 * Authorization: logged in
 * Returns recipelists.
 */
router.get("/:id/recipelists", isLoggedIn, async (req, res, next) => {
    const { id } = req.params;
    const recipeLists = await User.getRecipeLists(id);
    return res.status(200).json(recipeLists);
});

/**
 * "/:id/recipelists/:list_id/recipes"
 * route type: GET
 * Authorization: logged in
 * Returns recipelist recipes.
 */
router.get("/:id/recipelists/:list_id/recipes", isLoggedIn, async (req, res, next) => {
    const { id, list_id } = req.params;
    const recipes = await User.getListRecipes(id, list_id);
    return res.status(200).json(recipes);
});

/**
 * "/:id/recipelists/:list_id/recipes/:recipe_id"
 * route type: GET
 * Authorization: logged in
 * Returns recipe from recipelist recipes.
 */
router.get("/:id/recipelists/:list_id/recipes/:recipe_id", isLoggedIn, async (req, res, next) => {
    const { recipe_id } = req.params;
    const recipe = await Recipe.getRecipe(recipe_id);
    return res.status(200).json(recipe);
});


module.exports = router;