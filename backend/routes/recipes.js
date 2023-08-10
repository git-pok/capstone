const express = require("express");
const ExpressError = require("../models/error.js");
const router = new express.Router();
const Recipe = require("../models/recipes.js");
const { isLoggedIn } = require("../middleware/auth.js");
const { isFilter } = require("../helpers/recipes.js");

/**
 * "/:id"
 * route type: GET
 * Authorization: logged in
 * Returns recipe.
 */
router.get("/:id", isLoggedIn, async (req, res, next) => {
    try {
        const { id } = req.params;
        const recipe = await Recipe.getRecipe(id);
        return res.status(200).json([
            recipe
        ]);
    } catch (err) {
        return next(err);
    }
});

/**
 * "/"
 * route type: GET
 * Authorization: logged in
 * Returns recipes.
 */
router.get("/", isLoggedIn, async (req, res, next) => {
    try {
        const qry = req.query;
        const filterExists = isFilter(qry);
        const recipes = filterExists ? await Recipe.recipesFilter(qry) : await Recipe.getRecipes();
        return res.status(200).json(
            recipes
        );
    } catch (err) {
        return next(err);
    }
});

/**
 * "/favorites/:user_id"
 * route type: GET
 * Authorization: logged in
 * Returns favorited recipes.
 */
router.get("/favorites/:user_id", isLoggedIn, async (req, res, next) => {
    try {
        const { user_id } = req.params;
        const favRecipes = await Recipe.getFavRecipes(user_id);
        return res.status(200).json(favRecipes);
    } catch (err) {
        return next(err);
    }
});


/**
 * "/saved/:user_id"
 * route type: GET
 * Authorization: logged in
 * Returns saved recipes.
 */
router.get("/saved/:user_id", isLoggedIn, async (req, res, next) => {
    try {
        const { user_id } = req.params;
        const favRecipes = await Recipe.getSavedRecipes(user_id);
        return res.status(200).json(favRecipes);
    } catch (err) {
        return next(err);
    }
});



module.exports = router;