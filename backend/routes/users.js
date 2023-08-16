const express = require("express");
const ExpressError = require("../models/error.js");
const router = new express.Router();
const User = require("../models/users.js");
const Recipe = require("../models/recipes.js");
const { validateSchema, hashPassword } = require("../helpers/users.js");
const { rowExists } = require("../helpers/sql.js");
const { isLoggedIn } = require("../middleware/auth.js");
const favSavRecipeSchema = require("../schemas/favSavRecipe.json");
const recipeListsSchema = require("../schemas/recipeLists.json");
const shopListsSchema = require("../schemas/shopLists.json");
const recipesSchema = require("../schemas/userRecipes.json");
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
        const { recipe_id } = req.body;
        const qry = {recipe_id, user_id: +id};
        const msg = "Favorited recipe!";
        const favMsg = await User.insertRow("favorite_recipes", qry, favSavRecipeSchema, false, msg);
        return res.status(201).json(favMsg);
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
 * "/:id/favorite-recipes/:recipe_id"
 * Deletes favorited recipe.
 * route type: DELETE
 * Authorization: logged in
 * Returns deleted message.
 */
router.delete("/:id/favorite-recipes/:recipe_id", isLoggedIn, async (req, res, next) => {
    try {
        const { id, recipe_id } = req.params;
        const msg = "Deleted recipe from favorites!"
        const clmnNameValObj = { user_id: +id,  recipe_id: +recipe_id };
        const deletedMsg = await User.deleteRow("favorite_recipes", clmnNameValObj, msg);
        return res.status(200).json(deletedMsg);
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
        const { id: user_id } = req.params;
        const { recipe_id } = req.body;
        const qry = {recipe_id, user_id: +user_id};
        const msg = "Saved recipe!";
        const savMsg = await User.insertRow("saved_recipes", qry, favSavRecipeSchema, false, msg);
        return res.status(201).json(savMsg);
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
 * "/:id/saved-recipes/:recipe_id"
 * Deletes saved recipe.
 * route type: DELETE
 * Authorization: logged in
 * Returns deleted message.
 */
router.delete("/:id/saved-recipes/:recipe_id", isLoggedIn, async (req, res, next) => {
    try {
        const { id, recipe_id } = req.params;
        const msg = "Deleted recipe from saved recipes!"
        const clmnNameValObj = { user_id: +id,  recipe_id: +recipe_id };
        const deletedMsg = await User.deleteRow("saved_recipes", clmnNameValObj, msg);
        return res.status(200).json(deletedMsg);
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
 * "/:id/recipelists"
 * route type: POST
 * Authorization: logged in
 * Returns recipelist.
 */
router.post("/:id/recipelists", isLoggedIn, async (req, res, next) => {
    try {
        const { id } = req.params;
        const { user_id, occasion_id, list_name } = req.body;
        const data = { user_id, occasion_id, list_name };
        const returnClmns = ["id"];
        const listRes = await User.insertRow("recipelists", data, recipeListsSchema, returnClmns);
        const { id: listId } = listRes.rows[0];
        const list = await User.getRecipeLists(user_id, listId);
        return res.status(201).json(list[0]);
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
 * "/:id/recipelists/:list_id"
 * Deletes recipelist.
 * route type: DELETE
 * Authorization: logged in
 * Returns deleted message.
 */
router.delete("/:id/recipelists/:list_id", isLoggedIn, async (req, res, next) => {
    try {
        const { id, list_id } = req.params;
        const msg = "Deleted recipelist from user's recipelists!"
        const clmnNameValObj = { user_id: +id,  id: +list_id };
        const deletedMsg = await User.deleteRow("recipelists", clmnNameValObj, msg);
        return res.status(200).json(deletedMsg);
    } catch (err) {
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
 * "/:id/recipelists/:list_id/:recipe_id"
 * Deletes recipelist recipe.
 * route type: DELETE
 * Authorization: logged in
 * Returns deleted message.
 */
router.delete("/:id/recipelists/:list_id/:recipe_id", isLoggedIn, async (req, res, next) => {
    try {
        const { list_id, recipe_id } = req.params;
        const msg = "Deleted recipelist from user's recipelists!"
        const clmnNameValObj = { list_id: +list_id,  recipe_id: +recipe_id };
        const deletedMsg = await User.deleteRow("recipelists_recipes", clmnNameValObj, msg);
        return res.status(200).json(deletedMsg);
    } catch (err) {
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
 * "/:id/shoppinglists"
 * route type: POST
 * Authorization: logged in
 * Returns shoppinglist.
 */
router.post("/:id/shoppinglists", isLoggedIn, async (req, res, next) => {
    try {
        const { id: user_id } = req.params;
        const { recipe_id, list_name } = req.body;
        const data = { user_id: +user_id, recipe_id, list_name };
        const returnClmns = ["id"];
        const listRes = await User.insertRow("shoppinglists", data, shopListsSchema, returnClmns);
        const { id: listId } = listRes.rows[0];
        const list = await User.getShopLists(+user_id, listId);
        return res.status(201).json(list[0]);
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
 * "/:id/shoppinglists/:list_id"
 * Deletes shoppinglist.
 * route type: DELETE
 * Authorization: logged in
 * Returns deleted message.
 */
router.delete("/:id/shoppinglists/:list_id", isLoggedIn, async (req, res, next) => {
    try {
        const { id: user_id, list_id } = req.params;
        const msg = "Deleted shoppinglist from user's shoppinglists!"
        const clmnNameValObj = { user_id: +user_id, id: +list_id };
        const deletedMsg = await User.deleteRow("shoppinglists", clmnNameValObj, msg);
        return res.status(200).json(deletedMsg);
    } catch (err) {
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
 * "/:id/recipes"
 * route type: POST
 * Authorization: logged in
 * Returns user recipe.
 */
router.post("/:id/recipes", isLoggedIn, async (req, res, next) => {
    try {
        const { id: user_id } = req.params;
        const { recipe_name } = req.body;
        const data = { user_id: +user_id, recipe_name };
        const returnClmns = ["id"];
        const listRes = await User.insertRow("user_recipes", data, recipesSchema, returnClmns);
        const { id: listId } = listRes.rows[0];
        const list = await User.recipe(+user_id, listId);
        return res.status(201).json(list);
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

/**
 * "/:user_id/recipes/:id"
 * Deletes user recipe.
 * route type: DELETE
 * Authorization: logged in
 * Returns deleted message.
 */
router.delete("/:user_id/recipes/:id", isLoggedIn, async (req, res, next) => {
    try {
        const { user_id, id } = req.params;
        const msg = "Deleted recipe from user's recipes!"
        const clmnNameValObj = { user_id: +user_id, id: +id };
        const deletedMsg = await User.deleteRow("user_recipes", clmnNameValObj, msg);
        return res.status(200).json(deletedMsg);
    } catch (err) {
        return next(err);
    }
});


module.exports = router;